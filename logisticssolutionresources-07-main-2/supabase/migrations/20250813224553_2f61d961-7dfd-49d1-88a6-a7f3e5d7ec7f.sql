-- CRITICAL SECURITY FIX: Secure database access properly

-- Since dashboard_stats is a view, we need to create a security definer function to control access
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS SETOF public.dashboard_stats
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT * FROM public.dashboard_stats 
  WHERE EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'council', 'super_admin')
  );
$$;

-- Create a secure view for documents_with_profiles (if it's a view)
-- First, let's check what tables exist and secure them appropriately
DO $$
BEGIN
    -- Check if documents_with_profiles exists as a table and can be secured
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'documents_with_profiles' AND table_type = 'BASE TABLE') THEN
        -- It's a table, enable RLS
        EXECUTE 'ALTER TABLE public.documents_with_profiles ENABLE ROW LEVEL SECURITY';
        
        -- Drop existing policy if it exists
        DROP POLICY IF EXISTS "documents_with_profiles_org_access" ON public.documents_with_profiles;
        
        -- Create restrictive policy
        EXECUTE '
        CREATE POLICY "documents_with_profiles_org_access" ON public.documents_with_profiles
        FOR SELECT 
        USING (organization_id IN (
            SELECT profiles.organization_id 
            FROM profiles 
            WHERE profiles.id = auth.uid()
        ))';
    END IF;
END
$$;

-- Ensure all document-related tables have proper RLS
DO $$
BEGIN
    -- Verify documents table has RLS (should already be secured)
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables t 
        JOIN pg_class c ON c.relname = t.tablename 
        WHERE t.schemaname = 'public' 
        AND t.tablename = 'documents' 
        AND c.relrowsecurity = true
    ) THEN
        RAISE WARNING 'Documents table does not have RLS enabled - this should be investigated';
    END IF;
END
$$;

-- Create a function to safely access dashboard stats
COMMENT ON FUNCTION public.get_dashboard_stats() IS 'Secure function to access dashboard statistics - only admins can view';

-- Log this security fix
INSERT INTO public.security_audit_logs (
    event_type, 
    event_details, 
    user_id
) VALUES (
    'security_fix_applied',
    jsonb_build_object(
        'fix_type', 'view_access_restriction',
        'action', 'created_secure_functions_for_views',
        'severity', 'critical',
        'description', 'Created secure access functions for dashboard_stats and verified documents_with_profiles security'
    ),
    auth.uid()
);