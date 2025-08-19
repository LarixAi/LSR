-- Fix Weekly Rest Data Issues
-- This script addresses the PGRST116 error and ensures proper data exists

-- First, let's check what we have
DO $$
DECLARE
    driver_id uuid;
    org_id uuid;
    weekly_rest_count integer;
BEGIN
    -- Get the current authenticated user's ID and organization
    SELECT id, organization_id INTO driver_id, org_id
    FROM public.profiles
    WHERE id = auth.uid();

    -- If no driver found, use the first driver in the system
    IF driver_id IS NULL THEN
        SELECT id, organization_id INTO driver_id, org_id
        FROM public.profiles
        WHERE role = 'driver'
        LIMIT 1;
    END IF;

    -- Check how many weekly rest records exist
    SELECT COUNT(*) INTO weekly_rest_count
    FROM public.weekly_rest
    WHERE driver_id = driver_id;

    RAISE NOTICE 'Driver ID: %, Organization ID: %, Weekly Rest Records: %', driver_id, org_id, weekly_rest_count;

    -- If no weekly rest records exist, create them
    IF weekly_rest_count = 0 THEN
        RAISE NOTICE 'No weekly rest records found. Creating sample data...';
        
        -- Insert weekly rest record for the previous week
        INSERT INTO public.weekly_rest (
            driver_id,
            organization_id,
            week_start_date,
            week_end_date,
            rest_start_time,
            rest_end_time,
            total_rest_hours,
            rest_type,
            compensation_required,
            notes
        )
        VALUES (
            driver_id,
            org_id,
            date_trunc('week', CURRENT_DATE - INTERVAL '1 week'),
            date_trunc('week', CURRENT_DATE - INTERVAL '1 week') + INTERVAL '6 days',
            date_trunc('week', CURRENT_DATE - INTERVAL '1 week') + INTERVAL '16 hours',
            date_trunc('week', CURRENT_DATE - INTERVAL '1 week') + INTERVAL '6 days' + INTERVAL '16 hours',
            48.0,
            'full_weekly_rest',
            false,
            'Weekly rest period'
        );

        -- Insert weekly rest record for the current week
        INSERT INTO public.weekly_rest (
            driver_id,
            organization_id,
            week_start_date,
            week_end_date,
            rest_start_time,
            rest_end_time,
            total_rest_hours,
            rest_type,
            compensation_required,
            notes
        )
        VALUES (
            driver_id,
            org_id,
            date_trunc('week', CURRENT_DATE),
            date_trunc('week', CURRENT_DATE) + INTERVAL '6 days',
            date_trunc('week', CURRENT_DATE) + INTERVAL '16 hours',
            date_trunc('week', CURRENT_DATE) + INTERVAL '6 days' + INTERVAL '16 hours',
            24.0,
            'reduced_weekly_rest',
            true,
            'Reduced weekly rest - compensation required'
        );

        RAISE NOTICE 'Created weekly rest records for driver: %', driver_id;
    ELSE
        RAISE NOTICE 'Weekly rest records already exist for driver: %', driver_id;
    END IF;

    -- Verify the data was created
    SELECT COUNT(*) INTO weekly_rest_count
    FROM public.weekly_rest
    WHERE driver_id = driver_id;

    RAISE NOTICE 'Final weekly rest record count: %', weekly_rest_count;

    -- Show the actual records
    RAISE NOTICE 'Weekly rest records:';
    FOR rec IN 
        SELECT week_start_date, week_end_date, total_rest_hours, rest_type, compensation_required
        FROM public.weekly_rest
        WHERE driver_id = driver_id
        ORDER BY week_start_date DESC
    LOOP
        RAISE NOTICE 'Week: % to %, Hours: %, Type: %, Compensation: %', 
            rec.week_start_date, rec.week_end_date, rec.total_rest_hours, rec.rest_type, rec.compensation_required;
    END LOOP;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating weekly rest data: %', SQLERRM;
END $$;

-- Also ensure we have time entries for the weekly rest analysis
DO $$
DECLARE
    driver_id uuid;
    org_id uuid;
    time_entries_count integer;
BEGIN
    -- Get the current authenticated user's ID and organization
    SELECT id, organization_id INTO driver_id, org_id
    FROM public.profiles
    WHERE id = auth.uid();

    -- If no driver found, use the first driver in the system
    IF driver_id IS NULL THEN
        SELECT id, organization_id INTO driver_id, org_id
        FROM public.profiles
        WHERE role = 'driver'
        LIMIT 1;
    END IF;

    -- Check how many time entries exist
    SELECT COUNT(*) INTO time_entries_count
    FROM public.time_entries
    WHERE driver_id = driver_id;

    RAISE NOTICE 'Time entries count for driver %: %', driver_id, time_entries_count;

    -- If no time entries exist, create some
    IF time_entries_count = 0 THEN
        RAISE NOTICE 'No time entries found. Creating sample data...';
        
        -- Insert time entries for the past week
        INSERT INTO public.time_entries (
            driver_id,
            organization_id,
            entry_date,
            clock_in_time,
            clock_out_time,
            total_hours,
            driving_hours,
            break_hours,
            status,
            entry_type,
            location_clock_in,
            location_clock_out
        )
        SELECT
            driver_id,
            org_id,
            CURRENT_DATE - INTERVAL '1 day' * generate_series(0, 6),
            (CURRENT_DATE - INTERVAL '1 day' * generate_series(0, 6)) + INTERVAL '8 hours',
            (CURRENT_DATE - INTERVAL '1 day' * generate_series(0, 6)) + INTERVAL '16 hours',
            8.0,
            8.0,
            0.5,
            'completed',
            'regular',
            'Office Location',
            'Office Location'
        WHERE generate_series(0, 6) < 5; -- Only weekdays

        RAISE NOTICE 'Created time entries for driver: %', driver_id;
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating time entries: %', SQLERRM;
END $$;

-- Verify the final state
SELECT 
    'weekly_rest' as table_name,
    COUNT(*) as record_count
FROM public.weekly_rest
UNION ALL
SELECT 
    'time_entries' as table_name,
    COUNT(*) as record_count
FROM public.time_entries;
