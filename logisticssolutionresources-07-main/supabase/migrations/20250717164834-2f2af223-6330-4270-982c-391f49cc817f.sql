-- Fix materialized view security issue by creating a secure view/function wrapper
-- Since materialized views don't support RLS, we'll create a security definer function
-- that applies the same organization-based filtering

-- Create a secure function to access driver performance data
CREATE OR REPLACE FUNCTION public.get_driver_performance_secure()
RETURNS TABLE (
  driver_id uuid,
  driver_name text,
  organization_id uuid,
  total_jobs bigint,
  completed_jobs bigint,
  completion_rate numeric,
  avg_rating numeric,
  total_incidents bigint,
  last_activity timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    mv.driver_id,
    mv.driver_name,
    mv.organization_id,
    mv.total_jobs,
    mv.completed_jobs,
    mv.completion_rate,
    mv.avg_rating,
    mv.total_incidents,
    mv.last_activity
  FROM public.mv_driver_performance mv
  INNER JOIN public.profiles p ON p.organization_id = mv.organization_id
  WHERE p.id = auth.uid();
$$;

-- Revoke public access to the materialized view
REVOKE ALL ON public.mv_driver_performance FROM anon, authenticated;

-- Grant access only to the secure function
GRANT EXECUTE ON FUNCTION public.get_driver_performance_secure() TO authenticated;