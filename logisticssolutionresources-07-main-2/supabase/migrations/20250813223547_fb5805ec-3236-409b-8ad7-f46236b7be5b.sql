-- CRITICAL SECURITY FIX: Remove public access to role_permissions table
-- This policy allows anyone to read all system permissions which is a major security vulnerability

-- Drop the dangerous public access policy
DROP POLICY IF EXISTS "everyone_reads_role_permissions" ON public.role_permissions;

-- Verify the secure admin-only policy exists (this should already be in place)
-- If it doesn't exist, create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'role_permissions' 
        AND policyname = 'Admin users can view role permissions'
    ) THEN
        CREATE POLICY "Admin users can view role permissions" ON public.role_permissions
        FOR SELECT 
        USING (EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin', 'council')
        ));
    END IF;
END
$$;

-- Log this critical security fix
INSERT INTO public.security_audit_logs (
    event_type, 
    event_details, 
    user_id
) VALUES (
    'security_fix_applied',
    jsonb_build_object(
        'fix_type', 'role_permissions_access_restriction',
        'action', 'removed_public_access_policy',
        'severity', 'critical',
        'description', 'Removed dangerous public access to role_permissions table'
    ),
    auth.uid()
);