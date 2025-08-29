-- Check what might be trying to access a 'users' table
-- Look for any triggers, functions, or policies that might reference 'users'
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
WHERE qual LIKE '%users%' OR with_check LIKE '%users%'
ORDER BY schemaname, tablename, policyname;

-- Also check for any functions that might reference 'users'
SELECT 
    routine_name, 
    routine_definition
FROM information_schema.routines 
WHERE routine_definition LIKE '%users%' 
AND routine_schema = 'public';

-- Check for any triggers that might be causing issues
SELECT 
    trigger_name, 
    event_object_table, 
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;