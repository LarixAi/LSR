-- Comprehensive Database Error Check and Fix
-- This script will identify and fix common database issues

-- 1. Check if tables exist
SELECT 'Checking table existence...' as info;

SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('organizations', 'profiles', 'vehicles', 'routes', 'route_assignments', 'job_assignments', 'jobs') 
    THEN 'EXISTS' 
    ELSE 'MISSING' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('organizations', 'profiles', 'vehicles', 'routes', 'route_assignments', 'job_assignments', 'jobs');

-- 2. Check organizations table
SELECT 'Checking organizations table...' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'organizations' 
ORDER BY ordinal_position;

-- 3. Check profiles table
SELECT 'Checking profiles table...' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles' 
ORDER BY ordinal_position;

-- 4. Check vehicles table
SELECT 'Checking vehicles table...' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'vehicles' 
ORDER BY ordinal_position;

-- 5. Check routes table
SELECT 'Checking routes table...' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'routes' 
ORDER BY ordinal_position;

-- 6. Check route_assignments table
SELECT 'Checking route_assignments table...' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'route_assignments' 
ORDER BY ordinal_position;

-- 7. Check if there are any existing organizations
SELECT 'Checking existing organizations...' as info;
SELECT COUNT(*) as org_count FROM organizations;

-- 8. Check if there are any existing profiles
SELECT 'Checking existing profiles...' as info;
SELECT COUNT(*) as profile_count FROM profiles;

-- 9. Check if there are any existing vehicles
SELECT 'Checking existing vehicles...' as info;
SELECT COUNT(*) as vehicle_count FROM vehicles;

-- 10. Check if there are any existing routes
SELECT 'Checking existing routes...' as info;
SELECT COUNT(*) as route_count FROM routes;

-- 11. Check if there are any existing route_assignments
SELECT 'Checking existing route_assignments...' as info;
SELECT COUNT(*) as route_assignment_count FROM route_assignments;
