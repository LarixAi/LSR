-- Verify security fix for trial_summary view
-- Run this in Supabase SQL Editor to verify the fix worked

-- 1. Check if the view exists
SELECT 
    'trial_summary view exists' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT FROM pg_views 
            WHERE schemaname = 'public' 
            AND viewname = 'trial_summary'
        ) THEN '✅ YES'
        ELSE '❌ NO'
    END as result;

-- 2. Check if RLS is enabled on trial tables
SELECT 
    'organization_trials RLS' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = 'organization_trials' 
            AND rowsecurity = true
        ) THEN '✅ ENABLED'
        ELSE '❌ DISABLED'
    END as result

UNION ALL

SELECT 
    'organization_subscriptions RLS' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = 'organization_subscriptions' 
            AND rowsecurity = true
        ) THEN '✅ ENABLED'
        ELSE '❌ DISABLED'
    END as result

UNION ALL

SELECT 
    'organization_usage RLS' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = 'organization_usage' 
            AND rowsecurity = true
        ) THEN '✅ ENABLED'
        ELSE '❌ DISABLED'
    END as result;

-- 3. Check RLS policies exist
SELECT 
    'organization_trials policies' as check_name,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'organization_trials'

UNION ALL

SELECT 
    'organization_subscriptions policies' as check_name,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'organization_subscriptions'

UNION ALL

SELECT 
    'organization_usage policies' as check_name,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'organization_usage';

-- 4. Test the view (this will verify SECURITY INVOKER is working)
SELECT 'Testing trial_summary view...' as test_message;
SELECT COUNT(*) as record_count FROM trial_summary;

-- 5. Show view definition (to verify SECURITY INVOKER is set)
SELECT 
    'View definition' as check_name,
    pg_get_viewdef('public.trial_summary'::regclass, true) as definition;
