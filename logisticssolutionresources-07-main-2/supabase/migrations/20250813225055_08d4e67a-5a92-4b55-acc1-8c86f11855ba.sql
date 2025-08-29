-- CRITICAL SECURITY FIX: Secure exposed views
-- Fix 1: Enable RLS on dashboard_stats view to prevent unauthorized access
ALTER TABLE public.dashboard_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for dashboard_stats - admin/council only access
CREATE POLICY "dashboard_stats_admin_only" ON public.dashboard_stats
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'council', 'super_admin')
  )
);

-- Fix 2: Enable RLS on documents_with_profiles view to prevent data exposure
ALTER TABLE public.documents_with_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for documents_with_profiles - organization-based access
CREATE POLICY "documents_with_profiles_org_access" ON public.documents_with_profiles
FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Additional security: Revoke public access to ensure only authenticated users can access
REVOKE ALL ON public.dashboard_stats FROM PUBLIC;
REVOKE ALL ON public.documents_with_profiles FROM PUBLIC;

-- Grant specific access to authenticated users (will be filtered by RLS policies)
GRANT SELECT ON public.dashboard_stats TO authenticated;
GRANT SELECT ON public.documents_with_profiles TO authenticated;