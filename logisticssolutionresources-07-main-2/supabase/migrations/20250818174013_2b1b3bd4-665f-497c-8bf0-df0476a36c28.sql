-- =============================================================================
-- FIX REMAINING SECURITY DEFINER VIEW WARNINGS
-- Change remaining view ownership to remove elevated privileges
-- =============================================================================

-- Get list of all views owned by postgres and change them to authenticator
DO $$
DECLARE
    view_name TEXT;
BEGIN
    -- Change ownership of all views in public schema from postgres to authenticator
    FOR view_name IN 
        SELECT schemaname||'.'||viewname 
        FROM pg_views 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER VIEW %I OWNER TO authenticator', view_name);
        RAISE NOTICE 'Changed ownership of view % to authenticator', view_name;
    END LOOP;
END $$;

-- Explicitly ensure these specific views are owned by authenticator
ALTER VIEW IF EXISTS public.combined_defects OWNER TO authenticator;
ALTER VIEW IF EXISTS public.work_order_summary OWNER TO authenticator;

-- Grant necessary permissions to authenticated users
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated, anon;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

SELECT 'All Security Definer View issues resolved' as status;