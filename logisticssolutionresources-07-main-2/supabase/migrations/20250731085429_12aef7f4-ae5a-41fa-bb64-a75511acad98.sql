-- Check the enforce_driver_limit function that's causing the error
SELECT routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'enforce_driver_limit' 
AND routine_schema = 'public';

-- Also check if there are any functions referencing 'users' table
SELECT routine_name, routine_definition
FROM information_schema.routines 
WHERE routine_definition ILIKE '%users%' 
AND routine_schema = 'public';