-- Check user roles and permissions
-- This will help identify why the password change is failing

-- Check all profiles and their roles
SELECT 
  id,
  email,
  role,
  organization_id,
  created_at,
  is_active
FROM public.profiles 
ORDER BY created_at DESC;

-- Check if there are any users with admin/council/super_admin roles
SELECT 
  role,
  COUNT(*) as count
FROM public.profiles 
WHERE role IN ('admin', 'council', 'super_admin')
GROUP BY role;

-- Check if there are any users with driver role
SELECT 
  role,
  COUNT(*) as count
FROM public.profiles 
WHERE role = 'driver'
GROUP BY role;

-- Check organization distribution
SELECT 
  organization_id,
  role,
  COUNT(*) as count
FROM public.profiles 
GROUP BY organization_id, role
ORDER BY organization_id, role;

-- Show success message
SELECT 'User roles and permissions checked successfully!' as status;
