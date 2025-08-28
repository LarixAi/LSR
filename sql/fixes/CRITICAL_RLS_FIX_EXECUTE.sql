-- =============================================================================
-- CRITICAL RLS RECURSION FIX - EXECUTE IMMEDIATELY
-- This fixes the infinite recursion in profiles table RLS policies
-- Run this in your Supabase SQL Editor
-- =============================================================================

-- Step 1: Drop all problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "profiles_org_isolation" ON public.profiles;
DROP POLICY IF EXISTS "admins_view_org_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins_update_org_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins_create_org_profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "service_role_bypass" ON public.profiles;
DROP POLICY IF EXISTS "test_allow_all" ON public.profiles;
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

-- Step 2: Create security definer functions to avoid recursion
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

-- Step 3: Create safe, non-recursive policies
-- Policy 1: Users can always access their own profile (by ID - no recursion)
CREATE POLICY "profiles_own_access" ON public.profiles
FOR ALL USING (id = auth.uid());

-- Policy 2: Service role bypass (for Edge Functions - no recursion)
CREATE POLICY "profiles_service_role_access" ON public.profiles
FOR ALL USING (
  current_setting('role') = 'service_role' OR
  current_setting('role') = 'postgres' OR
  current_setting('role') = 'supabase_admin'
);

-- Policy 3: Users can view profiles in their organization (using function - no recursion)
CREATE POLICY "profiles_org_view" ON public.profiles
FOR SELECT USING (
  organization_id = get_user_organization_id() OR
  organization_id IS NULL
);

-- Policy 4: Admins can manage profiles in their organization (using functions - no recursion)
CREATE POLICY "profiles_admin_manage" ON public.profiles
FOR ALL USING (
  (organization_id = get_user_organization_id() AND is_user_admin()) OR
  id = auth.uid()
);

-- Step 4: Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Create helper functions for other tables
CREATE OR REPLACE FUNCTION get_user_organization_id_safe()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION is_user_admin_safe()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role IN ('admin', 'council', 'super_admin') FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Step 6: Apply similar safe policies to other critical tables
-- Vehicles table
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "vehicles_org_isolation" ON public.vehicles;
DROP POLICY IF EXISTS "service_role_bypass" ON public.vehicles;

CREATE POLICY "vehicles_service_role_access" ON public.vehicles
FOR ALL USING (
  current_setting('role') = 'service_role' OR
  current_setting('role') = 'postgres' OR
  current_setting('role') = 'supabase_admin'
);

CREATE POLICY "vehicles_org_isolation" ON public.vehicles
FOR ALL USING (
  organization_id = get_user_organization_id_safe() OR
  organization_id IS NULL
);

-- Jobs table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'jobs') THEN
        ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "jobs_org_isolation" ON public.jobs;
        DROP POLICY IF EXISTS "service_role_bypass" ON public.jobs;
        
        CREATE POLICY "jobs_service_role_access" ON public.jobs
        FOR ALL USING (
          current_setting('role') = 'service_role' OR
          current_setting('role') = 'postgres' OR
          current_setting('role') = 'supabase_admin'
        );
        
        CREATE POLICY "jobs_org_isolation" ON public.jobs
        FOR ALL USING (
          organization_id = get_user_organization_id_safe() OR
          organization_id IS NULL
        );
    END IF;
END $$;

-- Routes table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'routes') THEN
        ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "routes_org_isolation" ON public.routes;
        DROP POLICY IF EXISTS "service_role_bypass" ON public.routes;
        
        CREATE POLICY "routes_service_role_access" ON public.routes
        FOR ALL USING (
          current_setting('role') = 'service_role' OR
          current_setting('role') = 'postgres' OR
          current_setting('role') = 'supabase_admin'
        );
        
        CREATE POLICY "routes_org_isolation" ON public.routes
        FOR ALL USING (
          organization_id = get_user_organization_id_safe() OR
          organization_id IS NULL
        );
    END IF;
END $$;

-- Step 7: Show success message
DO $$ 
BEGIN
    RAISE NOTICE 'CRITICAL RLS RECURSION FIX APPLIED SUCCESSFULLY';
    RAISE NOTICE 'Profiles table now has safe, non-recursive RLS policies';
    RAISE NOTICE 'Service role access is preserved for Edge Functions';
    RAISE NOTICE 'All organizations are now properly isolated';
    RAISE NOTICE 'Authentication should now work properly';
END $$;




