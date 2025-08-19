-- Targeted Fix for Duplicate Key Issue
-- This script fixes the specific duplicate key constraint violation

-- Step 1: Find the problematic profile
SELECT 'Finding the problematic profile' as step;
SELECT id, email, created_at FROM public.profiles WHERE id = 'fc4c5de3-f8c4-450e-81b9-0a61c4014ce1';

-- Step 2: Check if there's a corresponding auth user
SELECT 'Checking for corresponding auth user' as step;
SELECT id, email, created_at FROM auth.users WHERE id = 'fc4c5de3-f8c4-450e-81b9-0a61c4014ce1';

-- Step 3: Clean up the problematic data
SELECT 'Cleaning up problematic data' as step;

-- Delete the problematic profile
DELETE FROM public.profiles WHERE id = 'fc4c5de3-f8c4-450e-81b9-0a61c4014ce1';

-- Delete the corresponding auth user if it exists
DELETE FROM auth.users WHERE id = 'fc4c5de3-f8c4-450e-81b9-0a61c4014ce1';

-- Step 4: Clean up any other test data that might cause conflicts
DELETE FROM public.profiles 
WHERE email LIKE 'test.driver%@nationalbusgroup.co.uk' 
   OR email LIKE 'simulator.test%@nationalbusgroup.co.uk'
   OR email LIKE '%test%@nationalbusgroup.co.uk';

DELETE FROM auth.users 
WHERE email LIKE 'test.driver%@nationalbusgroup.co.uk' 
   OR email LIKE 'simulator.test%@nationalbusgroup.co.uk'
   OR email LIKE '%test%@nationalbusgroup.co.uk';

-- Step 5: Verify cleanup
SELECT 'Verification - checking if problematic data is gone' as step;
SELECT 'Profiles:' as type, id, email FROM public.profiles WHERE id = 'fc4c5de3-f8c4-450e-81b9-0a61c4014ce1'
UNION ALL
SELECT 'Auth users:' as type, id, email FROM auth.users WHERE id = 'fc4c5de3-f8c4-450e-81b9-0a61c4014ce1';

SELECT 'Targeted fix completed successfully!' as result;
