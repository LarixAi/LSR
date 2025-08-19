-- Fix Mechanic Role for Jimmy Brick
-- This script updates the role for the new mechanic account

-- First, let's check the current profiles to see the issue
SELECT 'Current Profiles:' as info;
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  created_at
FROM profiles 
WHERE email = 'laronelaing3@outlook.com' 
   OR first_name = 'jimmy' 
   OR last_name = 'brick'
ORDER BY created_at DESC;

-- Update the role to 'mechanic' for the new account
UPDATE profiles 
SET 
  role = 'mechanic',
  updated_at = NOW()
WHERE email = 'laronelaing3@outlook.com';

-- Also update by name if email doesn't match
UPDATE profiles 
SET 
  role = 'mechanic',
  updated_at = NOW()
WHERE (first_name ILIKE '%jimmy%' OR first_name ILIKE '%jim%') 
  AND (last_name ILIKE '%brick%' OR last_name ILIKE '%briwck%');

-- Verify the update
SELECT 'Updated Profile:' as info;
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  created_at,
  updated_at
FROM profiles 
WHERE email = 'laronelaing3@outlook.com' 
   OR (first_name ILIKE '%jimmy%' AND last_name ILIKE '%brick%')
   OR (first_name ILIKE '%jimmy%' AND last_name ILIKE '%briwck%')
ORDER BY created_at DESC;

-- Show all mechanic profiles
SELECT 'All Mechanic Profiles:' as info;
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  created_at
FROM profiles 
WHERE role = 'mechanic'
ORDER BY created_at DESC;

-- Show all profiles for reference
SELECT 'All Profiles by Role:' as info;
SELECT 
  role,
  COUNT(*) as count,
  STRING_AGG(email, ', ') as emails
FROM profiles 
GROUP BY role
ORDER BY role;
