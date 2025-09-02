-- =============================================================================
-- QUICK PASSWORD FIX - TEMPORARY ACCESS FOR TESTING
-- This temporarily allows access to profiles to test password change function
-- =============================================================================

-- Step 1: Temporarily disable RLS on profiles for testing
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Show current profiles
SELECT id, email, role, organization_id, created_at 
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- Step 3: Check if we have any admins and drivers
SELECT 
  role,
  COUNT(*) as count,
  STRING_AGG(email, ', ') as emails
FROM public.profiles 
GROUP BY role;

-- Step 4: Re-enable RLS with a simple policy for testing
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create a simple policy that allows authenticated users to read profiles
DROP POLICY IF EXISTS "test_allow_authenticated_read" ON public.profiles;
CREATE POLICY "test_allow_authenticated_read" ON public.profiles
FOR SELECT USING (auth.role() = 'authenticated');

-- Create a policy that allows service role to do everything
DROP POLICY IF EXISTS "service_role_full_access" ON public.profiles;
CREATE POLICY "service_role_full_access" ON public.profiles
FOR ALL USING (
  current_setting('role') = 'service_role' OR
  current_setting('role') = 'postgres' OR
  current_setting('role') = 'supabase_admin'
);

-- Step 5: Show success message
DO $$ 
BEGIN
    RAISE NOTICE 'Quick password fix applied';
    RAISE NOTICE 'RLS temporarily configured for testing';
    RAISE NOTICE 'Check the profiles above to see available users';
END $$;







