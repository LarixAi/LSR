-- Fix materialized view security issue with correct column names
-- Revoke all access to the materialized view from public roles
REVOKE ALL ON public.mv_driver_performance FROM anon, authenticated, public;

-- Create a secure function that matches the actual materialized view structure
CREATE OR REPLACE FUNCTION public.get_driver_performance_secure()
RETURNS TABLE (
  driver_id uuid,
  driver_name text,
  organization_id uuid,
  total_jobs bigint,
  completed_jobs bigint,
  cancelled_jobs bigint,
  completion_rate numeric,
  jobs_last_30_days bigint,
  compliance_score bigint,
  violation_count bigint
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT 
    mv.driver_id,
    mv.driver_name,
    mv.organization_id,
    mv.total_jobs,
    mv.completed_jobs,
    mv.cancelled_jobs,
    mv.completion_rate,
    mv.jobs_last_30_days,
    mv.compliance_score,
    mv.violation_count
  FROM public.mv_driver_performance mv
  WHERE mv.organization_id IN (
    SELECT p.organization_id 
    FROM public.profiles p 
    WHERE p.id = auth.uid()
  );
$$;

-- Grant execute permission only to authenticated users
GRANT EXECUTE ON FUNCTION public.get_driver_performance_secure() TO authenticated;

-- Add comment explaining the security measure
COMMENT ON FUNCTION public.get_driver_performance_secure() IS 'Secure access to driver performance data filtered by user organization - fixes materialized view security issue';