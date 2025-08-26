-- Add RLS policies for notifications table
-- This migration adds the missing RLS policies for the notifications table

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications for users" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for parent_notifications
CREATE POLICY "Parents can view their own notifications" ON public.parent_notifications
  FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Parents can update their own notifications" ON public.parent_notifications
  FOR UPDATE USING (auth.uid() = parent_id);

CREATE POLICY "Parents can delete their own notifications" ON public.parent_notifications
  FOR DELETE USING (auth.uid() = parent_id);

CREATE POLICY "System can insert parent notifications" ON public.parent_notifications
  FOR INSERT WITH CHECK (true);
