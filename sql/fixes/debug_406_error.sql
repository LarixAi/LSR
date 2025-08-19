-- Debug 406 Error for driver_vehicle_assignments table

-- 1. Check if the table exists
SELECT 
  table_name,
  CASE 
    WHEN table_name IS NOT NULL THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'driver_vehicle_assignments';

-- 2. Check table structure if it exists
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'driver_vehicle_assignments'
ORDER BY column_name;

-- 3. Check RLS policies
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
  AND tablename = 'driver_vehicle_assignments'
ORDER BY policyname;

-- 4. Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'driver_vehicle_assignments';

-- 5. Check for any data in the table
SELECT COUNT(*) as total_records FROM public.driver_vehicle_assignments;

-- 6. Check current user context
SELECT 
  current_user as current_user,
  session_user as session_user,
  auth.uid() as auth_uid;

-- 7. Test a simple query to see the exact error
-- This will help identify if it's an RLS issue or data issue
SELECT 
  id,
  driver_id,
  vehicle_id,
  status,
  created_at
FROM public.driver_vehicle_assignments
LIMIT 5;
