-- Check Database Constraints and Triggers
-- This script helps identify what might be causing the duplicate key issue

-- Check for triggers on the profiles table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'profiles'
AND trigger_schema = 'public';

-- Check for foreign key constraints on profiles table
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'profiles'
AND tc.table_schema = 'public';

-- Check for unique constraints on profiles table
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'UNIQUE' 
AND tc.table_name = 'profiles'
AND tc.table_schema = 'public';

-- Check for any functions that might be called by triggers
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_definition ILIKE '%profiles%'
AND routine_definition ILIKE '%INSERT%';

-- Check the current sequence values for any auto-incrementing columns
SELECT 
    schemaname,
    tablename,
    attname,
    last_value,
    start_value,
    increment_by
FROM pg_sequences 
WHERE tablename = 'profiles';

