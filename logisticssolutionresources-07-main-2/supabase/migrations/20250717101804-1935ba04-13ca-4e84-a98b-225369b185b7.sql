-- Continue with comprehensive security implementation

-- 1. CREATE COMPREHENSIVE RLS POLICIES FOR VEHICLES
DROP POLICY IF EXISTS "Users can view organization vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "vehicle_org_isolation" ON public.vehicles;
DROP POLICY IF EXISTS "vehicle_admin_access" ON public.vehicles;

-- Enable RLS
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Comprehensive RLS policies using security definer functions
CREATE POLICY "vehicle_org_isolation" 
ON public.vehicles 
FOR SELECT 
USING (
    organization_id = public.get_user_organization_id()
    AND public.validate_user_organization_access()
);

CREATE POLICY "vehicle_admin_insert" 
ON public.vehicles 
FOR INSERT 
WITH CHECK (
    organization_id = public.get_user_organization_id()
    AND public.has_admin_privileges()
);

CREATE POLICY "vehicle_admin_update" 
ON public.vehicles 
FOR UPDATE 
USING (
    organization_id = public.get_user_organization_id()
    AND public.has_admin_privileges()
);

CREATE POLICY "vehicle_admin_delete" 
ON public.vehicles 
FOR DELETE 
USING (
    organization_id = public.get_user_organization_id()
    AND public.has_admin_privileges()
);

-- 2. VEHICLE-RELATED TABLES SECURITY
-- Apply consistent RLS policies to all vehicle-related tables

-- Vehicle Checks
ALTER TABLE public.vehicle_checks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vehicle_checks_org_access" ON public.vehicle_checks;
CREATE POLICY "vehicle_checks_org_access" 
ON public.vehicle_checks 
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.vehicles v 
        WHERE v.id = vehicle_checks.vehicle_id 
        AND v.organization_id = public.get_user_organization_id()
    )
);

-- Vehicle Inspections
ALTER TABLE public.vehicle_inspections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vehicle_inspections_org_access" ON public.vehicle_inspections;
CREATE POLICY "vehicle_inspections_org_access" 
ON public.vehicle_inspections 
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.vehicles v 
        WHERE v.id = vehicle_inspections.vehicle_id 
        AND v.organization_id = public.get_user_organization_id()
    )
);

-- Vehicle Documents
ALTER TABLE public.vehicle_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vehicle_documents_org_access" ON public.vehicle_documents;
CREATE POLICY "vehicle_documents_org_access" 
ON public.vehicle_documents 
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.vehicles v 
        WHERE v.id = vehicle_documents.vehicle_id 
        AND v.organization_id = public.get_user_organization_id()
    )
);

-- Vehicle Compliance
ALTER TABLE public.vehicle_compliance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vehicle_compliance_org_access" ON public.vehicle_compliance;
CREATE POLICY "vehicle_compliance_org_access" 
ON public.vehicle_compliance 
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.vehicles v 
        WHERE v.id = vehicle_compliance.vehicle_id 
        AND v.organization_id = public.get_user_organization_id()
    )
);

-- 3. DRIVER ASSIGNMENTS SECURITY
ALTER TABLE public.driver_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "driver_assignments_org_access" ON public.driver_assignments;
CREATE POLICY "driver_assignments_org_access" 
ON public.driver_assignments 
FOR ALL
USING (organization_id = public.get_user_organization_id());

-- 4. PERFORMANCE OPTIMIZATION
-- Create optimized indexes for RLS policy performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vehicles_org_id_active 
ON public.vehicles (organization_id, is_active) 
WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vehicle_checks_vehicle_org 
ON public.vehicle_checks (vehicle_id, check_date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_driver_assignments_org_active 
ON public.driver_assignments (organization_id, is_active) 
WHERE is_active = true;