-- Create Test Driver Script for Supabase SQL Editor
-- This script creates a test driver with proper Auth user and profile

DO $$
DECLARE
  test_user_id uuid;
  test_org_id uuid;
BEGIN
  -- Get organization id from admin profile
  SELECT organization_id
  INTO test_org_id
  FROM public.profiles
  WHERE email = 'transport@nationalbusgroup.co.uk'
  LIMIT 1;

  IF test_org_id IS NULL THEN
    RAISE EXCEPTION 'Admin profile not found. Please ensure you are logged in as transport@nationalbusgroup.co.uk';
  END IF;

  RAISE NOTICE 'Found organization ID: %', test_org_id;

  -- Check if test driver already exists
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE email = 'testdriver@nationalbusgroup.co.uk'
  ) THEN
    RAISE NOTICE 'Test driver already exists';
    RETURN;
  END IF;

  -- Create Auth user first
  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_user_meta_data
  )
  VALUES (
    gen_random_uuid(),
    'testdriver@nationalbusgroup.co.uk',
    crypt('TempPass123!', gen_salt('bf')),
    now(), now(), now(),
    '{"first_name":"Test","last_name":"Driver","role":"driver"}'::jsonb
  )
  RETURNING id INTO test_user_id;

  RAISE NOTICE 'Auth user created with ID: %', test_user_id;

  -- Create profile using the Auth user id
  INSERT INTO public.profiles (
    id, email, first_name, last_name, role,
    organization_id, is_active, must_change_password,
    created_at, updated_at
  )
  VALUES (
    test_user_id, 'testdriver@nationalbusgroup.co.uk', 'Test', 'Driver', 'driver',
    test_org_id, true, true, now(), now()
  );

  RAISE NOTICE 'Profile created successfully';
  RAISE NOTICE 'Test driver created successfully!';
  RAISE NOTICE 'Email: testdriver@nationalbusgroup.co.uk';
  RAISE NOTICE 'Password: TempPass123!';
  RAISE NOTICE 'User ID: %', test_user_id;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
    -- Clean up Auth user if it was created
    IF test_user_id IS NOT NULL THEN
      DELETE FROM auth.users WHERE id = test_user_id;
      RAISE NOTICE 'Cleaned up Auth user due to error';
    END IF;
    RAISE;
END $$ LANGUAGE plpgsql;

