-- Multi-tenant security improvements and fixes

-- 1. Make organization_id NOT NULL where required for proper tenant isolation
ALTER TABLE profiles ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE vehicles ALTER COLUMN organization_id_new SET NOT NULL;
ALTER TABLE driver_assignments ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE time_entries ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE vehicle_checks ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE jobs ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE incidents ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE routes ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE notifications ALTER COLUMN organization_id SET NOT NULL;

-- 2. Add missing indexes for performance on organization_id columns
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_organization_id_new ON vehicles(organization_id_new);
CREATE INDEX IF NOT EXISTS idx_driver_assignments_organization_id ON driver_assignments(organization_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_organization_id ON time_entries(organization_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_checks_organization_id ON vehicle_checks(organization_id);
CREATE INDEX IF NOT EXISTS idx_jobs_organization_id ON jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_incidents_organization_id ON incidents(organization_id);
CREATE INDEX IF NOT EXISTS idx_routes_organization_id ON routes(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_organization_id ON notifications(organization_id);

-- 3. Add better RLS policies with proper tenant isolation
-- Update profiles policy to be more strict
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON profiles;
CREATE POLICY "Users can view profiles in their organization" ON profiles
  FOR SELECT USING (
    organization_id = get_user_organization_id() AND 
    organization_id IS NOT NULL
  );

-- Update vehicles policy
DROP POLICY IF EXISTS "Users can view vehicles in their organization" ON vehicles;
CREATE POLICY "Users can view vehicles in their organization" ON vehicles
  FOR SELECT USING (
    organization_id_new = get_user_organization_id() AND 
    organization_id_new IS NOT NULL
  );

-- 4. Create enhanced security function for organization validation
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

-- 5. Add organization validation trigger for critical tables
CREATE OR REPLACE FUNCTION validate_organization_insert()
RETURNS TRIGGER
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
    
    -- Ensure the record being inserted belongs to the user's organization
    IF TG_TABLE_NAME = 'vehicles' THEN
        IF NEW.organization_id_new != user_org_id THEN
            RAISE EXCEPTION 'Cannot create vehicle for different organization';
        END IF;
    ELSIF TG_TABLE_NAME = 'driver_assignments' THEN
        IF NEW.organization_id != user_org_id THEN
            RAISE EXCEPTION 'Cannot create driver assignment for different organization';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Apply the trigger to key tables
DROP TRIGGER IF EXISTS validate_org_vehicles ON vehicles;
CREATE TRIGGER validate_org_vehicles
    BEFORE INSERT ON vehicles
    FOR EACH ROW EXECUTE FUNCTION validate_organization_insert();

DROP TRIGGER IF EXISTS validate_org_driver_assignments ON driver_assignments;
CREATE TRIGGER validate_org_driver_assignments
    BEFORE INSERT ON driver_assignments
    FOR EACH ROW EXECUTE FUNCTION validate_organization_insert();