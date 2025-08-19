-- Check if trial management tables exist
-- Run this in Supabase SQL Editor to verify table status

-- Check if organization_trials table exists
SELECT 
    'organization_trials' as table_name,
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'organization_trials'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status;

-- Check if organization_subscriptions table exists
SELECT 
    'organization_subscriptions' as table_name,
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'organization_subscriptions'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status;

-- Check if organization_usage table exists
SELECT 
    'organization_usage' as table_name,
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'organization_usage'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status;

-- Check if organizations table exists (required for foreign keys)
SELECT 
    'organizations' as table_name,
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'organizations'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status;

-- Check if profiles table exists (required for driver counting)
SELECT 
    'profiles' as table_name,
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status;

-- Check RLS policies on organization_trials
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
    END as status;

-- Check if any trial records exist
SELECT 
    'trial records' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'organization_trials'
        ) THEN (
            SELECT 
                CASE 
                    WHEN COUNT(*) > 0 THEN CONCAT('✅ ', COUNT(*), ' records found')
                    ELSE '⚠️ Table exists but no records'
                END
            FROM organization_trials
        )
        ELSE '❌ Table does not exist'
    END as status;
