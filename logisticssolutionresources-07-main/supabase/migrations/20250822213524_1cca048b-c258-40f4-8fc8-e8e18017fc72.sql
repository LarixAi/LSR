-- Setup Advanced Notifications System
-- This script creates the notification_messages table and adds sample data

-- 1. Create notification_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notification_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_role TEXT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'emergency')),
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'safety', 'schedule', 'maintenance', 'emergency')),
  channels TEXT[] NOT NULL DEFAULT ARRAY['in_app'] CHECK (array_length(channels, 1) > 0),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE public.notification_messages ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies
CREATE POLICY "Users can view notifications they sent" ON public.notification_messages
FOR SELECT USING (sender_id = auth.uid());

CREATE POLICY "Users can view notifications sent to them" ON public.notification_messages
FOR SELECT USING (
  recipient_id = auth.uid() OR 
  recipient_role = (
    SELECT role FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can view notifications from their organization" ON public.notification_messages
FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can create notifications" ON public.notification_messages
FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can update notifications they sent" ON public.notification_messages
FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY "Users can delete notifications they sent" ON public.notification_messages
FOR DELETE USING (sender_id = auth.uid());

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notification_messages_sender_id ON public.notification_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_notification_messages_recipient_id ON public.notification_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notification_messages_recipient_role ON public.notification_messages(recipient_role);
CREATE INDEX IF NOT EXISTS idx_notification_messages_organization_id ON public.notification_messages(organization_id);
CREATE INDEX IF NOT EXISTS idx_notification_messages_created_at ON public.notification_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_messages_scheduled_for ON public.notification_messages(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notification_messages_read_at ON public.notification_messages(read_at);
CREATE INDEX IF NOT EXISTS idx_notification_messages_priority ON public.notification_messages(priority);
CREATE INDEX IF NOT EXISTS idx_notification_messages_category ON public.notification_messages(category);

-- 5. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_messages TO authenticated;

-- 6. Insert sample notifications for testing
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
  p.first_name || ' ' || p.last_name as sender_name,
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
    WHERE nm.sender_id = p.id AND nm.title = 'Welcome to LSR Logistics'
  )
LIMIT 1;

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
  p.first_name || ' ' || p.last_name as sender_name,
  p.role as sender_role,
  p.id as recipient_id,
  'System Maintenance Scheduled' as title,
  'Scheduled maintenance will occur on Saturday from 2:00 AM to 4:00 AM. Some features may be temporarily unavailable.' as body,
  'warning' as type,
  'normal' as priority,
  'maintenance' as category,
  ARRAY['in_app', 'email'] as channels,
  p.organization_id,
  NOW() - INTERVAL '1 day' as sent_at
FROM public.profiles p
WHERE p.role IN ('admin', 'council')
  AND NOT EXISTS (
    SELECT 1 FROM public.notification_messages nm 
    WHERE nm.sender_id = p.id AND nm.title = 'System Maintenance Scheduled'
  )
LIMIT 1;

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
  p.first_name || ' ' || p.last_name as sender_name,
  p.role as sender_role,
  p.id as recipient_id,
  'Safety Protocol Update' as title,
  'New safety protocols have been implemented. Please review the updated guidelines in the safety section.' as body,
  'info' as type,
  'high' as priority,
  'safety' as category,
  ARRAY['in_app', 'email'] as channels,
  p.organization_id,
  NOW() - INTERVAL '6 hours' as sent_at
FROM public.profiles p
WHERE p.role IN ('admin', 'council')
  AND NOT EXISTS (
    SELECT 1 FROM public.notification_messages nm 
    WHERE nm.sender_id = p.id AND nm.title = 'Safety Protocol Update'
  )
LIMIT 1;

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
  p.first_name || ' ' || p.last_name as sender_name,
  p.role as sender_role,
  p.id as recipient_id,
  'Route Optimization Complete' as title,
  'Route optimization has been completed for this week. New routes are now available in the route planner.' as body,
  'success' as type,
  'normal' as priority,
  'schedule' as category,
  ARRAY['in_app'] as channels,
  p.organization_id,
  NOW() - INTERVAL '2 hours' as sent_at
FROM public.profiles p
WHERE p.role IN ('admin', 'council')
  AND NOT EXISTS (
    SELECT 1 FROM public.notification_messages nm 
    WHERE nm.sender_id = p.id AND nm.title = 'Route Optimization Complete'
  )
LIMIT 1;

-- 7. Create a function to get unread notification count
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

-- 8. Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_unread_notification_count(UUID) TO authenticated;