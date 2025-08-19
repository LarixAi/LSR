-- Add Mechanic Role to Existing Enum (Safer Approach)
-- This script adds the mechanic role to the existing user_role enum

-- First, let's check what enum values currently exist
SELECT 'Current Enum Values:' as info;
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
ORDER BY enumsortorder;

-- Check if mechanic role already exists
DO $$ 
DECLARE
    role_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'mechanic' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    ) INTO role_exists;
    
    IF role_exists THEN
        RAISE NOTICE 'mechanic role already exists in user_role enum';
    ELSE
        -- Add mechanic role to the enum
        ALTER TYPE user_role ADD VALUE 'mechanic';
        RAISE NOTICE 'Added mechanic role to user_role enum';
    END IF;
END $$;

-- Verify the mechanic role was added
SELECT 'Updated Enum Values:' as info;
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
ORDER BY enumsortorder;

-- Now update Jimmy's role to mechanic
UPDATE profiles 
SET 
  role = 'mechanic'::user_role,
  first_name = 'Jimmy',
  last_name = 'Brick',
  updated_at = NOW()
WHERE email = 'laronelaing3@outlook.com';

-- Verify Jimmy's profile was updated
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
WHERE email = 'laronelaing3@outlook.com';

-- Show all profiles by role
SELECT 'All Profiles by Role:' as info;
SELECT 
  role,
  COUNT(*) as count,
  STRING_AGG(email, ', ') as emails
FROM profiles 
GROUP BY role
ORDER BY role;
