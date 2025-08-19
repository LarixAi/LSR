-- Test script to verify parent sign-in works without 400 errors
-- This simulates what happens when a parent user signs in

-- 1. Check if we can query profiles table (this is what was failing with 400 error)
SELECT 
    'Profiles table accessible' as test,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM public.profiles LIMIT 1
        ) THEN '✅ PASS - Can query profiles table'
        ELSE '❌ FAIL - Cannot query profiles table'
    END as result;

-- 2. Check if current user can access their own profile (if authenticated)
SELECT 
    'Current user profile access' as test,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN
            CASE 
                WHEN EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE id = auth.uid()
                ) THEN '✅ PASS - Current user can access own profile'
                ELSE '⚠️  WARNING - Current user has no profile (may need to create one)'
            END
        ELSE 'ℹ️  INFO - Not authenticated (this is normal for this test)'
    END as result;

-- 3. Check if the problematic policies were removed
SELECT 
    'Problematic policies removed' as test,
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'profiles'
            AND policyname IN (
                'Enable read access for authenticated users',
                'Enable insert for authenticated users',
                'Enable update for authenticated users'
            )
        ) THEN '✅ PASS - Problematic policies were removed'
        ELSE '❌ FAIL - Problematic policies still exist'
    END as result;

-- 4. Check if secure policies exist
SELECT 
    'Secure policies exist' as test,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'profiles'
            AND policyname = 'secure_users_own_profile_access'
        ) AND EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'profiles'
            AND policyname = 'service_role_profiles_access'
        ) THEN '✅ PASS - Secure policies exist'
        ELSE '❌ FAIL - Secure policies missing'
    END as result;

-- 5. Test profile creation (simulates what happens during sign-up)
SELECT 
    'Profile creation test' as test,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'profiles'
            AND cmd = 'INSERT'
            AND with_check LIKE '%auth.uid() = id%'
        ) THEN '✅ PASS - Profile creation policy exists'
        ELSE '❌ FAIL - Profile creation policy missing'
    END as result;

-- 6. Summary
SELECT 
    'FIX STATUS SUMMARY' as summary,
    CASE 
        WHEN (
            -- All checks should pass
            EXISTS (SELECT 1 FROM public.profiles LIMIT 1) AND
            NOT EXISTS (
                SELECT 1 FROM pg_policies 
                WHERE schemaname = 'public' 
                AND tablename = 'profiles'
                AND policyname IN (
                    'Enable read access for authenticated users',
                    'Enable insert for authenticated users',
                    'Enable update for authenticated users'
                )
            ) AND
            EXISTS (
                SELECT 1 FROM pg_policies 
                WHERE schemaname = 'public' 
                AND tablename = 'profiles'
                AND policyname = 'secure_users_own_profile_access'
            )
        ) THEN '🎉 SUCCESS - Profiles fix appears to be working correctly!'
        ELSE '⚠️  WARNING - Some issues may still exist'
    END as status;
