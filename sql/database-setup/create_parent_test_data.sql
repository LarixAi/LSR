-- Create Parent Test Data
-- This script creates sample parent data for testing the Parent Schedule functionality

-- 1. Create a parent auth user
DO $$
DECLARE
    parent_user_id UUID;
BEGIN
    -- Create parent auth user
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
        'parent.johnson@example.com',
        crypt('password123', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"first_name": "Sarah", "last_name": "Johnson", "role": "parent"}'::jsonb
    WHERE NOT EXISTS (
        SELECT 1 FROM auth.users WHERE email = 'parent.johnson@example.com'
    )
    RETURNING id INTO parent_user_id;

    -- Create parent profile
    INSERT INTO public.profiles (id, email, first_name, last_name, role, phone, organization_id, is_active)
    SELECT 
        au.id,
        au.email,
        'Sarah',
        'Johnson',
        'parent',
        '555-0124',
        (SELECT id FROM organizations LIMIT 1),
        true
    FROM auth.users au
    WHERE au.email = 'parent.johnson@example.com'
    AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'parent.johnson@example.com');

END $$;

-- 2. Create sample children for the parent
INSERT INTO public.child_profiles (
  parent_id,
  first_name,
  last_name,
  date_of_birth,
  grade_level,
  pickup_location,
  dropoff_location,
  pickup_time,
  dropoff_time,
  route_id,
  is_active,
  created_at,
  updated_at
) VALUES 
-- Child 1 - Emma Johnson (assigned to Morning School Run route)
(
  (SELECT id FROM profiles WHERE email = 'parent.johnson@example.com' LIMIT 1),
  'Emma',
  'Johnson',
  '2016-03-15',
  '3rd Grade',
  '123 Oak Street, Anytown',
  'Lincoln Elementary School',
  '07:45:00',
  '15:30:00',
  (SELECT id FROM routes WHERE name = 'Morning School Run' LIMIT 1),
  true,
  now(),
  now()
),
-- Child 2 - Liam Johnson (assigned to Afternoon Return Route)
(
  (SELECT id FROM profiles WHERE email = 'parent.johnson@example.com' LIMIT 1),
  'Liam',
  'Johnson',
  '2018-08-22',
  '1st Grade',
  '123 Oak Street, Anytown',
  'Lincoln Elementary School',
  '07:30:00',
  '15:15:00',
  (SELECT id FROM routes WHERE name = 'Afternoon Return Route' LIMIT 1),
  true,
  now(),
  now()
);

-- 3. Create sample parent notifications
INSERT INTO public.parent_notifications (
  parent_id,
  child_id,
  type,
  title,
  message,
  is_read,
  created_at
) VALUES 
(
  (SELECT id FROM profiles WHERE email = 'parent.johnson@example.com' LIMIT 1),
  (SELECT id FROM child_profiles WHERE first_name = 'Emma' LIMIT 1),
  'pickup',
  'Pickup Confirmed',
  'Emma has been picked up and is on route to school',
  false,
  now() - interval '30 minutes'
),
(
  (SELECT id FROM profiles WHERE email = 'parent.johnson@example.com' LIMIT 1),
  (SELECT id FROM child_profiles WHERE first_name = 'Emma' LIMIT 1),
  'delay',
  'Route Delay',
  'Bus is running 5 minutes behind schedule due to traffic',
  false,
  now() - interval '35 minutes'
),
(
  (SELECT id FROM profiles WHERE email = 'parent.johnson@example.com' LIMIT 1),
  NULL,
  'info',
  'Weekly Schedule Update',
  'New pickup times effective next week',
  true,
  now() - interval '1 day'
);

-- 4. Display the created data
SELECT 'Parent Test Data Created Successfully!' as status;

SELECT 'Parent User:' as info;
SELECT 
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  p.role,
  p.organization_id
FROM profiles p
WHERE p.email = 'parent.johnson@example.com';

SELECT 'Children:' as info;
SELECT 
  cp.id,
  cp.first_name,
  cp.last_name,
  cp.grade_level,
  cp.pickup_time,
  cp.dropoff_time,
  cp.route_id,
  r.name as route_name
FROM child_profiles cp
LEFT JOIN routes r ON cp.route_id = r.id
WHERE cp.parent_id = (SELECT id FROM profiles WHERE email = 'parent.johnson@example.com' LIMIT 1);

SELECT 'Notifications:' as info;
SELECT 
  pn.id,
  pn.type,
  pn.title,
  pn.message,
  pn.is_read,
  pn.created_at
FROM parent_notifications pn
WHERE pn.parent_id = (SELECT id FROM profiles WHERE email = 'parent.johnson@example.com' LIMIT 1)
ORDER BY pn.created_at DESC;

-- 5. Show what the parent schedule would look like
SELECT 'Parent Schedule Preview:' as info;
SELECT 
  CONCAT(cp.first_name, ' ', cp.last_name) as child_name,
  CASE 
    WHEN cp.pickup_time IS NOT NULL THEN 'pickup'
    WHEN cp.dropoff_time IS NOT NULL THEN 'dropoff'
  END as type,
  COALESCE(cp.pickup_time, cp.dropoff_time) as time,
  COALESCE(cp.pickup_location, cp.dropoff_location) as location,
  CONCAT(p.first_name, ' ', p.last_name) as driver_name,
  v.vehicle_number,
  r.name as route_name
FROM child_profiles cp
JOIN routes r ON cp.route_id = r.id
JOIN route_assignments ra ON r.id = ra.route_id
JOIN profiles p ON ra.driver_id = p.id
JOIN vehicles v ON ra.vehicle_id = v.id
WHERE cp.parent_id = (SELECT id FROM profiles WHERE email = 'parent.johnson@example.com' LIMIT 1)
AND ra.assignment_date = CURRENT_DATE
AND ra.status = 'active'
ORDER BY COALESCE(cp.pickup_time, cp.dropoff_time);
