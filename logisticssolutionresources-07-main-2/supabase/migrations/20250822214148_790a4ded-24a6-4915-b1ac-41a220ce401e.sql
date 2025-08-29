-- Fix function search path security issue
-- Update the function to have a stable search path

DROP FUNCTION IF EXISTS public.get_unread_notification_count(uuid);

CREATE OR REPLACE FUNCTION public.get_unread_notification_count(user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  count_val INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO count_val
  FROM public.notification_messages
  WHERE (recipient_id = user_id OR recipient_role = (
    SELECT role FROM public.profiles WHERE id = user_id
  ))
  AND read_at IS NULL;
  
  RETURN COALESCE(count_val, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_unread_notification_count(UUID) TO authenticated;