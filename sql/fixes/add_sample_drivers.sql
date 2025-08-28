-- Add Sample Drivers for Advanced Notifications Testing
-- This script creates sample driver profiles for testing the notification system

-- First, let's check if we have any organizations
SELECT 'Organizations found:' as info, COUNT(*) as count FROM public.organizations;

-- Get the first organization ID to use for sample drivers
DO $$
DECLARE
    org_id UUID;
    admin_user_id UUID;
BEGIN
    -- Get the first organization
    SELECT id INTO org_id FROM public.organizations LIMIT 1;
    
    -- Get an admin user to use as the creator
    SELECT id INTO admin_user_id FROM public.profiles WHERE role IN ('admin', 'council') LIMIT 1;
    
    -- If we have an organization, create sample drivers
    IF org_id IS NOT NULL THEN
        -- Create sample drivers
        INSERT INTO public.profiles (
            id,
            first_name,
            last_name,
            email,
            phone,
            role,
            status,
            organization_id,
            license_number,
            created_at,
            updated_at
        ) VALUES 
        (
            gen_random_uuid(),
            'John',
            'Smith',
            'john.smith@lsr-logistics.com',
            '+1234567890',
            'driver',
            'active',
            org_id,
            'DL123456789',
            NOW(),
            NOW()
        ),
        (
            gen_random_uuid(),
            'Sarah',
            'Johnson',
            'sarah.johnson@lsr-logistics.com',
            '+1234567891',
            'driver',
            'active',
            org_id,
            'DL987654321',
            NOW(),
            NOW()
        ),
        (
            gen_random_uuid(),
            'Michael',
            'Brown',
            'michael.brown@lsr-logistics.com',
            '+1234567892',
            'driver',
            'active',
            org_id,
            'DL456789123',
            NOW(),
            NOW()
        ),
        (
            gen_random_uuid(),
            'Emily',
            'Davis',
            'emily.davis@lsr-logistics.com',
            '+1234567893',
            'driver',
            'active',
            org_id,
            'DL789123456',
            NOW(),
            NOW()
        ),
        (
            gen_random_uuid(),
            'David',
            'Wilson',
            'david.wilson@lsr-logistics.com',
            '+1234567894',
            'driver',
            'active',
            org_id,
            'DL321654987',
            NOW(),
            NOW()
        ),
        (
            gen_random_uuid(),
            'Lisa',
            'Anderson',
            'lisa.anderson@lsr-logistics.com',
            '+1234567895',
            'driver',
            'active',
            org_id,
            'DL654321987',
            NOW(),
            NOW()
        ),
        (
            gen_random_uuid(),
            'Robert',
            'Taylor',
            'robert.taylor@lsr-logistics.com',
            '+1234567896',
            'driver',
            'active',
            org_id,
            'DL147258369',
            NOW(),
            NOW()
        ),
        (
            gen_random_uuid(),
            'Jennifer',
            'Martinez',
            'jennifer.martinez@lsr-logistics.com',
            '+1234567897',
            'driver',
            'active',
            org_id,
            'DL963852741',
            NOW(),
            NOW()
        )
        ON CONFLICT (email) DO NOTHING;
        
        RAISE NOTICE 'Sample drivers created for organization: %', org_id;
    ELSE
        RAISE NOTICE 'No organizations found. Please create an organization first.';
    END IF;
END $$;

-- Show the created drivers
SELECT 
    'Sample drivers created:' as info,
    COUNT(*) as count 
FROM public.profiles 
WHERE role = 'driver' 
    AND email LIKE '%@lsr-logistics.com';

-- Show all drivers in the system
SELECT 
    first_name,
    last_name,
    email,
    role,
    status,
    organization_id,
    license_number
FROM public.profiles 
WHERE role = 'driver'
ORDER BY first_name;



