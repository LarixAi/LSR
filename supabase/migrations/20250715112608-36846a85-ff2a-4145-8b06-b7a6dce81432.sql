-- Phase 4: CI/CD & Testing Pipeline
-- Create test data management tables
CREATE TABLE IF NOT EXISTS public.test_data_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  snapshot_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create performance test results table
CREATE TABLE IF NOT EXISTS public.performance_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_name TEXT NOT NULL,
  test_type TEXT NOT NULL, -- 'load', 'stress', 'spike', 'volume'
  organization_id UUID REFERENCES public.organizations(id),
  execution_time_ms INTEGER NOT NULL,
  memory_usage_mb NUMERIC,
  cpu_usage_percent NUMERIC,
  requests_per_second NUMERIC,
  error_rate_percent NUMERIC,
  test_config JSONB NOT NULL DEFAULT '{}',
  results_data JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'completed', -- 'running', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create automated test schedules table
CREATE TABLE IF NOT EXISTS public.automated_test_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  test_type TEXT NOT NULL,
  cron_expression TEXT NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  test_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Create error tracking table
CREATE TABLE IF NOT EXISTS public.error_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_hash TEXT NOT NULL, -- Hash of error for grouping
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  user_id UUID REFERENCES public.profiles(id),
  organization_id UUID REFERENCES public.organizations(id),
  request_url TEXT,
  request_method TEXT,
  user_agent TEXT,
  ip_address INET,
  environment TEXT NOT NULL DEFAULT 'production',
  severity TEXT NOT NULL DEFAULT 'error', -- 'info', 'warning', 'error', 'critical'
  count INTEGER NOT NULL DEFAULT 1,
  first_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES public.profiles(id),
  metadata JSONB NOT NULL DEFAULT '{}'
);

-- Create deployment tracking table
CREATE TABLE IF NOT EXISTS public.deployment_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL,
  environment TEXT NOT NULL,
  deployment_type TEXT NOT NULL, -- 'frontend', 'backend', 'database'
  status TEXT NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'success', 'failed', 'rolled_back'
  deployed_by UUID REFERENCES public.profiles(id),
  organization_id UUID REFERENCES public.organizations(id),
  deployment_config JSONB NOT NULL DEFAULT '{}',
  deployment_logs TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  rollback_at TIMESTAMP WITH TIME ZONE,
  health_check_status TEXT, -- 'passed', 'failed', 'pending'
  performance_impact JSONB DEFAULT '{}'
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_test_data_snapshots_org_active 
ON public.test_data_snapshots (organization_id, is_active);

CREATE INDEX IF NOT EXISTS idx_performance_test_results_org_type_date 
ON public.performance_test_results (organization_id, test_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_automated_test_schedules_active_next_run 
ON public.automated_test_schedules (is_active, next_run_at);

CREATE INDEX IF NOT EXISTS idx_error_tracking_hash_env 
ON public.error_tracking (error_hash, environment);

CREATE INDEX IF NOT EXISTS idx_error_tracking_org_severity_date 
ON public.error_tracking (organization_id, severity, last_seen_at DESC);

CREATE INDEX IF NOT EXISTS idx_deployment_tracking_env_status_date 
ON public.deployment_tracking (environment, status, started_at DESC);

-- Enable RLS
ALTER TABLE public.test_data_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automated_test_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployment_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage organization test data" 
ON public.test_data_snapshots 
FOR ALL 
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can view organization performance tests" 
ON public.performance_test_results 
FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Admins can manage test schedules" 
ON public.automated_test_schedules 
FOR ALL 
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  )
);

