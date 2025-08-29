
-- Add foreign key constraint from driver_licenses.driver_id to profiles.id
ALTER TABLE driver_licenses 
ADD CONSTRAINT fk_driver_licenses_driver_id 
FOREIGN KEY (driver_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint from license_renewals.license_id to driver_licenses.id
ALTER TABLE license_renewals 
ADD CONSTRAINT fk_license_renewals_license_id 
FOREIGN KEY (license_id) REFERENCES driver_licenses(id) ON DELETE CASCADE;

-- Add foreign key constraint from license_violations.license_id to driver_licenses.id
ALTER TABLE license_violations 
ADD CONSTRAINT fk_license_violations_license_id 
FOREIGN KEY (license_id) REFERENCES driver_licenses(id) ON DELETE CASCADE;

-- Update RLS policies to work with the new foreign key relationships
-- These policies ensure proper data access control with the established relationships

-- Update license_renewals RLS policy for viewing renewals
DROP POLICY IF EXISTS "Users can view their license renewals" ON license_renewals;
CREATE POLICY "Users can view their license renewals" 
  ON license_renewals 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM driver_licenses dl 
      WHERE dl.id = license_renewals.license_id 
      AND dl.driver_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'council', 'compliance_officer')
    )
  );

-- Update license_violations RLS policy for viewing violations
DROP POLICY IF EXISTS "Users can view their license violations" ON license_violations;
CREATE POLICY "Users can view their license violations" 
  ON license_violations 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM driver_licenses dl 
      WHERE dl.id = license_violations.license_id 
      AND dl.driver_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'council', 'compliance_officer')
    )
  );
