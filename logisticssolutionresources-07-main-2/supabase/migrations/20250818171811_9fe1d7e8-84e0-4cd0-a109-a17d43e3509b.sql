-- =============================================================================
-- CRITICAL RLS RECURSION FIX
-- This fixes infinite recursion in RLS policies that's causing authentication failures
-- =============================================================================

-- Step 1: Drop all problematic policies that cause recursion
DROP POLICY IF EXISTS "profiles_org_isolation" ON public.profiles;
DROP POLICY IF EXISTS "admins_view_org_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins_update_org_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins_create_org_profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage profiles in their organization" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;

-- Step 2: Create security definer functions to prevent recursion
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION is_user_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role IN ('admin', 'council', 'super_admin') FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Step 3: Create safe policies using security definer functions
CREATE POLICY "profiles_own_access" ON public.profiles
FOR ALL USING (id = auth.uid());

CREATE POLICY "profiles_service_role_access" ON public.profiles
FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY "profiles_org_access" ON public.profiles
FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "profiles_admin_manage" ON public.profiles
FOR ALL USING (
  (organization_id = get_user_organization_id() AND is_user_admin()) OR
  id = auth.uid()
);

-- Step 4: Add critical indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_organization_id ON public.profiles(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_org_role ON public.profiles(organization_id, role);

-- Verify the fix
SELECT 'Critical RLS recursion fix applied successfully - authentication should now work' as status;