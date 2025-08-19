-- Sample Route Data for Parent Dashboard Testing (Minimal Version)
-- This script uses only the most basic columns that are likely to exist

-- First, let's get some existing data or create sample data
-- Get a parent user ID (replace with actual parent user ID if needed)
-- You can find this by running: SELECT id, email, role FROM profiles WHERE role = 'parent' LIMIT 1;

-- Get or create an organization ID
DO $$
DECLARE
    org_id UUID;
BEGIN
    -- Try to get existing organization
    SELECT id INTO org_id FROM organizations LIMIT 1;
    
    -- If no organization exists, create one
    IF org_id IS NULL THEN
        INSERT INTO organizations (name, address, city, state, zip_code, phone, email)
        VALUES ('Sample Transport Company', '123 Main St', 'Anytown', 'CA', '12345', '555-0123', 'info@sampletransport.com')
        RETURNING id INTO org_id;
    END IF;
    
    -- Store org_id for use in subsequent inserts
    PERFORM set_config('app.org_id', org_id::text, false);
END $$;

-- Create sample vehicles (matching exact schema)
INSERT INTO public.vehicles (
  organization_id,
  vehicle_number,
  make,
  model,
  year,
  license_plate,
  vehicle_type,
  status,
  fuel_level,
  created_at,
  updated_at
) VALUES 
(
  (SELECT current_setting('app.org_id')::uuid),
  'BUS001',
  'Blue Bird',
  'Vision',
  2020,
  'ABC123',
  'school_bus',
  'active',
  85,
  now(),
  now()
),
(
  (SELECT current_setting('app.org_id')::uuid),
  'VAN002',
  'Ford',
  'Transit',
  2021,
  'XYZ789',
  'passenger_van',
  'active',
  90,
  now(),
  now()
);

-- Create sample routes (minimal columns)
INSERT INTO public.routes (
  organization_id,
  name,
  start_location,
  end_location,
  distance,
  estimated_time,
  status,
  created_at,
  updated_at
) VALUES 
(
  (SELECT current_setting('app.org_id')::uuid),
  'Morning School Run',
  'City Center Bus Depot',
  'Lincoln Elementary School',
  8.5,
  45,
  'active',
  now(),
  now()
),
(
  (SELECT current_setting('app.org_id')::uuid),
  'Afternoon Return Route',
  'Lincoln Elementary School',
  'Suburban Area Drop-off',
  7.2,
  40,
  'active',
  now(),
  now()
);

-- Create sample drivers (if they don't exist)
INSERT INTO public.profiles (
  email,
  first_name,
  last_name,
  role,
  phone,
  organization_id,
  is_active,
  created_at,
  updated_at
) VALUES 
(
  'john.driver@sampletransport.com',
  'John',
  'Driver',
  'driver',
  '555-0123',
  (SELECT current_setting('app.org_id')::uuid),
  true,
  now(),
  now()
),
(
  'sarah.wilson@sampletransport.com',
  'Sarah',
  'Wilson',
  'driver',
  '555-0456',
  (SELECT current_setting('app.org_id')::uuid),
  true,
  now(),
  now()
);

-- Create route assignments for today
INSERT INTO public.route_assignments (
  route_id,
  driver_id,
  vehicle_id,
  assignment_date,
  start_time,
  end_time,
  status,
  is_active,
  organization_id,
  created_at,
  updated_at
) VALUES 
(
  (SELECT id FROM routes WHERE name = 'Morning School Run' LIMIT 1),
  (SELECT id FROM profiles WHERE email = 'john.driver@sampletransport.com' LIMIT 1),
  (SELECT id FROM vehicles WHERE vehicle_number = 'BUS001' LIMIT 1),
  CURRENT_DATE,
  '07:30:00',
  '08:30:00',
  'active',
  true,
  (SELECT current_setting('app.org_id')::uuid),
  now(),
  now()
),
(
  (SELECT id FROM routes WHERE name = 'Afternoon Return Route' LIMIT 1),
  (SELECT id FROM profiles WHERE email = 'sarah.wilson@sampletransport.com' LIMIT 1),
  (SELECT id FROM vehicles WHERE vehicle_number = 'VAN002' LIMIT 1),
  CURRENT_DATE,
  '15:00:00',
  '16:00:00',
  'active',
  true,
  (SELECT current_setting('app.org_id')::uuid),
  now(),
  now()
);

-- Display the inserted data
SELECT 'Sample Vehicles:' as info;
SELECT vehicle_number, make, model, license_plate, status, fuel_level
FROM vehicles 
WHERE organization_id = (SELECT current_setting('app.org_id')::uuid);

SELECT 'Sample Routes:' as info;
SELECT name, start_location, end_location, estimated_time 
FROM routes 
WHERE organization_id = (SELECT current_setting('app.org_id')::uuid);

SELECT 'Sample Drivers:' as info;
SELECT first_name, last_name, phone, role 
FROM profiles 
WHERE organization_id = (SELECT current_setting('app.org_id')::uuid) AND role = 'driver';

SELECT 'Today''s Route Assignments:' as info;
SELECT 
  ra.id,
  r.name as route_name,
  CONCAT(p.first_name, ' ', p.last_name) as driver_name,
  v.vehicle_number,
  ra.start_time,
  ra.end_time,
  ra.status
FROM route_assignments ra
JOIN routes r ON ra.route_id = r.id
JOIN profiles p ON ra.driver_id = p.id
JOIN vehicles v ON ra.vehicle_id = v.id
WHERE ra.assignment_date = CURRENT_DATE
AND ra.organization_id = (SELECT current_setting('app.org_id')::uuid);
