-- Phase 3: Advanced Caching & Query Optimization
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

-- Create index for organization lookups
CREATE INDEX IF NOT EXISTS idx_mv_driver_performance_org 
ON public.mv_driver_performance (organization_id, completion_rate DESC);

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

-- Add indexes for query performance stats
CREATE INDEX IF NOT EXISTS idx_query_performance_hash_time 
ON public.query_performance_stats (query_hash, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_query_performance_org_type 
ON public.query_performance_stats (organization_id, query_type, created_at DESC);

-- Enable RLS on query performance stats
ALTER TABLE public.query_performance_stats ENABLE ROW LEVEL SECURITY;

-- Create policy for query performance stats
CREATE POLICY "Users can view organization query stats" 
ON public.query_performance_stats 
FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Create function to refresh materialized views
CREATE OR REPLACE FUNCTION public.refresh_performance_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_fleet_overview;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_driver_performance;
  
  -- Log the refresh
  INSERT INTO public.audit_logs (
    table_name, record_id, action, changed_by, organization_id, notes
  ) VALUES (
    'materialized_views', gen_random_uuid(), 'REFRESH', 
    auth.uid(), 
    (SELECT organization_id FROM public.profiles WHERE id = auth.uid()), 
    'Materialized views refreshed'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log query performance
CREATE OR REPLACE FUNCTION public.log_query_performance(
  p_query_hash TEXT,
  p_query_type TEXT,
  p_execution_time_ms INTEGER,
  p_rows_returned INTEGER DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  user_org_id UUID;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO user_org_id
  FROM public.profiles WHERE id = auth.uid();
  
  INSERT INTO public.query_performance_stats (
    query_hash, query_type, execution_time_ms, rows_returned, 
    organization_id, user_id
  ) VALUES (
    p_query_hash, p_query_type, p_execution_time_ms, p_rows_returned,
    user_org_id, auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create cache invalidation table
CREATE TABLE IF NOT EXISTS public.cache_invalidation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL,
  invalidated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  reason TEXT,
  organization_id UUID REFERENCES public.organizations(id)
);

-- Add index for cache invalidation
CREATE INDEX IF NOT EXISTS idx_cache_invalidation_key_time 
ON public.cache_invalidation (cache_key, invalidated_at DESC);

-- Enable RLS on cache invalidation
ALTER TABLE public.cache_invalidation ENABLE ROW LEVEL SECURITY;

-- Create policy for cache invalidation
CREATE POLICY "Users can view organization cache invalidation" 
ON public.cache_invalidation 
FOR ALL 
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Create function to invalidate cache
CREATE OR REPLACE FUNCTION public.invalidate_cache(
  p_cache_keys TEXT[],
  p_reason TEXT DEFAULT 'Manual invalidation'
)
RETURNS INTEGER AS $$
DECLARE
  cache_key TEXT;
  invalidated_count INTEGER := 0;
  user_org_id UUID;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO user_org_id
  FROM public.profiles WHERE id = auth.uid();
  
  FOREACH cache_key IN ARRAY p_cache_keys
  LOOP
    INSERT INTO public.cache_invalidation (
      cache_key, reason, organization_id
    ) VALUES (
      cache_key, p_reason, user_org_id
    );
    
    invalidated_count := invalidated_count + 1;
  END LOOP;
  
  RETURN invalidated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create optimized indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_jobs_org_status_date_composite 
ON public.jobs (organization_id, status, start_date DESC, assigned_driver_id) 
WHERE start_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_vehicles_org_active_maintenance 
ON public.vehicles (organization_id, is_active, status) 
INCLUDE (vehicle_number, make, model);

CREATE INDEX IF NOT EXISTS idx_messages_org_receiver_unread 
ON public.messages (organization_id, receiver_id, created_at DESC) 
WHERE read_status = false;

-- Partial index for active driver locations
CREATE INDEX IF NOT EXISTS idx_driver_locations_active_recent 
ON public.driver_locations (driver_id, last_updated DESC) 
WHERE is_online = true 
AND last_updated > NOW() - INTERVAL '1 hour';

-- Create function to analyze slow queries
CREATE OR REPLACE FUNCTION public.get_slow_queries(
  p_limit INTEGER DEFAULT 10,
  p_hours_back INTEGER DEFAULT 24
)
RETURNS TABLE(
  query_type TEXT,
  avg_execution_time_ms NUMERIC,
  max_execution_time_ms INTEGER,
  query_count BIGINT,
  total_time_ms BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    qps.query_type,
    ROUND(AVG(qps.execution_time_ms), 2) as avg_execution_time_ms,
    MAX(qps.execution_time_ms) as max_execution_time_ms,
    COUNT(*) as query_count,
    SUM(qps.execution_time_ms) as total_time_ms
  FROM public.query_performance_stats qps
  WHERE qps.created_at >= NOW() - (p_hours_back || ' hours')::INTERVAL
    AND qps.organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  GROUP BY qps.query_type
  HAVING AVG(qps.execution_time_ms) > 100 -- Only slow queries
  ORDER BY avg_execution_time_ms DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;