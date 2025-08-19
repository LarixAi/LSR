-- Fix materialized view security issue
-- Since materialized views don't support RLS, we need to revoke public access
-- and create a secure way to access the data

-- First, let's see what columns actually exist in the materialized view
-- by creating a function that matches the actual structure

-- Revoke all access to the materialized view from public roles
REVOKE ALL ON public.mv_driver_performance FROM anon, authenticated, public;

-- Create a secure function that filters by organization
-- Only include columns that actually exist in the materialized view
CREATE OR REPLACE FUNCTION public.get_driver_performance_secure()
RETURNS TABLE (
  driver_id uuid,
  driver_name text,
  organization_id uuid,
  total_jobs bigint,
  completed_jobs bigint,
  completion_rate numeric,
  total_incidents bigint,
  last_activity timestamp with time zone
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
    mv.completion_rate,
    mv.total_incidents,
    mv.last_activity
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
COMMENT ON FUNCTION public.get_driver_performance_secure() IS 'Secure access to driver performance data filtered by user organization to prevent data leaks';