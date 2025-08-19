-- Test script for trial_summary view
-- This script verifies the view works correctly and has proper security context

-- Check if the view exists and its security context
SELECT 
    schemaname,
    viewname,
    security_type,
    definition
FROM pg_views 
WHERE viewname = 'trial_summary';

-- Test the view (this will only work if you have data)
-- SELECT * FROM trial_summary LIMIT 5;

-- Check if the underlying tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name IN ('organization_trials', 'organizations', 'profiles')
AND table_schema = 'public';

-- Check RLS policies on the underlying tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('organization_trials', 'organizations', 'profiles')
AND schemaname = 'public';
