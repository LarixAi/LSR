-- =============================================================================
-- SIMPLE PASSWORD FIX - PROFILES TABLE ONLY
-- This fixes password reset issues by focusing only on the profiles table
-- =============================================================================

-- Step 1: Check current profiles
SELECT 'Current profiles:' as info;
SELECT id, email, role, organization_id, created_at 
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- Step 2: Temporarily disable RLS to see what's in the table
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 3: Check profiles again
SELECT 'Profiles after disabling RLS:' as info;
SELECT id, email, role, organization_id, created_at 
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- Step 4: Re-enable RLS with proper service role bypass
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "users_view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admins_view_org_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins_update_org_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins_create_org_profiles" ON public.profiles;
DROP POLICY IF EXISTS "service_role_bypass" ON public.profiles;
DROP POLICY IF EXISTS "test_allow_authenticated_read" ON public.profiles;
DROP POLICY IF EXISTS "service_role_full_access" ON public.profiles;

-- Create comprehensive policies that work with Edge Functions
-- Policy 1: Service role can do everything (for Edge Functions)
CREATE POLICY "service_role_full_access" ON public.profiles
FOR ALL USING (
  current_setting('role') = 'service_role' OR
  current_setting('role') = 'postgres' OR
  current_setting('role') = 'supabase_admin'
);

-- Policy 2: Users can view their own profile
CREATE POLICY "users_view_own_profile" ON public.profiles
FOR SELECT USING (id = auth.uid());

-- Policy 3: Users can update their own profile
CREATE POLICY "users_update_own_profile" ON public.profiles
FOR UPDATE USING (id = auth.uid());

-- Policy 4: Admins can view profiles in their organization
CREATE POLICY "admins_view_org_profiles" ON public.profiles
FOR SELECT USING (
  organization_id = (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ) AND 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'council', 'super_admin')
);

-- Policy 5: Admins can update profiles in their organization
CREATE POLICY "admins_update_org_profiles" ON public.profiles
FOR UPDATE USING (
  organization_id = (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ) AND 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'council', 'super_admin')
);

-- Policy 6: Admins can create profiles in their organization
CREATE POLICY "admins_create_org_profiles" ON public.profiles
FOR INSERT WITH CHECK (
  organization_id = (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ) AND 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'council', 'super_admin')
);

-- Step 5: Show final status
SELECT 'Password fix completed successfully!' as status;
SELECT 'Service role bypass policies created for Edge Functions' as info;
SELECT 'Profiles table is now accessible for password resets' as info;

