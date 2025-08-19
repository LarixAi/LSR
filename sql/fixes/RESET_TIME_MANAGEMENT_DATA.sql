-- Reset Time Management Data to Zero
-- This script will clear all time entries, daily rest, and weekly rest data
-- so you can start fresh with real data

DO $$
DECLARE
    driver_id uuid;
    deleted_time_entries integer;
    deleted_daily_rest integer;
    deleted_weekly_rest integer;
    deleted_time_off_requests integer;
BEGIN
    -- Get the current authenticated user's ID
    SELECT id INTO driver_id
    FROM public.profiles
    WHERE id = auth.uid();

    -- If no driver found, use the first driver in the system
    IF driver_id IS NULL THEN
        SELECT id INTO driver_id
        FROM public.profiles
        WHERE role = 'driver'
        LIMIT 1;
    END IF;

    RAISE NOTICE 'Resetting time management data for driver: %', driver_id;

    -- Delete all time entries for this driver
    DELETE FROM public.time_entries 
    WHERE driver_id = driver_id;
    GET DIAGNOSTICS deleted_time_entries = ROW_COUNT;
    RAISE NOTICE 'Deleted % time entries', deleted_time_entries;

    -- Delete all daily rest records for this driver
    DELETE FROM public.daily_rest 
    WHERE driver_id = driver_id;
    GET DIAGNOSTICS deleted_daily_rest = ROW_COUNT;
    RAISE NOTICE 'Deleted % daily rest records', deleted_daily_rest;

    -- Delete all weekly rest records for this driver
    DELETE FROM public.weekly_rest 
    WHERE driver_id = driver_id;
    GET DIAGNOSTICS deleted_weekly_rest = ROW_COUNT;
    RAISE NOTICE 'Deleted % weekly rest records', deleted_weekly_rest;

    -- Delete all time off requests for this driver
    DELETE FROM public.time_off_requests 
    WHERE driver_id = driver_id;
    GET DIAGNOSTICS deleted_time_off_requests = ROW_COUNT;
    RAISE NOTICE 'Deleted % time off requests', deleted_time_off_requests;

    RAISE NOTICE 'Time management data reset complete!';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '- Time Entries: % deleted', deleted_time_entries;
    RAISE NOTICE '- Daily Rest: % deleted', deleted_daily_rest;
    RAISE NOTICE '- Weekly Rest: % deleted', deleted_weekly_rest;
    RAISE NOTICE '- Time Off Requests: % deleted', deleted_time_off_requests;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error resetting time management data: %', SQLERRM;
END $$;

-- Verify the reset
SELECT 
    'time_entries' as table_name,
    COUNT(*) as remaining_records
FROM public.time_entries
UNION ALL
SELECT 
    'daily_rest' as table_name,
    COUNT(*) as remaining_records
FROM public.daily_rest
UNION ALL
SELECT 
    'weekly_rest' as table_name,
    COUNT(*) as remaining_records
FROM public.weekly_rest
UNION ALL
SELECT 
    'time_off_requests' as table_name,
    COUNT(*) as remaining_records
FROM public.time_off_requests;
