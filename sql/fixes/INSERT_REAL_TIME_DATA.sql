-- Insert Real Time Data for Testing
-- This script will insert realistic time entries for the current user

-- First, let's get the current driver's ID
DO $$
DECLARE
    driver_id uuid;
    org_id uuid;
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
    
    -- Insert today's time entry (if not exists)
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
    VALUES (
        driver_id,
        org_id,
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '8 hours',
        CURRENT_DATE + INTERVAL '16 hours',
        8.0,
        8.0,
        0.0,
        'completed',
        'regular',
        'Office Location',
        'Office Location'
    )
    ON CONFLICT (driver_id, entry_date) DO NOTHING;
    
    -- Insert yesterday's time entry
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
    VALUES (
        driver_id,
        org_id,
        CURRENT_DATE - INTERVAL '1 day',
        (CURRENT_DATE - INTERVAL '1 day') + INTERVAL '8 hours',
        (CURRENT_DATE - INTERVAL '1 day') + INTERVAL '16 hours',
        8.0,
        8.0,
        0.5,
        'completed',
        'regular',
        'Office Location',
        'Office Location'
    )
    ON CONFLICT (driver_id, entry_date) DO NOTHING;
    
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
        CURRENT_DATE - INTERVAL '1 day' * generate_series(2, 7),
        (CURRENT_DATE - INTERVAL '1 day' * generate_series(2, 7)) + INTERVAL '8 hours',
        (CURRENT_DATE - INTERVAL '1 day' * generate_series(2, 7)) + INTERVAL '16 hours',
        8.0,
        8.0,
        CASE WHEN generate_series(2, 7) % 2 = 0 THEN 0.5 ELSE 0.0 END,
        'completed',
        'regular',
        'Office Location',
        'Office Location'
    ON CONFLICT (driver_id, entry_date) DO NOTHING;
    
    -- Insert a time off request
    INSERT INTO public.time_off_requests (
        driver_id,
        organization_id,
        start_date,
        end_date,
        request_type,
        reason,
        total_days,
        status,
        notes
    ) 
    VALUES (
        driver_id,
        org_id,
        CURRENT_DATE + INTERVAL '7 days',
        CURRENT_DATE + INTERVAL '9 days',
        'annual_leave',
        'Summer vacation',
        3,
        'pending',
        'Annual leave request for summer vacation'
    )
    ON CONFLICT DO NOTHING;
    
    -- Insert daily rest records for non-working days
    INSERT INTO public.daily_rest (
        driver_id,
        organization_id,
        rest_date,
        rest_type,
        duration_hours,
        notes
    ) 
    SELECT 
        driver_id,
        org_id,
        CURRENT_DATE - INTERVAL '1 day' * generate_series(1, 7),
        'daily_rest',
        24,
        'Automatically recorded rest day'
    WHERE NOT EXISTS (
        SELECT 1 FROM public.time_entries 
        WHERE driver_id = driver_id 
        AND entry_date = CURRENT_DATE - INTERVAL '1 day' * generate_series(1, 7)
    )
    ON CONFLICT (driver_id, rest_date) DO NOTHING;
    
    -- Insert weekly rest record
    INSERT INTO public.weekly_rest (
        driver_id,
        organization_id,
        week_start_date,
        week_end_date,
        rest_type,
        total_rest_hours,
        compensation_required,
        notes
    ) 
    VALUES (
        driver_id,
        org_id,
        date_trunc('week', CURRENT_DATE - INTERVAL '1 week'),
        date_trunc('week', CURRENT_DATE - INTERVAL '1 week') + INTERVAL '6 days',
        'full_weekly_rest',
        48,
        false,
        'Weekly rest period'
    )
    ON CONFLICT (driver_id, week_start_date) DO NOTHING;
    
    RAISE NOTICE 'Inserted real time data for driver: %', driver_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting data: %', SQLERRM;
END $$;
