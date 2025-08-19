-- Database Performance & Security Optimization Migration (Fixed)

-- 1. Create missing indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON public.profiles (organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON public.profiles (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_jobs_organization_id ON public.jobs (organization_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs (status);
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_driver ON public.jobs (assigned_driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_organization_id ON public.vehicles (organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications (is_read) WHERE is_read = false;

-- 2. Create performance monitoring table
CREATE TABLE IF NOT EXISTS public.query_performance_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  query_type TEXT NOT NULL,
  execution_time_ms INTEGER NOT NULL,
  table_name TEXT,
  organization_id UUID,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Index for performance logs
CREATE INDEX IF NOT EXISTS idx_query_performance_logs_query_type ON public.query_performance_logs (query_type);
CREATE INDEX IF NOT EXISTS idx_query_performance_logs_execution_time ON public.query_performance_logs (execution_time_ms);
CREATE INDEX IF NOT EXISTS idx_query_performance_logs_created_at ON public.query_performance_logs (created_at);

-- 3. Create database optimization functions
CREATE OR REPLACE FUNCTION public.log_query_performance(
  p_query_type TEXT,
  p_execution_time_ms INTEGER,
  p_table_name TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  log_id UUID;
  user_org_id UUID;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO user_org_id
  FROM public.profiles WHERE id = auth.uid();
  
  INSERT INTO public.query_performance_logs (
    query_type, execution_time_ms, table_name, 
    organization_id, user_id, metadata
  ) VALUES (
    p_query_type, p_execution_time_ms, p_table_name,
    user_org_id, auth.uid(), p_metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- 4. Create cache management table
CREATE TABLE IF NOT EXISTS public.query_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  organization_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for cache table
CREATE INDEX IF NOT EXISTS idx_query_cache_key ON public.query_cache (cache_key);
CREATE INDEX IF NOT EXISTS idx_query_cache_expires_at ON public.query_cache (expires_at);
CREATE INDEX IF NOT EXISTS idx_query_cache_organization_id ON public.query_cache (organization_id);

-- 5. Create cache cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.query_cache WHERE expires_at < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- 6. Create function to refresh materialized views
CREATE OR REPLACE FUNCTION public.refresh_performance_views()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.mv_driver_performance;
END;
$$;