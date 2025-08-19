-- =====================================================
-- DIAGNOSE ORGANIZATION_ID ISSUE
-- =====================================================
-- This script will help us understand what's happening with the organization_id column

-- 1. CHECK IF PROFILES TABLE EXISTS
SELECT 
    'profiles table exists' as check_name,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'profiles'
    ) as result;

-- 2. CHECK PROFILES TABLE STRUCTURE
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. CHECK IF ORGANIZATION_ID COLUMN EXISTS IN PROFILES
SELECT 
    'organization_id column exists in profiles' as check_name,
    EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'organization_id'
    ) as result;

-- 4. CHECK IF ORGANIZATIONS TABLE EXISTS
SELECT 
    'organizations table exists' as check_name,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'organizations'
    ) as result;

-- 5. CHECK ORGANIZATIONS TABLE STRUCTURE
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'organizations'
ORDER BY ordinal_position;

-- 6. CHECK ALL TABLES THAT REFERENCE ORGANIZATION_ID
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name = 'organization_id'
ORDER BY table_name;

-- 7. CHECK RLS POLICIES THAT REFERENCE PROFILES.ORGANIZATION_ID
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE qual LIKE '%profiles%organization_id%'
OR with_check LIKE '%profiles%organization_id%'
ORDER BY tablename, policyname;

-- 8. CHECK FOR ANY BROKEN FOREIGN KEY REFERENCES
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
AND kcu.column_name = 'organization_id';

-- 9. CHECK SAMPLE DATA IN PROFILES TABLE
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    organization_id,
    created_at
FROM public.profiles 
LIMIT 5;

-- 10. CHECK SAMPLE DATA IN ORGANIZATIONS TABLE
SELECT 
    id,
    name,
    slug,
    created_at
FROM public.organizations 
LIMIT 5;

-- =====================================================
-- DIAGNOSIS COMPLETE
-- =====================================================
-- Run this script in your SQL Editor to see what's happening
-- This will help us identify the exact cause of the organization_id error
