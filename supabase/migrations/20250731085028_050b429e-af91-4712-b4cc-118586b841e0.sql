-- Let's check if there are any other triggers that might be causing issues
-- and also make sure the sync function is also updated to avoid conflicts

-- First, let's check if there are any other triggers on auth.users that might be failing
SELECT 
    t.tgname as trigger_name,
    pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid 
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'auth' AND c.relname = 'users' AND t.tgname LIKE '%user%';