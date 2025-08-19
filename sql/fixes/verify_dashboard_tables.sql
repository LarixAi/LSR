-- Verify Driver Dashboard Tables and Structure

-- Check if required tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IS NOT NULL THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('driver_vehicle_assignments', 'fuel_purchases', 'vehicle_checks')
ORDER BY table_name;

-- Check routes table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'routes'
  AND column_name IN ('name', 'driver_id', 'start_time', 'end_time', 'destination', 'priority')
ORDER BY column_name;

-- Check vehicles table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'vehicles'
  AND column_name IN ('fuel_level', 'last_maintenance_date', 'next_maintenance_date')
ORDER BY column_name;

-- Check driver_vehicle_assignments table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'driver_vehicle_assignments'
ORDER BY column_name;

-- Check fuel_purchases table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'fuel_purchases'
ORDER BY column_name;

-- Check vehicle_checks table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'vehicle_checks'
ORDER BY column_name;

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('driver_vehicle_assignments', 'fuel_purchases', 'vehicle_checks')
ORDER BY tablename, policyname;

-- Check sample data (if any exists)
SELECT 'driver_vehicle_assignments' as table_name, COUNT(*) as record_count FROM public.driver_vehicle_assignments
UNION ALL
SELECT 'fuel_purchases' as table_name, COUNT(*) as record_count FROM public.fuel_purchases
UNION ALL
SELECT 'vehicle_checks' as table_name, COUNT(*) as record_count FROM public.vehicle_checks
ORDER BY table_name;
