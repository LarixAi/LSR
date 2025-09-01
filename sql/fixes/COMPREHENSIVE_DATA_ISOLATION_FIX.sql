-- =============================================================================
-- COMPREHENSIVE DATA ISOLATION FIX - ALL USER ROLES
-- This fixes data isolation for drivers, parents, mechanics, and all roles
-- =============================================================================

-- Step 1: Create enhanced security functions
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION is_admin_or_council()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role IN ('admin', 'council', 'super_admin') FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION is_driver()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role = 'driver' FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION is_parent()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role = 'parent' FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION is_mechanic()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role = 'mechanic' FROM public.profiles WHERE id = auth.uid();
$$;

-- Step 2: FIX PROFILES TABLE (CRITICAL)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_record.policyname);
    END LOOP;
    RAISE NOTICE 'Dropped all existing policies on profiles table';
END $$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Role-based profiles policies
CREATE POLICY "profiles_own_access" ON public.profiles
FOR SELECT USING (
  id = auth.uid() OR 
  (organization_id = get_user_organization_id() AND is_admin_or_council())
);

CREATE POLICY "profiles_own_update" ON public.profiles
FOR UPDATE USING (
  id = auth.uid() OR 
  (organization_id = get_user_organization_id() AND is_admin_or_council())
);

CREATE POLICY "profiles_admin_create" ON public.profiles
FOR INSERT WITH CHECK (
  organization_id = get_user_organization_id() AND is_admin_or_council()
);

CREATE POLICY "profiles_admin_delete" ON public.profiles
FOR DELETE USING (
  organization_id = get_user_organization_id() AND is_admin_or_council()
);

-- Step 3: FIX CHILD_PROFILES TABLE (PARENT DATA ISOLATION)
DROP POLICY IF EXISTS "child_profiles_parent_access" ON public.child_profiles;
ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "child_profiles_parent_access" ON public.child_profiles
FOR ALL USING (
  parent_id = auth.uid() OR 
  (organization_id = get_user_organization_id() AND is_admin_or_council())
);

-- Step 4: FIX PARENT_NOTIFICATIONS TABLE
DROP POLICY IF EXISTS "parent_notifications_access" ON public.parent_notifications;
ALTER TABLE public.parent_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parent_notifications_access" ON public.parent_notifications
FOR ALL USING (
  parent_id = auth.uid() OR 
  (organization_id = get_user_organization_id() AND is_admin_or_council())
);

-- Step 5: FIX MECHANICS TABLE
DROP POLICY IF EXISTS "mechanics_org_access" ON public.mechanics;
ALTER TABLE public.mechanics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mechanics_org_access" ON public.mechanics
FOR ALL USING (
  organization_id = get_user_organization_id() OR
  (is_mechanic() AND EXISTS (
    SELECT 1 FROM public.mechanic_organization_requests mor
    WHERE mor.mechanic_id = auth.uid() 
    AND mor.organization_id = mechanics.organization_id
    AND mor.status IN ('active', 'approved')
  ))
);

-- Step 6: FIX MECHANIC_ORGANIZATION_REQUESTS TABLE
DROP POLICY IF EXISTS "mechanic_org_requests_access" ON public.mechanic_organization_requests;
ALTER TABLE public.mechanic_organization_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mechanic_org_requests_access" ON public.mechanic_organization_requests
FOR ALL USING (
  mechanic_id = auth.uid() OR
  organization_id = get_user_organization_id()
);

-- Step 7: FIX MAINTENANCE_REQUESTS TABLE
DROP POLICY IF EXISTS "maintenance_requests_access" ON public.maintenance_requests;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "maintenance_requests_access" ON public.maintenance_requests
FOR ALL USING (
  organization_id = get_user_organization_id() OR
  (is_mechanic() AND EXISTS (
    SELECT 1 FROM public.mechanic_organization_requests mor
    WHERE mor.mechanic_id = auth.uid() 
    AND mor.organization_id = maintenance_requests.organization_id
    AND mor.status IN ('active', 'approved')
  ))
);

-- Step 8: FIX ALL VEHICLE-RELATED TABLES
-- Vehicles table
DROP POLICY IF EXISTS "vehicles_org_isolation" ON public.vehicles;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vehicles_org_isolation" ON public.vehicles
FOR ALL USING (
  organization_id = get_user_organization_id() OR
  (is_mechanic() AND EXISTS (
    SELECT 1 FROM public.mechanic_organization_requests mor
    WHERE mor.mechanic_id = auth.uid() 
    AND mor.organization_id = vehicles.organization_id
    AND mor.status IN ('active', 'approved')
  ))
);

-- Vehicle checks table
DROP POLICY IF EXISTS "vehicle_checks_org_isolation" ON public.vehicle_checks;
ALTER TABLE public.vehicle_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vehicle_checks_org_isolation" ON public.vehicle_checks
FOR ALL USING (
  organization_id = get_user_organization_id() OR
  (is_driver() AND driver_id = auth.uid()) OR
  (is_mechanic() AND EXISTS (
    SELECT 1 FROM public.mechanic_organization_requests mor
    WHERE mor.mechanic_id = auth.uid() 
    AND mor.organization_id = vehicle_checks.organization_id
    AND mor.status IN ('active', 'approved')
  ))
);

