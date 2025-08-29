-- Phase 5: Monitoring Dashboard Schema
-- Create system metrics table for real-time monitoring
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT NOT NULL, -- 'ms', 'mb', 'percent', 'count', etc.
  organization_id UUID REFERENCES public.organizations(id),
  environment TEXT NOT NULL DEFAULT 'production',
  tags JSONB NOT NULL DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create alert rules table
CREATE TABLE IF NOT EXISTS public.alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  metric_name TEXT NOT NULL,
  condition_operator TEXT NOT NULL, -- 'gt', 'lt', 'eq', 'gte', 'lte'
  threshold_value NUMERIC NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning', -- 'info', 'warning', 'error', 'critical'
  organization_id UUID REFERENCES public.organizations(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  notification_channels JSONB NOT NULL DEFAULT '[]', -- ['email', 'slack', 'sms']
  cooldown_minutes INTEGER NOT NULL DEFAULT 15,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Create alert instances table
CREATE TABLE IF NOT EXISTS public.alert_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_rule_id UUID REFERENCES public.alert_rules(id) ON DELETE CASCADE,
  metric_value NUMERIC NOT NULL,
  threshold_value NUMERIC NOT NULL,
  severity TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'resolved', 'silenced'
  organization_id UUID REFERENCES public.organizations(id),
  triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES public.profiles(id),
  notification_sent BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'
);

-- Create dashboard configurations table
CREATE TABLE IF NOT EXISTS public.dashboard_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  layout JSONB NOT NULL DEFAULT '{}', -- Widget layout and positions
  widgets JSONB NOT NULL DEFAULT '[]', -- Widget configurations
  organization_id UUID REFERENCES public.organizations(id),
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  shared_with JSONB NOT NULL DEFAULT '[]', -- User IDs with access
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create uptime monitoring table
CREATE TABLE IF NOT EXISTS public.uptime_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  service_url TEXT NOT NULL,
  check_type TEXT NOT NULL DEFAULT 'http', -- 'http', 'tcp', 'ping'
  organization_id UUID REFERENCES public.organizations(id),
  status TEXT NOT NULL DEFAULT 'unknown', -- 'up', 'down', 'degraded', 'unknown'
  response_time_ms INTEGER,
  status_code INTEGER,
  error_message TEXT,
  last_check_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  next_check_at TIMESTAMP WITH TIME ZONE,
  check_interval_minutes INTEGER NOT NULL DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add indexes for monitoring performance
CREATE INDEX IF NOT EXISTS idx_system_metrics_name_time 
ON public.system_metrics (metric_name, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_system_metrics_org_env_time 
ON public.system_metrics (organization_id, environment, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_alert_rules_active_metric 
ON public.alert_rules (is_active, metric_name);

CREATE INDEX IF NOT EXISTS idx_alert_instances_rule_status_time 
ON public.alert_instances (alert_rule_id, status, triggered_at DESC);

CREATE INDEX IF NOT EXISTS idx_uptime_monitoring_service_time 
ON public.uptime_monitoring (service_name, last_check_at DESC);

CREATE INDEX IF NOT EXISTS idx_uptime_monitoring_next_check 
ON public.uptime_monitoring (is_active, next_check_at);

-- Enable RLS
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uptime_monitoring ENABLE ROW LEVEL SECURITY;

-- Create policies for monitoring tables
CREATE POLICY "Users can view organization metrics" 
ON public.system_metrics 
FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Admins can manage alert rules" 
ON public.alert_rules 
FOR ALL 
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Users can view organization alerts" 
ON public.alert_instances 
FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can manage their dashboards" 
ON public.dashboard_configs 
FOR ALL 
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ) OR 
  created_by = auth.uid() OR 
  is_public = true
);

CREATE POLICY "Users can view organization uptime monitoring" 
ON public.uptime_monitoring 
FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Create monitoring functions
CREATE OR REPLACE FUNCTION public.record_metric(
  p_metric_name TEXT,
  p_metric_value NUMERIC,
  p_metric_unit TEXT,
  p_tags JSONB DEFAULT '{}',
  p_environment TEXT DEFAULT 'production'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  metric_id UUID;
  user_org_id UUID;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO user_org_id
  FROM public.profiles WHERE id = auth.uid();
  
  INSERT INTO public.system_metrics (
    metric_name, metric_value, metric_unit, organization_id,
    environment, tags
  ) VALUES (
    p_metric_name, p_metric_value, p_metric_unit, user_org_id,
    p_environment, p_tags
  ) RETURNING id INTO metric_id;
  
  -- Check alert rules
  PERFORM public.check_alert_rules(p_metric_name, p_metric_value);
  
  RETURN metric_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_alert_rules(
  p_metric_name TEXT,
  p_metric_value NUMERIC
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  rule_record RECORD;
  should_trigger BOOLEAN;
  user_org_id UUID;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO user_org_id
  FROM public.profiles WHERE id = auth.uid();
  
  -- Check all active alert rules for this metric
  FOR rule_record IN 
    SELECT * FROM public.alert_rules 
    WHERE metric_name = p_metric_name 
      AND is_active = true
      AND organization_id = user_org_id
      AND (last_triggered_at IS NULL OR 
           last_triggered_at < NOW() - INTERVAL '1 minute' * cooldown_minutes)
  LOOP
    should_trigger := FALSE;
    
    CASE rule_record.condition_operator
      WHEN 'gt' THEN 
        should_trigger := p_metric_value > rule_record.threshold_value;
      WHEN 'gte' THEN 
        should_trigger := p_metric_value >= rule_record.threshold_value;
      WHEN 'lt' THEN 
        should_trigger := p_metric_value < rule_record.threshold_value;
      WHEN 'lte' THEN 
        should_trigger := p_metric_value <= rule_record.threshold_value;
      WHEN 'eq' THEN 
        should_trigger := p_metric_value = rule_record.threshold_value;
    END CASE;
    
    IF should_trigger THEN
      -- Create alert instance
      INSERT INTO public.alert_instances (
        alert_rule_id, metric_value, threshold_value, severity, organization_id
      ) VALUES (
        rule_record.id, p_metric_value, rule_record.threshold_value, 
        rule_record.severity, user_org_id
      );
      
      -- Update last triggered time
      UPDATE public.alert_rules 
      SET last_triggered_at = NOW()
      WHERE id = rule_record.id;
    END IF;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_metrics_summary(
  p_metric_names TEXT[],
  p_time_range_hours INTEGER DEFAULT 24
) RETURNS TABLE(
  metric_name TEXT,
  avg_value NUMERIC,
  min_value NUMERIC,
  max_value NUMERIC,
  last_value NUMERIC,
  data_points BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_org_id UUID;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO user_org_id
  FROM public.profiles WHERE id = auth.uid();
  
  RETURN QUERY
  SELECT 
    sm.metric_name,
    ROUND(AVG(sm.metric_value), 2) as avg_value,
    MIN(sm.metric_value) as min_value,
    MAX(sm.metric_value) as max_value,
    FIRST_VALUE(sm.metric_value) OVER (
      PARTITION BY sm.metric_name 
      ORDER BY sm.recorded_at DESC
    ) as last_value,
    COUNT(*) as data_points
  FROM public.system_metrics sm
  WHERE sm.organization_id = user_org_id
    AND sm.metric_name = ANY(p_metric_names)
    AND sm.recorded_at >= NOW() - INTERVAL '1 hour' * p_time_range_hours
  GROUP BY sm.metric_name;
END;
$$;