-- Fix Driver Licenses Schema
-- This script fixes the driver_licenses table and its relationships

-- 1. Drop existing table if it exists (to avoid conflicts)
DROP TABLE IF EXISTS driver_licenses CASCADE;

-- 2. Create driver_licenses table with proper schema
CREATE TABLE driver_licenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  license_number VARCHAR(50) NOT NULL,
  license_type VARCHAR(50) NOT NULL,
  issuing_authority VARCHAR(100),
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended', 'revoked')),
  license_class VARCHAR(20),
  endorsements TEXT[],
  restrictions TEXT[],
  photo_url TEXT,
  document_url TEXT,
  notes TEXT,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE driver_licenses ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
CREATE POLICY "Users can view driver licenses for their organization" ON driver_licenses
  FOR SELECT USING (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert driver licenses for their organization" ON driver_licenses
  FOR INSERT WITH CHECK (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update driver licenses for their organization" ON driver_licenses
  FOR UPDATE USING (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete driver licenses for their organization" ON driver_licenses
  FOR DELETE USING (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- 5. Create indexes for better performance
CREATE INDEX idx_driver_licenses_driver_id ON driver_licenses(driver_id);
CREATE INDEX idx_driver_licenses_organization_id ON driver_licenses(organization_id);
CREATE INDEX idx_driver_licenses_status ON driver_licenses(status);
CREATE INDEX idx_driver_licenses_expiry_date ON driver_licenses(expiry_date);
CREATE INDEX idx_driver_licenses_license_type ON driver_licenses(license_type);

-- 6. Grant permissions
GRANT ALL ON driver_licenses TO authenticated;

-- 7. Insert sample driver licenses data
INSERT INTO driver_licenses (
  driver_id,
  license_number,
  license_type,
  issuing_authority,
  issue_date,
  expiry_date,
  status,
  license_class,
  endorsements,
  restrictions,
  organization_id,
  created_by
)
SELECT 
  p.id as driver_id,
  'DL-' || substr(p.id::text, 1, 8) as license_number,
  'Commercial Driver License' as license_type,
  'Department of Motor Vehicles' as issuing_authority,
  CURRENT_DATE - INTERVAL '2 years' as issue_date,
  CURRENT_DATE + INTERVAL '1 year' as expiry_date,
  'active' as status,
  'Class B' as license_class,
  ARRAY['Passenger Transport', 'Hazardous Materials'] as endorsements,
  ARRAY['Corrective Lenses Required'] as restrictions,
  p.organization_id,
  p.id as created_by
FROM profiles p
WHERE p.role = 'driver'
AND p.organization_id IS NOT NULL
LIMIT 5;

-- 8. Insert some expiring licenses for testing
INSERT INTO driver_licenses (
  driver_id,
  license_number,
  license_type,
  issuing_authority,
  issue_date,
  expiry_date,
  status,
  license_class,
  endorsements,
  restrictions,
  organization_id,
  created_by
)
SELECT 
  p.id as driver_id,
  'DL-EXP-' || substr(p.id::text, 1, 8) as license_number,
  'Commercial Driver License' as license_type,
  'Department of Motor Vehicles' as issuing_authority,
  CURRENT_DATE - INTERVAL '3 years' as issue_date,
  CURRENT_DATE + INTERVAL '30 days' as expiry_date,
  'active' as status,
  'Class C' as license_class,
  ARRAY['Passenger Transport'] as endorsements,
  ARRAY[]::text[] as restrictions,
  p.organization_id,
  p.id as created_by
FROM profiles p
WHERE p.role = 'driver'
AND p.organization_id IS NOT NULL
LIMIT 3;

-- 9. Insert some expired licenses for testing
INSERT INTO driver_licenses (
  driver_id,
  license_number,
  license_type,
  issuing_authority,
  issue_date,
  expiry_date,
  status,
  license_class,
  endorsements,
  restrictions,
  organization_id,
  created_by
)
SELECT 
  p.id as driver_id,
  'DL-EXPIRED-' || substr(p.id::text, 1, 8) as license_number,
  'Commercial Driver License' as license_type,
  'Department of Motor Vehicles' as issuing_authority,
  CURRENT_DATE - INTERVAL '4 years' as issue_date,
  CURRENT_DATE - INTERVAL '30 days' as expiry_date,
  'expired' as status,
  'Class A' as license_class,
  ARRAY['Passenger Transport', 'Hazardous Materials', 'Tanker'] as endorsements,
  ARRAY['Corrective Lenses Required', 'No Night Driving'] as restrictions,
  p.organization_id,
  p.id as created_by
FROM profiles p
WHERE p.role = 'driver'
AND p.organization_id IS NOT NULL
LIMIT 2;

-- 10. Show the created data
SELECT 'Driver Licenses Created:' as info;
SELECT 
  dl.license_number,
  dl.license_type,
  dl.status,
  dl.expiry_date,
  p.first_name || ' ' || p.last_name as driver_name,
  o.name as organization_name
FROM driver_licenses dl
JOIN profiles p ON dl.driver_id = p.id
JOIN organizations o ON dl.organization_id = o.id
ORDER BY dl.expiry_date;

-- 11. Show expiring licenses (within 90 days)
SELECT 'Expiring Licenses (within 90 days):' as info;
SELECT 
  dl.license_number,
  dl.license_type,
  dl.expiry_date,
  p.first_name || ' ' || p.last_name as driver_name,
  o.name as organization_name,
  CASE 
    WHEN dl.expiry_date <= CURRENT_DATE THEN 'EXPIRED'
    WHEN dl.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'EXPIRING SOON'
    WHEN dl.expiry_date <= CURRENT_DATE + INTERVAL '90 days' THEN 'EXPIRING'
    ELSE 'VALID'
  END as status
FROM driver_licenses dl
JOIN profiles p ON dl.driver_id = p.id
JOIN organizations o ON dl.organization_id = o.id
WHERE dl.expiry_date <= CURRENT_DATE + INTERVAL '90 days'
AND dl.status = 'active'
ORDER BY dl.expiry_date;


