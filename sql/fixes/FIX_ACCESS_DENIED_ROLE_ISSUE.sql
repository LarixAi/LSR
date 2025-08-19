-- Fix Access Denied Role Issue
-- This script ensures the current user has proper role and permissions

-- First, let's check the current user's profile
SELECT 'Current User Profile:' as info;
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  organization_id,
  is_active,
  employment_status,
  onboarding_status,
  created_at,
  updated_at
FROM public.profiles 
WHERE email = 'laronelaing1@outlook.com';

-- Update the user to have admin role if they don't already have it
UPDATE public.profiles 
SET 
  role = 'admin',
  employment_status = 'active',
  onboarding_status = 'completed',
  is_active = true,
  updated_at = now()
WHERE email = 'laronelaing1@outlook.com';

-- If the user doesn't exist, create them with admin role
INSERT INTO public.profiles (
  id,
  email,
  first_name,
  last_name,
  role,
  employment_status,
  onboarding_status,
  is_active,
  created_at,
  updated_at
)
SELECT 
  auth.uid(),
  'laronelaing1@outlook.com',
  'Larone',
  'Laing',
  'admin',
  'active',
  'completed',
  true,
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE email = 'laronelaing1@outlook.com'
);

-- Ensure the user has an organization
-- Create a default organization if none exists
INSERT INTO public.organizations (
  id,
  name,
  slug,
  type,
  is_active
)
SELECT 
  gen_random_uuid(),
  'National Bus Group',
  'national-bus-group',
  'transport',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.organizations WHERE slug = 'national-bus-group'
);

-- Update the user's organization_id
UPDATE public.profiles 
SET organization_id = (
  SELECT id FROM public.organizations WHERE slug = 'national-bus-group' LIMIT 1
)
WHERE email = 'laronelaing1@outlook.com' 
AND organization_id IS NULL;

-- Verify the fix
SELECT 'Updated User Profile:' as info;
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  organization_id,
  is_active,
  employment_status,
  onboarding_status,
  created_at,
  updated_at
FROM public.profiles 
WHERE email = 'laronelaing1@outlook.com';

-- Check organization
SELECT 'User Organization:' as info;
SELECT 
  o.id,
  o.name,
  o.slug,
  o.type,
  o.is_active
FROM public.organizations o
JOIN public.profiles p ON p.organization_id = o.id
WHERE p.email = 'laronelaing1@outlook.com';

-- Show all profiles by role for verification
SELECT 'All Profiles by Role:' as info;
SELECT 
  role,
  COUNT(*) as count,
  STRING_AGG(email, ', ') as emails
FROM public.profiles 
GROUP BY role
ORDER BY role;
