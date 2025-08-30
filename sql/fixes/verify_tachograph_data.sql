-- Verify and setup tachograph data
-- This script ensures the tachograph_records table exists and has sample data

-- First, let's check if the table exists and has data
DO $$
DECLARE
    table_exists BOOLEAN;
    record_count INTEGER;
BEGIN
    -- Check if tachograph_records table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tachograph_records'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Count existing records
        SELECT COUNT(*) FROM public.tachograph_records INTO record_count;
        RAISE NOTICE 'Tachograph records table exists with % records', record_count;
        
        -- If no records exist, add sample data
        IF record_count = 0 THEN
            RAISE NOTICE 'No records found, adding sample data...';
            
            -- Insert sample tachograph records
            INSERT INTO public.tachograph_records (
                organization_id,
                driver_id,
                vehicle_id,
                record_date,
                start_time,
                end_time,
                activity_type,
                distance_km,
                start_location,
                end_location,
                violations,
                card_type,
                card_number,
                download_method,
                data_quality_score,
                is_complete,
                notes
            ) VALUES 
            -- Sample record 1 - Clean record
            (
                (SELECT id FROM public.organizations LIMIT 1),
                (SELECT id FROM public.profiles WHERE role = 'driver' LIMIT 1),
                (SELECT id FROM public.vehicles LIMIT 1),
                CURRENT_DATE - INTERVAL '2 days',
                (CURRENT_DATE - INTERVAL '2 days')::date + INTERVAL '08:00:00',
                (CURRENT_DATE - INTERVAL '2 days')::date + INTERVAL '17:00:00',
                'driving',
                180.5,
                'London',
                'Manchester',
                ARRAY[],
                'driver',
                'DRIVER123456',
                'manual',
                98,
                true,
                'Daily driving record - clean'
            ),
            -- Sample record 2 - With violation
            (
                (SELECT id FROM public.organizations LIMIT 1),
                (SELECT id FROM public.profiles WHERE role = 'driver' LIMIT 1),
                (SELECT id FROM public.vehicles LIMIT 1),
                CURRENT_DATE - INTERVAL '1 day',
                (CURRENT_DATE - INTERVAL '1 day')::date + INTERVAL '09:00:00',
                (CURRENT_DATE - INTERVAL '1 day')::date + INTERVAL '18:00:00',
                'driving',
                220.0,
                'Birmingham',
                'Leeds',
                ARRAY['speed_limit_exceeded', 'rest_period_violation'],
                'driver',
                'DRIVER789012',
                'automatic',
                85,
                true,
                'Daily driving record - violations detected'
            ),
            -- Sample record 3 - Current day
            (
                (SELECT id FROM public.organizations LIMIT 1),
                (SELECT id FROM public.profiles WHERE role = 'driver' LIMIT 1),
                (SELECT id FROM public.vehicles LIMIT 1),
                CURRENT_DATE,
                CURRENT_DATE::date + INTERVAL '07:30:00',
                CURRENT_DATE::date + INTERVAL '16:30:00',
                'driving',
                150.0,
                'Liverpool',
                'Sheffield',
                ARRAY['rest_period_violation'],
                'driver',
                'DRIVER345678',
                'remote',
                92,
                true,
                'Current day record - minor violation'
            ),
            -- Sample record 4 - Different driver
            (
                (SELECT id FROM public.organizations LIMIT 1),
                (SELECT id FROM public.profiles WHERE role = 'driver' LIMIT 1 OFFSET 1),
                (SELECT id FROM public.vehicles LIMIT 1 OFFSET 1),
                CURRENT_DATE - INTERVAL '3 days',
                (CURRENT_DATE - INTERVAL '3 days')::date + INTERVAL '06:00:00',
                (CURRENT_DATE - INTERVAL '3 days')::date + INTERVAL '15:00:00',
                'driving',
                300.0,
                'Edinburgh',
                'Cardiff',
                ARRAY[],
                'driver',
                'DRIVER901234',
                'manual',
                95,
                true,
                'Long distance journey - clean record'
            ),
            -- Sample record 5 - Company card
            (
                (SELECT id FROM public.organizations LIMIT 1),
                (SELECT id FROM public.profiles WHERE role = 'driver' LIMIT 1),
                (SELECT id FROM public.vehicles LIMIT 1),
                CURRENT_DATE - INTERVAL '4 days',
                (CURRENT_DATE - INTERVAL '4 days')::date + INTERVAL '10:00:00',
                (CURRENT_DATE - INTERVAL '4 days')::date + INTERVAL '19:00:00',
                'driving',
                120.0,
                'Newcastle',
                'Bristol',
                ARRAY['speed_limit_exceeded'],
                'company',
                'COMPANY567890',
                'automatic',
                88,
                true,
                'Company vehicle record'
            );
            
            RAISE NOTICE 'Sample data added successfully';
        ELSE
            RAISE NOTICE 'Records already exist, no sample data needed';
        END IF;
    ELSE
        RAISE NOTICE 'Tachograph records table does not exist. Please run fix_tachograph_records_schema.sql first';
    END IF;
END $$;

-- Display current data
SELECT 
    tr.id,
    tr.record_date,
    tr.activity_type,
    tr.distance_km,
    tr.violations,
    tr.card_type,
    tr.data_quality_score,
    p.first_name || ' ' || p.last_name as driver_name,
    v.vehicle_number,
    v.license_plate
FROM public.tachograph_records tr
LEFT JOIN public.profiles p ON tr.driver_id = p.id
LEFT JOIN public.vehicles v ON tr.vehicle_id = v.id
ORDER BY tr.record_date DESC
LIMIT 10;

