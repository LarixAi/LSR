-- FIX: Security linter warning - Function Search Path Mutable
-- Update function to have proper search_path setting

CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS SETOF public.dashboard_stats
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT * FROM public.dashboard_stats 
  WHERE EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'council', 'super_admin')
  );
$$;