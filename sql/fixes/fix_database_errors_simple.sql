-- Simple Database Fix Script
-- This script works with existing database structure and handles auth.users properly

-- 1. Check what we have first
SELECT 'Current database state:' as info;

SELECT 'Organizations:' as table_name, COUNT(*) as count FROM organizations
UNION ALL
SELECT 'Profiles:' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'Vehicles:' as table_name, COUNT(*) as count FROM vehicles
UNION ALL
SELECT 'Routes:' as table_name, COUNT(*) as count FROM routes
UNION ALL
SELECT 'Route Assignments:' as table_name, COUNT(*) as count FROM route_assignments;

-- 2. Insert sample organization if none exists
INSERT INTO public.organizations (name, address, city, state, zip_code, phone, email)
SELECT 'Sample Transport Company', '123 Main St', 'Anytown', 'CA', '12345', '555-0123', 'info@sampletransport.com'
WHERE NOT EXISTS (SELECT 1 FROM public.organizations LIMIT 1);

-- 3. Create auth users and profiles for sample drivers
-- First, create auth users if they don't exist
DO $$
DECLARE
    john_user_id UUID;
    sarah_user_id UUID;
BEGIN
    -- Create John Driver auth user
    INSERT INTO auth.users (
        id, 
        email, 
        encrypted_password, 
        email_confirmed_at, 
        created_at, 
        updated_at,
        raw_user_meta_data
    )
    SELECT 
        gen_random_uuid(),
        'john.driver@sampletransport.com',
        crypt('password123', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"first_name": "John", "last_name": "Driver", "role": "driver"}'::jsonb
    WHERE NOT EXISTS (
        SELECT 1 FROM auth.users WHERE email = 'john.driver@sampletransport.com'
    )
    RETURNING id INTO john_user_id;

    -- Create Sarah Wilson auth user
    INSERT INTO auth.users (
        id, 
        email, 
        encrypted_password, 
        email_confirmed_at, 
        created_at, 
        updated_at,
        raw_user_meta_data
    )
    SELECT 
        gen_random_uuid(),
        'sarah.wilson@sampletransport.com',
        crypt('password123', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"first_name": "Sarah", "last_name": "Wilson", "role": "driver"}'::jsonb
    WHERE NOT EXISTS (
        SELECT 1 FROM auth.users WHERE email = 'sarah.wilson@sampletransport.com'
    )
    RETURNING id INTO sarah_user_id;

    -- Create profiles for the auth users
    INSERT INTO public.profiles (id, email, first_name, last_name, role, phone, organization_id, is_active)
    SELECT 
        au.id,
        au.email,
        'John',
        'Driver',
        'driver',
        '555-0123',
        (SELECT id FROM organizations LIMIT 1),
        true
    FROM auth.users au
    WHERE au.email = 'john.driver@sampletransport.com'
    AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'john.driver@sampletransport.com');

    INSERT INTO public.profiles (id, email, first_name, last_name, role, phone, organization_id, is_active)
    SELECT 
        au.id,
        au.email,
        'Sarah',
        'Wilson',
        'driver',
        '555-0456',
        (SELECT id FROM organizations LIMIT 1),
        true
    FROM auth.users au
    WHERE au.email = 'sarah.wilson@sampletransport.com'
    AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'sarah.wilson@sampletransport.com');

END $$;

-- 4. Insert sample vehicles
INSERT INTO public.vehicles (id, organization_id, vehicle_number, make, model, year, license_plate, vehicle_type, status, fuel_level)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM organizations LIMIT 1),
  'BUS001',
  'Blue Bird',
  'Vision',
  2020,
  'ABC123',
  'school_bus',
  'active',
  85
WHERE NOT EXISTS (SELECT 1 FROM public.vehicles WHERE vehicle_number = 'BUS001');

INSERT INTO public.vehicles (id, organization_id, vehicle_number, make, model, year, license_plate, vehicle_type, status, fuel_level)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM organizations LIMIT 1),
  'VAN002',
  'Ford',
  'Transit',
  2021,
  'XYZ789',
  'passenger_van',
  'active',
  90
WHERE NOT EXISTS (SELECT 1 FROM public.vehicles WHERE vehicle_number = 'VAN002');

-- 5. Insert sample routes
INSERT INTO public.routes (id, organization_id, name, start_location, end_location, distance, estimated_time, status)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM organizations LIMIT 1),
  'Morning School Run',
  'City Center Bus Depot',
  'Lincoln Elementary School',
  8.5,
  45,
  'active'
WHERE NOT EXISTS (SELECT 1 FROM public.routes WHERE name = 'Morning School Run');

INSERT INTO public.routes (id, organization_id, name, start_location, end_location, distance, estimated_time, status)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM organizations LIMIT 1),
  'Afternoon Return Route',
  'Lincoln Elementary School',
  'Suburban Area Drop-off',
  7.2,
  40,
  'active'
WHERE NOT EXISTS (SELECT 1 FROM public.routes WHERE name = 'Afternoon Return Route');

-- 6. Insert sample route assignments for today
INSERT INTO public.route_assignments (id, route_id, driver_id, vehicle_id, assignment_date, start_time, end_time, status, is_active, organization_id)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM routes WHERE name = 'Morning School Run' LIMIT 1),
  (SELECT id FROM profiles WHERE email = 'john.driver@sampletransport.com' LIMIT 1),
  (SELECT id FROM vehicles WHERE vehicle_number = 'BUS001' LIMIT 1),
  CURRENT_DATE,
  '07:30:00',
  '08:30:00',
  'active',
  true,
  (SELECT id FROM organizations LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM route_assignments 
  WHERE route_id = (SELECT id FROM routes WHERE name = 'Morning School Run' LIMIT 1)
  AND assignment_date = CURRENT_DATE
);

INSERT INTO public.route_assignments (id, route_id, driver_id, vehicle_id, assignment_date, start_time, end_time, status, is_active, organization_id)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM routes WHERE name = 'Afternoon Return Route' LIMIT 1),
  (SELECT id FROM profiles WHERE email = 'sarah.wilson@sampletransport.com' LIMIT 1),
  (SELECT id FROM vehicles WHERE vehicle_number = 'VAN002' LIMIT 1),
  CURRENT_DATE,
  '15:00:00',
  '16:00:00',
  'active',
  true,
  (SELECT id FROM organizations LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM route_assignments 
  WHERE route_id = (SELECT id FROM routes WHERE name = 'Afternoon Return Route' LIMIT 1)
  AND assignment_date = CURRENT_DATE
);

-- 7. Display the results
SELECT 'Database fix completed successfully!' as status;

SELECT 'Updated data summary:' as info;
SELECT 'Organizations:' as table_name, COUNT(*) as count FROM organizations
UNION ALL
SELECT 'Profiles:' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'Vehicles:' as table_name, COUNT(*) as count FROM vehicles
UNION ALL
SELECT 'Routes:' as table_name, COUNT(*) as count FROM routes
UNION ALL
SELECT 'Route Assignments:' as table_name, COUNT(*) as count FROM route_assignments;

SELECT 'Today''s route assignments:' as info;
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
WHERE ra.assignment_date = CURRENT_DATE;
