-- Verify Parent Tables Creation
-- This script checks if all parent-related tables exist

-- Check if tables exist
SELECT 'Checking parent tables...' as status;

SELECT 
  table_name,
  CASE 
    WHEN table_name IS NOT NULL THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('child_profiles', 'parent_notifications', 'child_tracking')
ORDER BY table_name;

-- Check if we have any parent users
SELECT 'Checking for parent users...' as status;
SELECT 
  id,
  email,
  role,
  first_name,
  last_name
FROM profiles 
WHERE role = 'parent'
LIMIT 5;

-- Check table structures
SELECT 'Table structures:' as info;

-- child_profiles structure
SELECT 'child_profiles columns:' as table_info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'child_profiles'
ORDER BY ordinal_position;

-- parent_notifications structure  
SELECT 'parent_notifications columns:' as table_info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'parent_notifications'
ORDER BY ordinal_position;

-- child_tracking structure
SELECT 'child_tracking columns:' as table_info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'child_tracking'
ORDER BY ordinal_position;
