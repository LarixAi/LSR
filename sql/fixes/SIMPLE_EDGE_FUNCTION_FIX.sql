-- =============================================================================
-- SIMPLE EDGE FUNCTION FIX - NO AUDIT LOG DEPENDENCY
-- This fixes Edge Function access without relying on security_audit_log table
-- =============================================================================

-- Step 1: Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop any existing test policies
DROP POLICY IF EXISTS "test_allow_all" ON public.profiles;

-- Step 3: Create comprehensive RLS policies for profiles
-- Policy 1: Users can view their own profile
CREATE POLICY "users_view_own_profile" ON public.profiles
FOR SELECT USING (id = auth.uid());

-- Policy 2: Users can update their own profile
CREATE POLICY "users_update_own_profile" ON public.profiles
FOR UPDATE USING (id = auth.uid());

-- Policy 3: Admins can view profiles in their organization
CREATE POLICY "admins_view_org_profiles" ON public.profiles
FOR SELECT USING (
  organization_id = (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ) AND 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'council', 'super_admin')
);

-- Policy 4: Admins can update profiles in their organization
CREATE POLICY "admins_update_org_profiles" ON public.profiles
FOR UPDATE USING (
  organization_id = (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ) AND 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'council', 'super_admin')
);

-- Policy 5: Admins can create profiles in their organization
CREATE POLICY "admins_create_org_profiles" ON public.profiles
FOR INSERT WITH CHECK (
  organization_id = (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ) AND 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'council', 'super_admin')
);

-- Policy 6: Service role bypass for Edge Functions
-- This allows the service role (used by Edge Functions) to bypass RLS
CREATE POLICY "service_role_bypass" ON public.profiles
FOR ALL USING (
  current_setting('role') = 'service_role' OR
  current_setting('role') = 'postgres' OR
  current_setting('role') = 'supabase_admin'
);

-- Step 4: Create a function to check if user is service role
CREATE OR REPLACE FUNCTION is_service_role()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT current_setting('role') IN ('service_role', 'postgres', 'supabase_admin');
$$;

-- Step 5: Update the security functions to work with service role
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION is_admin_or_council()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role IN ('admin', 'council', 'super_admin') FROM public.profiles WHERE id = auth.uid();
$$;

-- Step 6: Apply similar policies to other tables
-- Vehicles table
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vehicles_org_isolation" ON public.vehicles;
DROP POLICY IF EXISTS "service_role_bypass" ON public.vehicles;

CREATE POLICY "vehicles_org_isolation" ON public.vehicles
FOR ALL USING (
  organization_id = get_user_organization_id() OR is_service_role()
);

-- Jobs table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'jobs') THEN
        ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "jobs_org_isolation" ON public.jobs;
        DROP POLICY IF EXISTS "service_role_bypass" ON public.jobs;
        
        CREATE POLICY "jobs_org_isolation" ON public.jobs
        FOR ALL USING (
          organization_id = get_user_organization_id() OR is_service_role()
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
        
        CREATE POLICY "routes_org_isolation" ON public.routes
        FOR ALL USING (
          organization_id = get_user_organization_id() OR is_service_role()
        );
    END IF;
END $$;

-- Step 7: Show success message
DO $$ 
BEGIN
    RAISE NOTICE 'Edge Function access fixed with proper RLS policies';
    RAISE NOTICE 'Service role bypass policies created for Edge Functions';
    RAISE NOTICE 'All organizations are now properly isolated';
END $$;







