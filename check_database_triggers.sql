-- Check Database Triggers
-- This script identifies triggers that might be causing the duplicate key issue

-- Check all triggers on the profiles table
SELECT 'Triggers on profiles table:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles'
ORDER BY trigger_name;

-- Check triggers on auth.users table
SELECT 'Triggers on auth.users table:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
AND event_object_table = 'users'
ORDER BY trigger_name;

-- Check for any functions that might be called by triggers
SELECT 'Functions that might be called by triggers:' as info;
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name LIKE '%profile%' 
   OR routine_name LIKE '%user%'
   OR routine_name LIKE '%handle%'
ORDER BY routine_name;

-- Check for the specific trigger that might be causing issues
SELECT 'Looking for handle_new_user trigger:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%handle_new_user%'
   OR trigger_name LIKE '%profile%'
   OR trigger_name LIKE '%user%';

-- Check if there's a trigger that creates profiles automatically
SELECT 'Checking for automatic profile creation triggers:' as info;
SELECT 
    t.trigger_name,
    t.event_manipulation,
    t.action_timing,
    p.proname as function_name,
    p.prosrc as function_source
FROM information_schema.triggers t
JOIN pg_proc p ON p.proname = (
    SELECT routine_name 
    FROM information_schema.routines 
    WHERE routine_name = t.action_statement
    LIMIT 1
)
WHERE t.event_object_table = 'profiles' 
   OR (t.event_object_schema = 'auth' AND t.event_object_table = 'users');
