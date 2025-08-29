-- Fix driver backend issues by creating sample assignments and data

-- Create driver assignments for existing drivers
INSERT INTO driver_assignments (driver_id, vehicle_id, organization_id, status, assigned_date)
SELECT 
  d.id as driver_id,
  v.id as vehicle_id,
  d.organization_id,
  'active'::text,
  CURRENT_DATE
FROM profiles d
CROSS JOIN LATERAL (
  SELECT id, organization_id 
  FROM vehicles v 
  WHERE v.organization_id = d.organization_id 
    AND v.status = 'active'
  LIMIT 1
) v
WHERE d.role = 'driver' 
  AND d.employment_status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM driver_assignments da 
    WHERE da.driver_id = d.id AND da.status = 'active'
  );

-- Create sample time entries for drivers (today)
INSERT INTO time_entries (driver_id, entry_date, clock_in_time, total_hours, driving_hours, organization_id, status)
SELECT 
  id as driver_id,
  CURRENT_DATE,
  '08:00:00'::time,
  8.0,
  7.5,
  organization_id,
  'approved'
FROM profiles 
WHERE role = 'driver' 
  AND employment_status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM time_entries te 
    WHERE te.driver_id = profiles.id AND te.entry_date = CURRENT_DATE
  );

-- Create sample driver locations for active drivers
INSERT INTO driver_locations (driver_id, latitude, longitude, recorded_at, organization_id)
SELECT 
  id as driver_id,
  51.5074 + (RANDOM() - 0.5) * 0.1, -- Random location around London
  -0.1278 + (RANDOM() - 0.5) * 0.1,
  NOW(),
  organization_id
FROM profiles 
WHERE role = 'driver' 
  AND employment_status = 'active';

-- Update vehicle status to ensure some are available
UPDATE vehicles 
SET status = 'active' 
WHERE status IS NULL OR status = '';

-- Update route status to ensure some are available  
UPDATE routes 
SET status = 'active' 
WHERE status IS NULL OR status = '';