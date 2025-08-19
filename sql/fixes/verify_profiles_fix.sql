-- Verification script to check if the profiles fix worked
-- Run this in the Supabase SQL editor

-- 1. Check profiles table structure
SELECT 
    'Profiles table structure' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles' 
            AND column_name = 'id' 
            AND column_default IS NULL
            AND is_nullable = 'NO'
        ) THEN '✅ CORRECT - id column has no default (references auth.users)'
        ELSE '❌ INCORRECT - id column has default value'
    END as result;

-- 2. Check foreign key constraint
SELECT 
    'Foreign key constraint' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY' 
            AND tc.table_name = 'profiles'
            AND kcu.column_name = 'id'
            AND tc.table_schema = 'public'
        ) THEN '✅ CORRECT - Foreign key constraint exists'
        ELSE '❌ INCORRECT - No foreign key constraint found'
    END as result;

-- 3. Check RLS policies
SELECT 
    'RLS policies' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'profiles'
            AND policyname = 'secure_users_own_profile_access'
        ) THEN '✅ CORRECT - Secure RLS policies exist'
        ELSE '❌ INCORRECT - Secure RLS policies missing'
    END as result;

-- 4. Check for problematic policies
SELECT 
    'Problematic policies' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'profiles'
            AND qual LIKE '%true%'
        ) THEN '❌ WARNING - Found overly permissive policies (USING true)'
        ELSE '✅ CORRECT - No overly permissive policies found'
    END as result;

-- 5. List all current policies on profiles table
SELECT 
    'Current policies' as check_type,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'profiles'
ORDER BY policyname;

-- 6. Test if RLS is enabled
SELECT 
    'RLS enabled' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = 'profiles'
            AND rowsecurity = true
        ) THEN '✅ CORRECT - RLS is enabled'
        ELSE '❌ INCORRECT - RLS is not enabled'
    END as result;

-- 7. Check if trigger exists
SELECT 
    'Updated trigger' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE event_object_table = 'profiles'
            AND trigger_name = 'update_profiles_updated_at'
        ) THEN '✅ CORRECT - Updated trigger exists'
        ELSE '❌ INCORRECT - Updated trigger missing'
    END as result;
