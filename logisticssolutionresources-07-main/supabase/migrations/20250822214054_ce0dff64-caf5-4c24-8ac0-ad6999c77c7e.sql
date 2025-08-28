-- Setup Advanced Notifications System (Final)
-- Drop existing function and recreate with correct parameter name

-- 1. Drop existing function first
DROP FUNCTION IF EXISTS public.get_unread_notification_count(uuid);

-- 2. Create the function with correct parameter name
CREATE OR REPLACE FUNCTION public.get_unread_notification_count(user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
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

-- 3. Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_unread_notification_count(UUID) TO authenticated;

-- 4. Create additional indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_notification_messages_priority ON public.notification_messages(priority);
CREATE INDEX IF NOT EXISTS idx_notification_messages_category ON public.notification_messages(category);

-- 5. Insert sample notifications for testing (only if they don't exist)
INSERT INTO public.notification_messages (
  sender_id,
  sender_name,
  sender_role,
  recipient_id,
  title,
  body,
  type,
  priority,
  category,
  channels,
  organization_id,
  sent_at
)
SELECT 
  p.id as sender_id,
  COALESCE(p.first_name || ' ' || p.last_name, 'System Admin') as sender_name,
  p.role as sender_role,
  p.id as recipient_id,
  'Welcome to LSR Logistics' as title,
  'Welcome to our transportation management system. We''re excited to have you on board!' as body,
  'success' as type,
  'normal' as priority,
  'general' as category,
  ARRAY['in_app'] as channels,
  p.organization_id,
  NOW() - INTERVAL '2 days' as sent_at
FROM public.profiles p
WHERE p.role IN ('admin', 'council')
  AND NOT EXISTS (
    SELECT 1 FROM public.notification_messages nm 
    WHERE nm.title = 'Welcome to LSR Logistics' AND nm.organization_id = p.organization_id
  )
LIMIT 1;