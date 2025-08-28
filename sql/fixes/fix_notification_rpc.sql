-- Fix get_unread_notification_count RPC function
-- Run this in your Supabase SQL Editor

-- Drop the function if it exists to recreate it
DROP FUNCTION IF EXISTS get_unread_notification_count(UUID);
DROP FUNCTION IF EXISTS public.get_unread_notification_count(UUID);

-- Create the function
CREATE OR REPLACE FUNCTION get_unread_notification_count(user_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    unread_count INTEGER;
BEGIN
    -- Count unread notifications for the user
    SELECT COUNT(*) INTO unread_count
    FROM notification_messages
    WHERE recipient_id = user_uuid
    AND read_at IS NULL;
    
    RETURN COALESCE(unread_count, 0);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_unread_notification_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notification_count(UUID) TO anon;

-- Test the function
SELECT get_unread_notification_count('00000000-0000-0000-0000-000000000000'::UUID) as test_result;



