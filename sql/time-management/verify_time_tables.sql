-- Verify time management tables exist

-- Check if time_entries table exists
SELECT 
    table_name,
    CASE 
        WHEN table_name = 'time_entries' THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'time_entries';

-- Check if time_off_requests table exists
SELECT 
    table_name,
    CASE 
        WHEN table_name = 'time_off_requests' THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'time_off_requests';

-- Check if driver_shift_patterns table exists
SELECT 
    table_name,
    CASE 
        WHEN table_name = 'driver_shift_patterns' THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'driver_shift_patterns';

-- Check table columns for time_entries
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'time_entries'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('time_entries', 'time_off_requests', 'driver_shift_patterns');

-- Check triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND event_object_table IN ('time_entries', 'time_off_requests', 'driver_shift_patterns');
