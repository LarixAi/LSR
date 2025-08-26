-- =============================================================================
-- COMPLETE DATABASE SETUP - ORGANIZATION, PROFILES, AND SAMPLE DATA
-- This script sets up everything needed for the application to work
-- =============================================================================

-- Step 1: Create the National Bus Group organization
INSERT INTO public.organizations (
    id,
    name,
    slug,
    contact_email,
    type,
    address,
    phone,
    email,
    is_active,
    created_at,
    updated_at
) VALUES (
    'd1ad845e-8989-4563-9691-dc1b3c86c4ce',
    'National Bus Group',
    'national-bus-group',
    'transport@nationalbusgroup.co.uk',
    'transport',
    '123 Transport Way, London, UK',
    '+44 20 1234 5678',
    'transport@nationalbusgroup.co.uk',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Step 2: Create admin profile (this will be linked to auth user later)
INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    role,
    organization_id,
    employment_status,
    onboarding_status,
    is_active,
    phone,
    employee_id,
    created_at,
    updated_at
) VALUES (
    'ab16ec78-d131-428d-9538-1e33d5b7d7ce', -- This should match the auth user ID
    'transport@nationalbusgroup.co.uk',
    'Transport',
    'Admin',
    'admin',
    'd1ad845e-8989-4563-9691-dc1b3c86c4ce',
    'active',
    'completed',
    true,
    '+44 20 1234 5678',
    'NBG-ADMIN-001',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Step 3: Create sample driver profiles
INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    role,
    organization_id,
    employment_status,
    onboarding_status,
    is_active,
    phone,
    employee_id,
    created_at,
    updated_at
) VALUES 
(
    'aa7b3551-61c2-4d2b-92d0-939d23de1e2e', -- John Driver
    'john.driver@sampletransport.com',
    'John',
    'Driver',
    'driver',
    'd1ad845e-8989-4563-9691-dc1b3c86c4ce',
    'active',
    'completed',
    true,
    '+44 7700 900001',
    'NBG-DR-001',
    NOW(),
    NOW()
),
(
    'bb8c4662-72d3-5e3c-a3e1-04ae34ef2f3f', -- Sarah Wilson
    'sarah.wilson@sampletransport.com',
    'Sarah',
    'Wilson',
    'driver',
    'd1ad845e-8989-4563-9691-dc1b3c86c4ce',
    'active',
    'completed',
    true,
    '+44 7700 900002',
    'NBG-DR-002',
    NOW(),
    NOW()
),
(
    'cc9d5773-83e4-6f4d-b4f2-15bf45fg3g4g', -- Mike Johnson
    'mike.johnson@sampletransport.com',
    'Mike',
    'Johnson',
    'driver',
    'd1ad845e-8989-4563-9691-dc1b3c86c4ce',
    'active',
    'completed',
    true,
    '+44 7700 900003',
    'NBG-DR-003',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Step 4: Create sample vehicles
INSERT INTO public.vehicles (
    id,
    organization_id,
    vehicle_number,
    make,
    model,
    year,
    license_plate,
    vehicle_type,
    status,
    fuel_level,
    last_maintenance_date,
    next_maintenance_date,
    created_at,
    updated_at
) VALUES 
(
    'd6994b54-8255-4f33-b4b6-fba4909d499f',
    'd1ad845e-8989-4563-9691-dc1b3c86c4ce',
    'BUS001',
    'Blue Bird',
    'Vision',
    2022,
    'BUS 001A',
    'bus',
    'active',
    85,
    '2025-07-15',
    '2025-09-15',
    NOW(),
    NOW()
),
(
    'c9c356c9-141e-413b-a03a-355a4d77d661',
    'd1ad845e-8989-4563-9691-dc1b3c86c4ce',
    'NBG-001',
    'Mercedes-Benz',
    'Sprinter',
    2022,
    'NBG 001A',
    'passenger',
    'active',
    75,
    '2025-08-01',
    '2025-10-01',
    NOW(),
    NOW()
),
(
    '0f258283-8402-4cc5-b928-76f844a32b42',
    'd1ad845e-8989-4563-9691-dc1b3c86c4ce',
    'NBG-002',
    'Ford',
    'Transit',
    2021,
    'NBG 002B',
    'passenger',
    'active',
    65,
    '2025-06-20',
    '2025-08-20',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Step 5: Create sample jobs (if jobs table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'jobs') THEN
        INSERT INTO public.jobs (
            id,
            organization_id,
            title,
            description,
            status,
            priority,
            assigned_to,
            created_at,
            updated_at
        ) VALUES 
        (
            gen_random_uuid(),
            'd1ad845e-8989-4563-9691-dc1b3c86c4ce',
            'Morning School Route',
            'Transport students to local schools',
            'active',
            'high',
            'aa7b3551-61c2-4d2b-92d0-939d23de1e2e',
            NOW(),
            NOW()
        ),
        (
            gen_random_uuid(),
            'd1ad845e-8989-4563-9691-dc1b3c86c4ce',
            'Afternoon Return Route',
            'Return students from schools',
            'active',
            'high',
            'bb8c4662-72d3-5e3c-a3e1-04ae34ef2f3f',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Added sample jobs';
    ELSE
        RAISE NOTICE 'Jobs table does not exist, skipping job creation';
    END IF;
END $$;

-- Step 6: Create sample routes (if routes table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'routes') THEN
        INSERT INTO public.routes (
            id,
            organization_id,
            name,
            description,
            status,
            created_at,
            updated_at
        ) VALUES 
        (
            gen_random_uuid(),
            'd1ad845e-8989-4563-9691-dc1b3c86c4ce',
            'School Route 1',
            'Primary school pickup and dropoff route',
            'active',
            NOW(),
            NOW()
        ),
        (
            gen_random_uuid(),
            'd1ad845e-8989-4563-9691-dc1b3c86c4ce',
            'School Route 2',
            'Secondary school pickup and dropoff route',
            'active',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Added sample routes';
    ELSE
        RAISE NOTICE 'Routes table does not exist, skipping route creation';
    END IF;
END $$;

-- Step 7: Verify the setup
DO $$
DECLARE
    org_count INTEGER;
    profile_count INTEGER;
    vehicle_count INTEGER;
BEGIN
    -- Count organizations
    SELECT COUNT(*) INTO org_count FROM public.organizations;
    
    -- Count profiles
    SELECT COUNT(*) INTO profile_count FROM public.profiles;
    
    -- Count vehicles
    SELECT COUNT(*) INTO vehicle_count FROM public.vehicles;
    
    RAISE NOTICE 'DATABASE SETUP COMPLETE!';
    RAISE NOTICE 'Organizations: %', org_count;
    RAISE NOTICE 'Profiles: %', profile_count;
    RAISE NOTICE 'Vehicles: %', vehicle_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Admin: transport@nationalbusgroup.co.uk';
    RAISE NOTICE 'Drivers: john.driver@sampletransport.com, sarah.wilson@sampletransport.com, mike.johnson@sampletransport.com';
    RAISE NOTICE '';
    RAISE NOTICE 'NEXT STEPS:';
    RAISE NOTICE '1. Create auth users for the profiles using the create-missing-auth-user function';
    RAISE NOTICE '2. Test admin login in the application';
    RAISE NOTICE '3. Test password reset functionality';
END $$;



