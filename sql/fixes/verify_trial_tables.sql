-- Verify Trial Management Tables
-- Run this in Supabase SQL Editor to check if tables exist

-- Check if trial management tables exist
SELECT 
    table_name,
    table_type,
    CASE 
        WHEN table_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'organization_trials',
    'organization_subscriptions', 
    'organization_usage'
);

-- Check if RLS is enabled on trial tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'organization_trials',
    'organization_subscriptions', 
    'organization_usage'
);

-- Check RLS policies on trial tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN (
    'organization_trials',
    'organization_subscriptions', 
    'organization_usage'
);

-- Check if trial_summary view exists
SELECT 
    schemaname,
    viewname,
    security_type
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname = 'trial_summary';

-- Check if organizations table exists (required for foreign keys)
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'organizations';

-- Check if profiles table exists (required for driver counting)
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'profiles';
