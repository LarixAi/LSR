-- Phase 3: Advanced Caching & Query Optimization (Fixed)
-- Create materialized views for expensive queries
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_fleet_overview AS
SELECT 
  v.organization_id,
  COUNT(*) as total_vehicles,
  COUNT(*) FILTER (WHERE v.is_active = true) as active_vehicles,
  COUNT(*) FILTER (WHERE v.status = 'in_maintenance') as in_maintenance,
  COUNT(*) FILTER (WHERE EXISTS (
    SELECT 1 FROM public.maintenance_records mr 
    WHERE mr.vehicle_id = v.id 
    AND mr.next_service_date < CURRENT_DATE
  )) as maintenance_due,
  COALESCE(SUM(fc.amount), 0) as total_costs_last_30_days,
  AVG(CASE WHEN v.mileage > 0 THEN v.mileage ELSE NULL END) as avg_mileage
FROM public.vehicles v
LEFT JOIN public.fleet_costs fc ON fc.vehicle_id = v.id 
  AND fc.date_incurred >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY v.organization_id;

-- Create unique index for materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_fleet_overview_org 
ON public.mv_fleet_overview (organization_id);

-- Create driver performance materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_driver_performance AS
SELECT 
  p.id as driver_id,
  p.organization_id,
  p.first_name || ' ' || p.last_name as driver_name,
  COUNT(j.id) as total_jobs,
  COUNT(j.id) FILTER (WHERE j.status = 'completed') as completed_jobs,
  COUNT(j.id) FILTER (WHERE j.status = 'cancelled') as cancelled_jobs,
  ROUND(
    (COUNT(j.id) FILTER (WHERE j.status = 'completed')::decimal / 
     NULLIF(COUNT(j.id), 0) * 100), 2
  ) as completion_rate,
  COUNT(cv.id) as violation_count,
  COALESCE(dcs.overall_score, 0) as compliance_score,
  COUNT(j.id) FILTER (WHERE j.created_at >= CURRENT_DATE - INTERVAL '30 days') as jobs_last_30_days
FROM public.profiles p
LEFT JOIN public.jobs j ON j.assigned_driver_id = p.id
LEFT JOIN public.compliance_violations cv ON cv.driver_id = p.id 
  AND cv.created_at >= CURRENT_DATE - INTERVAL '90 days'
LEFT JOIN public.driver_compliance_scores dcs ON dcs.driver_id = p.id
  AND dcs.score_date = (
    SELECT MAX(score_date) FROM public.driver_compliance_scores 
    WHERE driver_id = p.id
  )
WHERE p.role = 'driver' AND p.is_active = true
GROUP BY p.id, p.organization_id, p.first_name, p.last_name, dcs.overall_score;

-- Create unique index for driver performance view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_driver_performance_driver 
ON public.mv_driver_performance (driver_id);

-- Create query statistics table for monitoring
CREATE TABLE IF NOT EXISTS public.query_performance_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash TEXT NOT NULL,
  query_type TEXT NOT NULL,
  execution_time_ms INTEGER NOT NULL,
  rows_returned INTEGER,
  organization_id UUID REFERENCES public.organizations(id),
  user_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create cache invalidation table
CREATE TABLE IF NOT EXISTS public.cache_invalidation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL,
  invalidated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  reason TEXT,
  organization_id UUID REFERENCES public.organizations(id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_query_performance_hash_time 
ON public.query_performance_stats (query_hash, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cache_invalidation_key_time 
ON public.cache_invalidation (cache_key, invalidated_at DESC);

-- Create optimized indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_jobs_org_status_date_composite 
ON public.jobs (organization_id, status, start_date DESC, assigned_driver_id) 
WHERE start_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_vehicles_org_active_maintenance 
ON public.vehicles (organization_id, is_active, status);

CREATE INDEX IF NOT EXISTS idx_messages_org_receiver_unread 
ON public.messages (organization_id, receiver_id, created_at DESC) 
WHERE read_status = false;

-- Enable RLS
ALTER TABLE public.query_performance_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cache_invalidation ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view organization query stats" 
ON public.query_performance_stats 
FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can manage organization cache invalidation" 
ON public.cache_invalidation 
FOR ALL 
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);