CREATE POLICY "Users can view organization errors" 
ON public.error_tracking 
FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can view organization deployments" 
ON public.deployment_tracking 
FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Create functions for testing pipeline
CREATE OR REPLACE FUNCTION public.create_test_snapshot(
  p_name TEXT,
  p_description TEXT DEFAULT NULL,
  p_tables TEXT[] DEFAULT ARRAY['profiles', 'vehicles', 'jobs']
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  snapshot_id UUID;
  user_org_id UUID;
  snapshot_data JSONB := '{}';
  table_name TEXT;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO user_org_id
  FROM public.profiles WHERE id = auth.uid();
  
  -- Build snapshot data
  FOREACH table_name IN ARRAY p_tables
  LOOP
    EXECUTE format('
      SELECT jsonb_set($1, $2, 
        COALESCE(
          (SELECT jsonb_agg(row_to_json(t)) FROM (
            SELECT * FROM public.%I 
            WHERE organization_id = $3 
            LIMIT 100
          ) t), 
          ''[]''::jsonb
        )
      )', table_name) 
    USING snapshot_data, ARRAY[table_name], user_org_id
    INTO snapshot_data;
  END LOOP;
  
  -- Insert snapshot
  INSERT INTO public.test_data_snapshots (
    name, description, organization_id, snapshot_data, created_by
  ) VALUES (
    p_name, p_description, user_org_id, snapshot_data, auth.uid()
  ) RETURNING id INTO snapshot_id;
  
  RETURN snapshot_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.track_error(
  p_error_type TEXT,
  p_error_message TEXT,
  p_stack_trace TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  error_id UUID;
  error_hash TEXT;
  user_org_id UUID;
  existing_error UUID;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO user_org_id
  FROM public.profiles WHERE id = auth.uid();
  
  -- Create error hash for grouping
  error_hash := encode(digest(p_error_type || p_error_message, 'sha256'), 'hex');
  
  -- Check if error already exists
  SELECT id INTO existing_error
  FROM public.error_tracking
  WHERE error_hash = track_error.error_hash
    AND organization_id = user_org_id
    AND resolved_at IS NULL;
  
  IF existing_error IS NOT NULL THEN
    -- Update existing error
    UPDATE public.error_tracking
    SET count = count + 1,
        last_seen_at = NOW(),
        metadata = p_metadata
    WHERE id = existing_error;
    
    RETURN existing_error;
  ELSE
    -- Create new error record
    INSERT INTO public.error_tracking (
      error_hash, error_type, error_message, stack_trace,
      user_id, organization_id, metadata
    ) VALUES (
      error_hash, p_error_type, p_error_message, p_stack_trace,
      auth.uid(), user_org_id, p_metadata
    ) RETURNING id INTO error_id;
    
    RETURN error_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_performance_test(
  p_test_name TEXT,
  p_test_type TEXT,
  p_execution_time_ms INTEGER,
  p_config JSONB DEFAULT '{}',
  p_results JSONB DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  test_id UUID;
  user_org_id UUID;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO user_org_id
  FROM public.profiles WHERE id = auth.uid();
  
  INSERT INTO public.performance_test_results (
    test_name, test_type, organization_id, execution_time_ms,
    test_config, results_data
  ) VALUES (
    p_test_name, p_test_type, user_org_id, p_execution_time_ms,
    p_config, p_results
  ) RETURNING id INTO test_id;
  
  RETURN test_id;
END;
$$;

-- Create triggers for automated updates
CREATE OR REPLACE FUNCTION public.update_test_schedules_next_run()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Update next_run_at based on cron expression (simplified)
  -- In a real implementation, you'd use a proper cron parser
  IF NEW.cron_expression = '0 0 * * *' THEN -- Daily
    NEW.next_run_at := (CURRENT_DATE + INTERVAL '1 day')::timestamp with time zone;
  ELSIF NEW.cron_expression = '0 * * * *' THEN -- Hourly
    NEW.next_run_at := (date_trunc('hour', NOW()) + INTERVAL '1 hour');
  ELSE
    NEW.next_run_at := NOW() + INTERVAL '1 hour'; -- Default to hourly
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_test_schedules_next_run_trigger
  BEFORE INSERT OR UPDATE ON public.automated_test_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_test_schedules_next_run();