-- Simple Fix for Duplicate Key Issue
-- This script directly addresses the profiles_pkey constraint violation

-- Step 1: Check what's causing the duplicate key
SELECT 'Checking for existing profiles with test driver emails' as step;
SELECT id, email FROM public.profiles WHERE email LIKE 'test.driver%@nationalbusgroup.co.uk' OR email LIKE 'simulator.test%@nationalbusgroup.co.uk';

-- Step 2: Check for orphaned auth users
SELECT 'Checking for orphaned auth users' as step;
SELECT u.id, u.email FROM auth.users u 
LEFT JOIN public.profiles p ON u.id = p.id 
WHERE p.id IS NULL 
AND (u.email LIKE 'test.driver%@nationalbusgroup.co.uk' OR u.email LIKE 'simulator.test%@nationalbusgroup.co.uk');

-- Step 3: Clean up any conflicting data
SELECT 'Cleaning up conflicting data' as step;

-- Delete orphaned auth users first
DELETE FROM auth.users 
WHERE id IN (
  SELECT u.id 
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  WHERE p.id IS NULL
  AND (u.email LIKE 'test.driver%@nationalbusgroup.co.uk' OR u.email LIKE 'simulator.test%@nationalbusgroup.co.uk')
);

-- Delete conflicting profiles
DELETE FROM public.profiles 
WHERE email LIKE 'test.driver%@nationalbusgroup.co.uk' 
   OR email LIKE 'simulator.test%@nationalbusgroup.co.uk';

-- Step 4: Verify cleanup
SELECT 'Verification - checking remaining test data' as step;
SELECT 'Profiles:' as type, id, email FROM public.profiles WHERE email LIKE 'test.driver%@nationalbusgroup.co.uk' OR email LIKE 'simulator.test%@nationalbusgroup.co.uk'
UNION ALL
SELECT 'Auth users:' as type, id, email FROM auth.users WHERE email LIKE 'test.driver%@nationalbusgroup.co.uk' OR email LIKE 'simulator.test%@nationalbusgroup.co.uk';

SELECT 'Cleanup completed successfully!' as result;
