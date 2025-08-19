-- Sample data for testing Parent Dashboard
-- This script inserts sample children, notifications, and tracking data

-- First, let's get a parent user ID (replace with actual parent user ID)
-- You can find this by running: SELECT id, email, role FROM profiles WHERE role = 'parent' LIMIT 1;

-- Sample child profiles
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
  is_active,
  created_at,
  updated_at
) VALUES 
-- Child 1
(
  (SELECT id FROM profiles WHERE role = 'parent' LIMIT 1), -- Replace with actual parent ID
  'Emma',
  'Johnson',
  '2016-03-15',
  '3rd Grade',
  '123 Oak Street, Anytown',
  '456 School Lane, Anytown',
  '07:45:00',
  '15:30:00',
  true,
  now(),
  now()
),
-- Child 2
(
  (SELECT id FROM profiles WHERE role = 'parent' LIMIT 1), -- Replace with actual parent ID
  'Liam',
  'Johnson',
  '2018-08-22',
  '1st Grade',
  '123 Oak Street, Anytown',
  '456 School Lane, Anytown',
  '07:30:00',
  '15:15:00',
  true,
  now(),
  now()
);

-- Sample parent notifications
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
  (SELECT id FROM profiles WHERE role = 'parent' LIMIT 1),
  (SELECT id FROM child_profiles WHERE first_name = 'Emma' LIMIT 1),
  'pickup',
  'Pickup Confirmed',
  'Emma has been picked up and is on route to school',
  false,
  now() - interval '30 minutes'
),
(
  (SELECT id FROM profiles WHERE role = 'parent' LIMIT 1),
  (SELECT id FROM child_profiles WHERE first_name = 'Emma' LIMIT 1),
  'delay',
  'Route Delay',
  'Bus is running 5 minutes behind schedule due to traffic',
  false,
  now() - interval '35 minutes'
),
(
  (SELECT id FROM profiles WHERE role = 'parent' LIMIT 1),
  NULL,
  'info',
  'Weekly Schedule Update',
  'New pickup times effective next week',
  true,
  now() - interval '1 day'
),
(
  (SELECT id FROM profiles WHERE role = 'parent' LIMIT 1),
  (SELECT id FROM child_profiles WHERE first_name = 'Liam' LIMIT 1),
  'dropoff',
  'Dropoff Complete',
  'Liam has been safely dropped off at school',
  false,
  now() - interval '2 hours'
);

-- Sample child tracking data for today
INSERT INTO public.child_tracking (
  child_id,
  event_type,
  location_address,
  timestamp,
  notes
) VALUES 
-- Emma's tracking for today
(
  (SELECT id FROM child_profiles WHERE first_name = 'Emma' LIMIT 1),
  'pickup',
  '123 Oak Street, Anytown',
  now() - interval '30 minutes',
  'Picked up from home'
),
(
  (SELECT id FROM child_profiles WHERE first_name = 'Emma' LIMIT 1),
  'boarding',
  'Bus Stop #1',
  now() - interval '25 minutes',
  'Boarded bus'
),
-- Liam's tracking for today
(
  (SELECT id FROM child_profiles WHERE first_name = 'Liam' LIMIT 1),
  'pickup',
  '123 Oak Street, Anytown',
  now() - interval '2 hours 30 minutes',
  'Picked up from home'
),
(
  (SELECT id FROM child_profiles WHERE first_name = 'Liam' LIMIT 1),
  'dropoff',
  '456 School Lane, Anytown',
  now() - interval '2 hours',
  'Dropped off at school'
);

-- Display the inserted data
SELECT 'Child Profiles:' as info;
SELECT id, first_name, last_name, grade_level, pickup_time, dropoff_time 
FROM child_profiles 
WHERE parent_id = (SELECT id FROM profiles WHERE role = 'parent' LIMIT 1);

SELECT 'Parent Notifications:' as info;
SELECT id, type, title, message, is_read, created_at 
FROM parent_notifications 
WHERE parent_id = (SELECT id FROM profiles WHERE role = 'parent' LIMIT 1)
ORDER BY created_at DESC;

SELECT 'Child Tracking:' as info;
SELECT ct.id, cp.first_name, ct.event_type, ct.location_address, ct.timestamp
FROM child_tracking ct
JOIN child_profiles cp ON ct.child_id = cp.id
WHERE cp.parent_id = (SELECT id FROM profiles WHERE role = 'parent' LIMIT 1)
ORDER BY ct.timestamp DESC;
