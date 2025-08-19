-- Create Sample Jobs for Testing DriverJobs Functionality

-- First, let's ensure we have some sample jobs for testing
-- This script will create jobs assigned to drivers in the system

-- Get a sample driver ID (assuming there's at least one driver in the system)
DO $$
DECLARE
    sample_driver_id UUID;
    sample_vehicle_id UUID;
    sample_org_id UUID;
BEGIN
    -- Get a sample driver
    SELECT id INTO sample_driver_id 
    FROM public.profiles 
    WHERE role = 'driver' 
    LIMIT 1;
    
    -- Get a sample vehicle
    SELECT id INTO sample_vehicle_id 
    FROM public.vehicles 
    LIMIT 1;
    
    -- Get a sample organization
    SELECT organization_id INTO sample_org_id 
    FROM public.profiles 
    WHERE role = 'driver' 
    LIMIT 1;
    
    -- Only proceed if we have the required data
    IF sample_driver_id IS NOT NULL AND sample_org_id IS NOT NULL THEN
        
        -- Insert sample jobs
        INSERT INTO public.jobs (
            organization_id,
            title,
            description,
            status,
            priority,
            assigned_driver_id,
            assigned_vehicle_id,
            start_date,
            end_date,
            start_time,
            end_time,
            pickup_location,
            delivery_location,
            customer_name,
            customer_contact,
            estimated_duration,
            created_by
        ) VALUES 
        -- Today's jobs
        (
            sample_org_id,
            'Morning School Run - Route 1',
            'Daily morning school transport for Elmwood Primary School students',
            'completed',
            'medium',
            sample_driver_id,
            sample_vehicle_id,
            CURRENT_DATE,
            CURRENT_DATE,
            '07:00:00',
            '09:00:00',
            'Various stops in Elmwood area',
            'Elmwood Primary School',
            'Elmwood Primary School',
            '+44 20 1234 5678',
            120,
            sample_driver_id
        ),
        (
            sample_org_id,
            'Afternoon School Run - Route 1',
            'Daily afternoon return transport for Elmwood Primary School students',
            'in_progress',
            'medium',
            sample_driver_id,
            sample_vehicle_id,
            CURRENT_DATE,
            CURRENT_DATE,
            '15:30:00',
            '17:30:00',
            'Elmwood Primary School',
            'Various stops in Elmwood area',
            'Elmwood Primary School',
            '+44 20 1234 5678',
            120,
            sample_driver_id
        ),
        (
            sample_org_id,
            'Medical Appointment Transport',
            'Transport for medical appointment at St. Mary\'s Hospital',
            'assigned',
            'high',
            sample_driver_id,
            sample_vehicle_id,
            CURRENT_DATE,
            CURRENT_DATE,
            '10:00:00',
            '12:00:00',
            'Sunset Care Home',
            'St. Mary\'s Hospital',
            'Sunset Care Home',
            '+44 20 5555 1234',
            120,
            sample_driver_id
        ),
        -- Tomorrow's jobs
        (
            sample_org_id,
            'Special Event Transport',
            'Evening cultural event transport to Royal Opera House',
            'pending',
            'medium',
            sample_driver_id,
            sample_vehicle_id,
            CURRENT_DATE + INTERVAL '1 day',
            CURRENT_DATE + INTERVAL '1 day',
            '19:00:00',
            '22:00:00',
            'City Community Center',
            'Royal Opera House',
            'Cultural Events Ltd',
            '+44 20 9876 5432',
            180,
            sample_driver_id
        ),
        (
            sample_org_id,
            'Airport Transfer',
            'Airport transfer service for business client',
            'pending',
            'high',
            sample_driver_id,
            sample_vehicle_id,
            CURRENT_DATE + INTERVAL '1 day',
            CURRENT_DATE + INTERVAL '1 day',
            '06:00:00',
            '08:00:00',
            'Central Business District',
            'Heathrow Airport',
            'Business Travel Ltd',
            '+44 20 7777 8888',
            120,
            sample_driver_id
        ),
        -- Future jobs
        (
            sample_org_id,
            'Wedding Transport',
            'Wedding day transport service for bride and groom',
            'pending',
            'urgent',
            sample_driver_id,
            sample_vehicle_id,
            CURRENT_DATE + INTERVAL '3 days',
            CURRENT_DATE + INTERVAL '3 days',
            '14:00:00',
            '18:00:00',
            'Wedding Venue',
            'Reception Hall',
            'Wedding Planners UK',
            '+44 20 9999 1111',
            240,
            sample_driver_id
        ),
        -- Past completed jobs
        (
            sample_org_id,
            'Corporate Event Transport',
            'Transport for corporate team building event',
            'completed',
            'medium',
            sample_driver_id,
            sample_vehicle_id,
            CURRENT_DATE - INTERVAL '2 days',
            CURRENT_DATE - INTERVAL '2 days',
            '09:00:00',
            '17:00:00',
            'Office Building',
            'Team Building Venue',
            'Tech Corp Ltd',
            '+44 20 4444 5555',
            480,
            sample_driver_id
        ),
        (
            sample_org_id,
            'Shopping Trip Transport',
            'Transport for elderly care home residents shopping trip',
            'completed',
            'low',
            sample_driver_id,
            sample_vehicle_id,
            CURRENT_DATE - INTERVAL '1 day',
            CURRENT_DATE - INTERVAL '1 day',
            '13:00:00',
            '16:00:00',
            'Sunset Care Home',
            'Local Shopping Center',
            'Sunset Care Home',
            '+44 20 5555 1234',
            180,
            sample_driver_id
        )
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Sample jobs created successfully for driver %', sample_driver_id;
    ELSE
        RAISE NOTICE 'No driver or organization found. Please ensure you have at least one driver in the system.';
    END IF;
END $$;

-- Verify the jobs were created
SELECT 
    'Jobs Created' as status,
    COUNT(*) as total_jobs,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_jobs,
    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_jobs,
    COUNT(CASE WHEN status = 'assigned' THEN 1 END) as assigned_jobs,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_jobs
FROM public.jobs 
WHERE assigned_driver_id IS NOT NULL;

-- Show sample jobs for verification
SELECT 
    title,
    status,
    priority,
    start_date,
    start_time,
    pickup_location,
    delivery_location,
    customer_name
FROM public.jobs 
WHERE assigned_driver_id IS NOT NULL
ORDER BY start_date, start_time;
