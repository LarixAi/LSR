-- Comprehensive Backend Fix and Test Driver Creation
-- This script fixes all backend issues and creates a test driver

DO $$
DECLARE
  profile_record RECORD;
  default_org_id uuid;
  test_user_id uuid;
BEGIN
  RAISE NOTICE 'Starting comprehensive backend fix...';

  -- Get default organization ID
  SELECT organization_id INTO default_org_id
  FROM public.profiles
  WHERE email = 'transport@nationalbusgroup.co.uk'
  LIMIT 1;

  IF default_org_id IS NULL THEN
    RAISE EXCEPTION 'Default organization not found';
  END IF;

  RAISE NOTICE 'Using default organization ID: %', default_org_id;

  -- Fix 1: Create missing auth users for profiles that don't have them
  RAISE NOTICE 'Fixing profiles without auth users...';
  
  FOR profile_record IN 
    SELECT p.id, p.email, p.first_name, p.last_name, p.role
    FROM public.profiles p
    LEFT JOIN auth.users u ON p.id = u.id
    WHERE u.id IS NULL
  LOOP
    RAISE NOTICE 'Creating auth user for profile: % (%)', profile_record.email, profile_record.id;
    
    -- Create auth user
    INSERT INTO auth.users (
      id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_user_meta_data
    )
    VALUES (
      profile_record.id,
      profile_record.email,
      crypt('TempPass123!', gen_salt('bf')),
      now(), now(), now(),
      jsonb_build_object(
        'first_name', profile_record.first_name,
        'last_name', profile_record.last_name,
        'role', profile_record.role
      )
    );
    
    RAISE NOTICE 'Created auth user for: %', profile_record.email;
  END LOOP;

  -- Fix 2: Update profiles without organization_id
  RAISE NOTICE 'Fixing profiles without organization_id...';
  
  UPDATE public.profiles 
  SET organization_id = default_org_id
  WHERE organization_id IS NULL;
  
  GET DIAGNOSTICS profile_record = ROW_COUNT;
  RAISE NOTICE 'Updated % profiles with organization_id', profile_record;

  -- Fix 3: Ensure all profiles have required fields
  RAISE NOTICE 'Ensuring all profiles have required fields...';
  
  UPDATE public.profiles 
  SET 
    is_active = COALESCE(is_active, true),
    role = COALESCE(role, 'driver'),
    must_change_password = COALESCE(must_change_password, false)
  WHERE is_active IS NULL OR role IS NULL OR must_change_password IS NULL;
  
  GET DIAGNOSTICS profile_record = ROW_COUNT;
  RAISE NOTICE 'Updated % profiles with required fields', profile_record;

  -- Now create the test driver
  RAISE NOTICE 'Creating test driver...';
  
  -- Check if test driver already exists
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE email = 'test.driver@nationalbusgroup.co.uk'
  ) THEN
    RAISE NOTICE 'Test driver already exists';
  ELSE
    -- Create Auth user first
    INSERT INTO auth.users (
      id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_user_meta_data
    )
    VALUES (
      gen_random_uuid(),
      'test.driver@nationalbusgroup.co.uk',
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
      phone, address, city, state, zip_code,
      hire_date, cdl_number, medical_card_expiry,
      created_at, updated_at
    )
    VALUES (
      test_user_id, 'test.driver@nationalbusgroup.co.uk', 'Test', 'Driver', 'driver',
      default_org_id, true, true,
      '+1234567890', '123 Test Street', 'Test City', 'TS', '12345',
      CURRENT_DATE, 'TEST123456', CURRENT_DATE + INTERVAL '1 year',
      now(), now()
    );

    RAISE NOTICE 'Profile created successfully';
    RAISE NOTICE 'Test driver created successfully!';
    RAISE NOTICE 'Email: test.driver@nationalbusgroup.co.uk';
    RAISE NOTICE 'Password: TempPass123!';
    RAISE NOTICE 'User ID: %', test_user_id;
  END IF;

  RAISE NOTICE 'Comprehensive backend fix completed successfully!';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error during backend fix: %', SQLERRM;
    RAISE;
END $$ LANGUAGE plpgsql;

