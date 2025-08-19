-- Quick fix for infinite recursion in profiles table RLS policies
-- Run this directly in your Supabase SQL editor

-- Step 1: Drop all existing policies on profiles table
DROP POLICY IF EXISTS "users_view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admins_view_org_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins_update_org_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins_create_org_profiles" ON public.profiles;
DROP POLICY IF EXISTS "service_role_bypass" ON public.profiles;
DROP POLICY IF EXISTS "test_allow_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_org_isolation" ON public.profiles;
DROP POLICY IF EXISTS "profiles_own_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_create" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_delete" ON public.profiles;
DROP POLICY IF EXISTS "profiles_own_read_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_own_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_limited_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_full_access" ON public.profiles;
DROP POLICY IF EXISTS "service_role_profiles_access" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_own_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "Organization members can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_service_role_access" ON public.profiles;
DROP POLICY IF EXISTS "Org members can view org profiles" ON public.profiles;
DROP POLICY IF EXISTS "Organization admins can manage organization profiles" ON public.profiles;
DROP POLICY IF EXISTS "Organization admins can view organization profiles" ON public.profiles;

-- Step 2: Create simple, non-recursive policies
-- Policy 1: Users can always view their own profile (by ID)
CREATE POLICY "profiles_own_profile_access" ON public.profiles
FOR SELECT USING (id = auth.uid());

-- Policy 2: Users can update their own profile (by ID)
CREATE POLICY "profiles_own_profile_update" ON public.profiles
FOR UPDATE USING (id = auth.uid());

-- Policy 3: Users can insert their own profile (by ID)
CREATE POLICY "profiles_own_profile_insert" ON public.profiles
FOR INSERT WITH CHECK (id = auth.uid());

-- Policy 4: Service role bypass (for Edge Functions)
CREATE POLICY "profiles_service_role_access" ON public.profiles
FOR ALL USING (
  current_setting('role') = 'service_role' OR
  current_setting('role') = 'postgres' OR
  current_setting('role') = 'supabase_admin'
);

-- Policy 5: Allow authenticated users to view profiles in same organization
-- This uses a function to avoid recursion
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE POLICY "profiles_org_member_access" ON public.profiles
FOR SELECT USING (
  organization_id = get_user_org_id() OR
  organization_id IS NULL
);

-- Policy 6: Allow admins to manage profiles in their organization
CREATE OR REPLACE FUNCTION is_user_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role IN ('admin', 'council', 'super_admin') FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE POLICY "profiles_admin_manage_org" ON public.profiles
FOR ALL USING (
  (organization_id = get_user_org_id() AND is_user_admin()) OR
  id = auth.uid()
);

-- Step 3: Create helper functions
CREATE OR REPLACE FUNCTION check_profile_exists(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = user_id);
$$;

CREATE OR REPLACE FUNCTION get_user_organization_safe()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION is_user_admin_safe()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role IN ('admin', 'council', 'super_admin') FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Success message
SELECT 'Infinite recursion fix applied successfully!' as status;

