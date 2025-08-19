-- Test script to verify profiles table fix
-- Run this after applying the fix_profiles_400_error.sql script

-- 1. Check if profiles table structure is correct
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
AND column_name = 'id'
ORDER BY ordinal_position;

-- 2. Check if RLS policies are correct
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'profiles'
ORDER BY policyname;

-- 3. Test if a user can access their own profile (this should work)
-- Note: This will only work if you're authenticated
SELECT 
    'Current user can access own profile' as test,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid()
        ) THEN 'PASS'
        ELSE 'FAIL - No profile found for current user'
    END as result;

-- 4. Check if the foreign key constraint exists
SELECT 
    tc.constraint_name,
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
AND tc.table_name = 'profiles'
AND kcu.column_name = 'id';

-- 5. Check if the trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles'
AND trigger_name = 'update_profiles_updated_at';
