-- Debug script to test password change functionality
-- This will help identify why the Edge Function is returning a 400 error

-- Check if the profiles table has the correct structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if there are any profiles with the required fields
SELECT 
  id,
  email,
  role,
  organization_id,
  created_at
FROM public.profiles 
LIMIT 5;

-- Check the helper functions we created
SELECT 
  get_user_org_id() as user_org_id,
  is_user_admin() as is_admin,
  check_profile_exists() as profile_exists;

-- Check RLS policies on profiles table
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
WHERE tablename = 'profiles';

-- Show success message
SELECT 'Debug information collected successfully!' as status;
