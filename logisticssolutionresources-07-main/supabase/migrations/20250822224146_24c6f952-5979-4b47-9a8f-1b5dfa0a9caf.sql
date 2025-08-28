-- First, let's check the actual structure of notification_messages table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'notification_messages' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Let's also see if we have any existing notifications
SELECT COUNT(*) as existing_count FROM public.notification_messages;