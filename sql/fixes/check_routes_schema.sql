-- Check the actual schema of the routes table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'routes' 
ORDER BY ordinal_position;
