-- Check Current Time Management Data
-- This script will show you what data is currently in the database

-- Check time entries for the current user
SELECT 
    'Current Time Entries' as info,
    id,
    entry_date,
    clock_in_time,
    clock_out_time,
    total_hours,
    driving_hours,
    break_hours,
    status,
    created_at
FROM public.time_entries
WHERE driver_id = auth.uid()
ORDER BY entry_date DESC, created_at DESC;

-- Check today's entry specifically
SELECT 
    'Todays Entry' as info,
    id,
    entry_date,
    clock_in_time,
    clock_out_time,
    total_hours,
    driving_hours,
    break_hours,
    status,
    created_at
FROM public.time_entries
WHERE driver_id = auth.uid()
AND entry_date = CURRENT_DATE;

-- Count total entries
SELECT 
    'Summary' as info,
    COUNT(*) as total_entries,
    COUNT(CASE WHEN entry_date = CURRENT_DATE THEN 1 END) as today_entries,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_entries,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_entries
FROM public.time_entries
WHERE driver_id = auth.uid();

-- Check if there are any entries with today's date
SELECT 
    'Todays Date Check' as info,
    CURRENT_DATE as current_date,
    COUNT(*) as entries_today
FROM public.time_entries
WHERE driver_id = auth.uid()
AND entry_date = CURRENT_DATE;
