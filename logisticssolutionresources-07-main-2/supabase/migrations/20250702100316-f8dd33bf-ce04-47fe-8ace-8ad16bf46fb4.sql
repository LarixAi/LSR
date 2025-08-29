-- Now apply the NOT NULL constraints and security improvements

-- 1. Make organization_id NOT NULL for proper tenant isolation
ALTER TABLE profiles ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE vehicles ALTER COLUMN organization_id_new SET NOT NULL;
ALTER TABLE driver_assignments ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE time_entries ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE vehicle_checks ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE jobs ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE incidents ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE routes ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE notifications ALTER COLUMN organization_id SET NOT NULL;

-- 2. Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_organization_id_new ON vehicles(organization_id_new);
CREATE INDEX IF NOT EXISTS idx_driver_assignments_organization_id ON driver_assignments(organization_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_organization_id ON time_entries(organization_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_checks_organization_id ON vehicle_checks(organization_id);
CREATE INDEX IF NOT EXISTS idx_jobs_organization_id ON jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_incidents_organization_id ON incidents(organization_id);
CREATE INDEX IF NOT EXISTS idx_routes_organization_id ON routes(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_organization_id ON notifications(organization_id);

-- 3. Create enhanced security function for organization validation
CREATE OR REPLACE FUNCTION validate_organization_access(target_org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_org_id UUID;
BEGIN
    -- Get the current user's organization
    SELECT organization_id INTO user_org_id
    FROM profiles 
    WHERE id = auth.uid();
    
    -- Return true if user belongs to the target organization
    RETURN user_org_id = target_org_id AND user_org_id IS NOT NULL;
END;
$$;