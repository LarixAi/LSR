-- Fix Mechanic Role Enum Issue
-- This script creates the user_role enum with mechanic role included

-- First, let's check what enum exists
SELECT 'Current Enum Values:' as info;
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
ORDER BY enumsortorder;

-- Drop the existing enum if it exists and recreate it with all roles
DO $$ 
BEGIN
    -- Drop the enum if it exists
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        -- First, drop any columns that use this enum
        ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;
        
        -- Drop the enum
        DROP TYPE user_role;
        RAISE NOTICE 'Dropped existing user_role enum';
    END IF;
    
    -- Create the enum with all roles including mechanic
    CREATE TYPE user_role AS ENUM (
        'admin', 
        'driver', 
        'mechanic', 
        'parent', 
        'council', 
        'compliance_officer',
        'super_admin'
    );
    
    RAISE NOTICE 'Created user_role enum with mechanic role';
END $$;

-- Add the role column back to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'driver';

-- Update Jimmy's role to mechanic
UPDATE profiles 
SET 
  role = 'mechanic'::user_role,
  first_name = 'Jimmy',
  last_name = 'Brick',
  updated_at = NOW()
WHERE email = 'laronelaing3@outlook.com';

-- Verify the enum was created correctly
SELECT 'New Enum Values:' as info;
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
ORDER BY enumsortorder;

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
