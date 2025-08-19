-- Clear All Sample Data
-- This script will remove all sample data so you can start fresh

DO $$
DECLARE
    current_driver_id uuid;
    deleted_time_entries integer;
    deleted_daily_rest integer;
    deleted_weekly_rest integer;
    deleted_time_off_requests integer;
BEGIN
    -- Get the current authenticated user's ID
    SELECT id INTO current_driver_id
    FROM public.profiles
    WHERE id = auth.uid();

    -- If no driver found, use the first driver in the system
    IF current_driver_id IS NULL THEN
        SELECT id INTO current_driver_id
        FROM public.profiles
        WHERE role = 'driver'
        LIMIT 1;
    END IF;

    RAISE NOTICE 'Clearing ALL sample data for driver: %', current_driver_id;

    -- Delete ALL time entries for this driver
    DELETE FROM public.time_entries 
    WHERE driver_id = current_driver_id;
    GET DIAGNOSTICS deleted_time_entries = ROW_COUNT;
    RAISE NOTICE 'Deleted % time entries', deleted_time_entries;

    -- Delete ALL daily rest records for this driver
    DELETE FROM public.daily_rest 
    WHERE driver_id = current_driver_id;
    GET DIAGNOSTICS deleted_daily_rest = ROW_COUNT;
    RAISE NOTICE 'Deleted % daily rest records', deleted_daily_rest;

    -- Delete ALL weekly rest records for this driver
    DELETE FROM public.weekly_rest 
    WHERE driver_id = current_driver_id;
    GET DIAGNOSTICS deleted_weekly_rest = ROW_COUNT;
    RAISE NOTICE 'Deleted % weekly rest records', deleted_weekly_rest;

    -- Delete ALL time off requests for this driver
    DELETE FROM public.time_off_requests 
    WHERE driver_id = current_driver_id;
    GET DIAGNOSTICS deleted_time_off_requests = ROW_COUNT;
    RAISE NOTICE 'Deleted % time off requests', deleted_time_off_requests;

    RAISE NOTICE 'ALL sample data cleared successfully!';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '- Time Entries: % deleted', deleted_time_entries;
    RAISE NOTICE '- Daily Rest: % deleted', deleted_daily_rest;
    RAISE NOTICE '- Weekly Rest: % deleted', deleted_weekly_rest;
    RAISE NOTICE '- Time Off Requests: % deleted', deleted_time_off_requests;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error clearing sample data: %', SQLERRM;
END $$;

-- Verify everything is cleared
SELECT 
    'time_entries' as table_name,
    COUNT(*) as remaining_records
FROM public.time_entries
WHERE driver_id = auth.uid()
UNION ALL
SELECT 
    'daily_rest' as table_name,
    COUNT(*) as remaining_records
FROM public.daily_rest
WHERE driver_id = auth.uid()
UNION ALL
SELECT 
    'weekly_rest' as table_name,
    COUNT(*) as remaining_records
FROM public.weekly_rest
WHERE driver_id = auth.uid()
UNION ALL
SELECT 
    'time_off_requests' as table_name,
    COUNT(*) as remaining_records
FROM public.time_off_requests
WHERE driver_id = auth.uid();