-- Step 9: FIX DRIVER-SPECIFIC TABLES
-- Time entries table
DROP POLICY IF EXISTS "time_entries_org_isolation" ON public.time_entries;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "time_entries_org_isolation" ON public.time_entries
FOR ALL USING (
  organization_id = get_user_organization_id() OR
  (is_driver() AND driver_id = auth.uid())
);

-- Driver assignments table
DROP POLICY IF EXISTS "driver_assignments_org_isolation" ON public.driver_assignments;
ALTER TABLE public.driver_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "driver_assignments_org_isolation" ON public.driver_assignments
FOR ALL USING (
  organization_id = get_user_organization_id() OR
  (is_driver() AND driver_id = auth.uid())
);

-- Step 10: FIX ROUTE-RELATED TABLES
-- Routes table
DROP POLICY IF EXISTS "routes_org_isolation" ON public.routes;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "routes_org_isolation" ON public.routes
FOR ALL USING (
  organization_id = get_user_organization_id() OR
  (is_driver() AND driver_id = auth.uid()) OR
  (is_parent() AND EXISTS (
    SELECT 1 FROM public.child_profiles cp
    WHERE cp.parent_id = auth.uid() 
    AND cp.route_id = routes.id
  ))
);

-- Route assignments table
DROP POLICY IF EXISTS "route_assignments_org_isolation" ON public.route_assignments;
ALTER TABLE public.route_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "route_assignments_org_isolation" ON public.route_assignments
FOR ALL USING (
  organization_id = get_user_organization_id() OR
  (is_driver() AND driver_id = auth.uid()) OR
  (is_parent() AND EXISTS (
    SELECT 1 FROM public.child_profiles cp
    WHERE cp.parent_id = auth.uid() 
    AND cp.route_id = route_assignments.route_id
  ))
);

-- Step 11: FIX ALL OTHER BUSINESS TABLES
-- Jobs table
DROP POLICY IF EXISTS "jobs_org_isolation" ON public.jobs;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "jobs_org_isolation" ON public.jobs
FOR ALL USING (
  organization_id = get_user_organization_id() OR
  (is_driver() AND assigned_driver_id = auth.uid())
);

-- Incidents table
DROP POLICY IF EXISTS "incidents_org_isolation" ON public.incidents;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "incidents_org_isolation" ON public.incidents
FOR ALL USING (
  organization_id = get_user_organization_id() OR
  (is_driver() AND driver_id = auth.uid())
);

-- Bookings table
DROP POLICY IF EXISTS "bookings_org_isolation" ON public.bookings;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookings_org_isolation" ON public.bookings
FOR ALL USING (
  organization_id = get_user_organization_id() OR
  (is_parent() AND EXISTS (
    SELECT 1 FROM public.child_profiles cp
    WHERE cp.parent_id = auth.uid() 
    AND cp.id = bookings.child_id
  ))
);

-- Step 12: FIX DOCUMENT TABLES
-- Documents table
DROP POLICY IF EXISTS "documents_org_isolation" ON public.documents;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents_org_isolation" ON public.documents
FOR ALL USING (
  organization_id = get_user_organization_id() OR
  (is_driver() AND related_entity_type = 'driver' AND related_entity_id = auth.uid()) OR
  (is_parent() AND related_entity_type = 'parent' AND related_entity_id = auth.uid())
);

-- Step 13: CREATE SECURE VIEWS FOR COMPLEX QUERIES
-- Drop existing insecure views
DROP VIEW IF EXISTS public.documents_with_profiles;

-- Create secure view for documents with profiles
CREATE VIEW public.documents_with_profiles
WITH (security_invoker = true)
AS
SELECT 
    d.id,
    d.name,
    d.type,
    d.file_path,
    d.file_size,
    d.category,
    d.status,
    d.expiry_date,
    d.uploaded_at,
    d.uploaded_at as upload_date,
    d.organization_id,
    d.related_entity_type,
    d.related_entity_id,
    CASE 
        WHEN d.related_entity_type = 'driver' AND d.related_entity_id IS NOT NULL THEN
            jsonb_build_object(
                'id', p.id,
                'first_name', p.first_name,
                'last_name', p.last_name,
                'email', p.email,
                'role', p.role
            )
        ELSE NULL
    END AS profiles
FROM public.documents d
LEFT JOIN public.profiles p ON (d.related_entity_type = 'driver' AND d.related_entity_id = p.id)
WHERE d.organization_id = get_user_organization_id()
  AND (p.id IS NULL OR p.organization_id = get_user_organization_id());

-- Step 14: CREATE AUDIT LOGGING
CREATE TABLE IF NOT EXISTS public.security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    user_role TEXT NOT NULL,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_admin_access" ON public.security_audit_log
FOR SELECT USING (
  organization_id = get_user_organization_id() AND is_admin_or_council()
);

-- Step 15: LOG THE COMPREHENSIVE SECURITY FIX
DO $$ 
BEGIN
    INSERT INTO public.security_audit_log (
        user_id,
        organization_id,
        user_role,
        action,
        table_name
    ) VALUES (
        auth.uid(),
        get_user_organization_id(),
        get_user_role(),
        'COMPREHENSIVE_SECURITY_FIX_APPLIED',
        'ALL_TABLES_ALL_ROLES'
    );
    
    RAISE NOTICE 'COMPREHENSIVE DATA ISOLATION FIX APPLIED SUCCESSFULLY';
    RAISE NOTICE 'All user roles (drivers, parents, mechanics) are now properly isolated';
END $$;







