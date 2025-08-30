-- Add RLS policies for notifications table
-- This migration adds the missing RLS policies for the notifications table

-- Create RLS policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete their own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications for users" ON public.notifications;
CREATE POLICY "System can insert notifications for users" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Temporarily comment out parent_notifications policies until that table exists
-- -- Create RLS policies for parent_notifications
-- DROP POLICY IF EXISTS "Parents can view their own notifications" ON public.parent_notifications;
-- CREATE POLICY "Parents can view their own notifications" ON public.parent_notifications
--   FOR SELECT USING (auth.uid() = parent_id);

-- DROP POLICY IF EXISTS "Parents can update their own notifications" ON public.parent_notifications;
-- CREATE POLICY "Parents can update their own notifications" ON public.parent_notifications
--   FOR UPDATE USING (auth.uid() = user_id);

-- DROP POLICY IF EXISTS "Parents can delete their own notifications" ON public.parent_notifications;
-- CREATE POLICY "Parents can delete their own notifications" ON public.parent_notifications
--   FOR DELETE USING (auth.uid() = parent_id);

-- DROP POLICY IF EXISTS "System can insert parent notifications" ON public.parent_notifications;
-- CREATE POLICY "System can insert parent notifications" ON public.parent_notifications
--   FOR INSERT WITH CHECK (true);
