-- Fix Profile Creation Duplicate Key Issue
-- This script cleans up any conflicting data and ensures clean profile creation

DO $$
DECLARE
  conflicting_id uuid;
  default_org_id uuid;
BEGIN
  RAISE NOTICE 'Starting profile creation fix...';

  -- Get default organization ID
  SELECT organization_id INTO default_org_id
  FROM public.profiles
  WHERE email = 'transport@nationalbusgroup.co.uk'
  LIMIT 1;

  IF default_org_id IS NULL THEN
    RAISE EXCEPTION 'Default organization not found';
  END IF;

  RAISE NOTICE 'Using default organization ID: %', default_org_id;

  -- Check for any profiles with the same email as our test driver
  SELECT id INTO conflicting_id
  FROM public.profiles
  WHERE email LIKE 'test.driver%@nationalbusgroup.co.uk'
  LIMIT 1;

  IF conflicting_id IS NOT NULL THEN
    RAISE NOTICE 'Found conflicting profile with ID: %', conflicting_id;
    
    -- Check if there's a corresponding auth user
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = conflicting_id) THEN
      RAISE NOTICE 'Deleting conflicting auth user...';
      DELETE FROM auth.users WHERE id = conflicting_id;
    END IF;
    
    -- Delete the conflicting profile
    RAISE NOTICE 'Deleting conflicting profile...';
    DELETE FROM public.profiles WHERE id = conflicting_id;
    
    RAISE NOTICE 'Conflicting data cleaned up';
  ELSE
    RAISE NOTICE 'No conflicting profiles found';
  END IF;

  -- Check for any auth users without corresponding profiles
  RAISE NOTICE 'Checking for orphaned auth users...';
  
  DELETE FROM auth.users 
  WHERE id IN (
    SELECT u.id 
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
    WHERE p.id IS NULL
    AND u.email LIKE 'test.driver%@nationalbusgroup.co.uk'
  );
  
  GET DIAGNOSTICS conflicting_id = ROW_COUNT;
  RAISE NOTICE 'Cleaned up % orphaned auth users', conflicting_id;

  -- Ensure all profiles have proper organization_id
  RAISE NOTICE 'Fixing profiles without organization_id...';
  
  UPDATE public.profiles 
  SET organization_id = default_org_id
  WHERE organization_id IS NULL;
  
  GET DIAGNOSTICS conflicting_id = ROW_COUNT;
  RAISE NOTICE 'Updated % profiles with organization_id', conflicting_id;

  RAISE NOTICE 'Profile creation fix completed successfully!';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error during profile creation fix: %', SQLERRM;
    RAISE;
END $$ LANGUAGE plpgsql;
