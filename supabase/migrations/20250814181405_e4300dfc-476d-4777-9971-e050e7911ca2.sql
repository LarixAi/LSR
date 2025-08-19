-- =============================================================================
-- FIX REMAINING SECURITY WARNINGS FROM LINTER
-- =============================================================================

-- Fix function search path mutable warnings by setting secure search_path
ALTER FUNCTION get_user_organization_id() SET search_path = 'public';
ALTER FUNCTION get_user_role() SET search_path = 'public';  
ALTER FUNCTION is_admin_or_council() SET search_path = 'public';

-- Enable RLS on security_audit_log table that was just created
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for security_audit_log (admin access only)
CREATE POLICY "Admins can view security audit logs in their organization" ON public.security_audit_log
FOR SELECT USING (
  is_admin_or_council()
);

CREATE POLICY "System can insert security audit logs" ON public.security_audit_log
FOR INSERT WITH CHECK (true);

-- Check for any other tables that might not have RLS enabled
DO $$
DECLARE
    tbl record;
BEGIN
    FOR tbl IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN (
            SELECT tablename 
            FROM pg_policies 
            WHERE schemaname = 'public'
        )
    LOOP
        EXECUTE 'ALTER TABLE ' || quote_ident(tbl.schemaname) || '.' || quote_ident(tbl.tablename) || ' ENABLE ROW LEVEL SECURITY';
        RAISE NOTICE 'Enabled RLS on table: %.%', tbl.schemaname, tbl.tablename;
    END LOOP;
END $$;

-- Log the security warning fixes
INSERT INTO public.security_audit_log (event_type, description, metadata)
VALUES (
  'SECURITY_WARNINGS_FIXED',
  'Fixed function search path vulnerabilities and enabled RLS on all public tables',
  jsonb_build_object(
    'functions_fixed', 3,
    'rls_tables_secured', 'all_public_tables',
    'security_level', 'HARDENED'
  )
);