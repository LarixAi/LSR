-- Advanced Notification System Migration
-- This creates a comprehensive notification system for the transportation management app

-- 1. Create notification_messages table
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

-- 2. Create notification_templates table
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'emergency')),
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'safety', 'schedule', 'maintenance', 'emergency')),
  is_default BOOLEAN DEFAULT false,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create notification_settings table
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  in_app_enabled BOOLEAN DEFAULT true,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '07:00',
  timezone TEXT DEFAULT 'UTC',
  categories JSONB DEFAULT '{
    "general": {"email": true, "push": true, "sms": false, "in_app": true},
    "safety": {"email": true, "push": true, "sms": true, "in_app": true},
    "schedule": {"email": true, "push": true, "sms": false, "in_app": true},
    "maintenance": {"email": true, "push": true, "sms": false, "in_app": true},
    "emergency": {"email": true, "push": true, "sms": true, "in_app": true}
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- 4. Create notification_delivery_logs table
CREATE TABLE IF NOT EXISTS public.notification_delivery_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID NOT NULL REFERENCES public.notification_messages(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('in_app', 'push', 'email', 'sms')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notification_messages_sender_id ON public.notification_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_notification_messages_recipient_id ON public.notification_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notification_messages_recipient_role ON public.notification_messages(recipient_role);
CREATE INDEX IF NOT EXISTS idx_notification_messages_organization_id ON public.notification_messages(organization_id);
CREATE INDEX IF NOT EXISTS idx_notification_messages_created_at ON public.notification_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_messages_scheduled_for ON public.notification_messages(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notification_messages_read_at ON public.notification_messages(read_at);
CREATE INDEX IF NOT EXISTS idx_notification_messages_priority ON public.notification_messages(priority);
CREATE INDEX IF NOT EXISTS idx_notification_messages_category ON public.notification_messages(category);

-- CREATE INDEX IF NOT EXISTS idx_notification_templates_organization_id ON public.notification_templates(organization_id);
-- CREATE INDEX IF NOT EXISTS idx_notification_templates_is_default ON public.notification_templates(is_default);

CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON public.notification_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_settings_organization_id ON public.notification_settings(organization_id);

CREATE INDEX IF NOT EXISTS idx_notification_delivery_logs_notification_id ON public.notification_delivery_logs(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_logs_recipient_id ON public.notification_delivery_logs(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_logs_status ON public.notification_delivery_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_logs_channel ON public.notification_delivery_logs(channel);

-- 6. Enable Row Level Security
ALTER TABLE public.notification_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_delivery_logs ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS Policies for notification_messages
-- Users can view notifications they sent or received
CREATE POLICY "Users can view their own notifications" ON public.notification_messages
  FOR SELECT USING (
    sender_id = auth.uid() OR 
    recipient_id = auth.uid() OR
    (recipient_role IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = notification_messages.recipient_role
      AND organization_id = notification_messages.organization_id
    ))
  );

-- Users can create notifications
CREATE POLICY "Users can create notifications" ON public.notification_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Users can update notifications they sent (for scheduling, etc.)
CREATE POLICY "Users can update their sent notifications" ON public.notification_messages
  FOR UPDATE USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- Users can mark notifications as read
CREATE POLICY "Users can mark notifications as read" ON public.notification_messages
  FOR UPDATE USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- 8. Create RLS Policies for notification_templates
-- Temporarily comment out these policies until the table structure is compatible
-- -- Users can view templates in their organization
-- CREATE POLICY "Users can view organization templates" ON public.notification_templates
--   FOR SELECT USING (
--     organization_id IN (
--       SELECT organization_id FROM public.profiles WHERE id = auth.uid()
--     ) OR is_default = true
--   );

-- -- Admins can create templates
-- CREATE POLICY "Admins can create templates" ON public.notification_templates
--   FOR INSERT WITH CHECK (
--     organization_id IN (
--       SELECT organization_id FROM public.profiles 
--       WHERE id = auth.uid() 
--       AND role IN ('admin', 'council')
--     )
--   );

-- -- Admins can update templates
-- CREATE POLICY "Admins can update templates" ON public.notification_templates
--   FOR UPDATE USING (
--     organization_id IN (
--       SELECT organization_id FROM public.profiles 
--       WHERE id = auth.uid() 
--       AND role IN ('admin', 'council')
--     )
--   );

-- 9. Create RLS Policies for notification_settings
-- Users can view their own settings
CREATE POLICY "Users can view their own settings" ON public.notification_settings
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own settings
CREATE POLICY "Users can update their own settings" ON public.notification_settings
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can insert their own settings
CREATE POLICY "Users can insert their own settings" ON public.notification_settings
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 10. Create RLS Policies for notification_delivery_logs
-- Users can view delivery logs for notifications they sent or received
CREATE POLICY "Users can view delivery logs" ON public.notification_delivery_logs
  FOR SELECT USING (
    recipient_id = auth.uid() OR
    notification_id IN (
      SELECT id FROM public.notification_messages 
      WHERE sender_id = auth.uid()
    )
  );

-- System can insert delivery logs
CREATE POLICY "System can insert delivery logs" ON public.notification_delivery_logs
  FOR INSERT WITH CHECK (true);

-- 11. Insert default notification templates
-- Temporarily comment out this INSERT until table structure is compatible
-- INSERT INTO public.notification_templates (name, title, body, type, priority, category, is_default) VALUES
--   ('Safety Alert', 'Safety Alert - Immediate Action Required', 'Please review and acknowledge this safety alert. Your immediate attention is required.', 'warning', 'high', 'safety', true),
--   ('Schedule Change', 'Schedule Update', 'There has been a change to your schedule. Please review the updated details.', 'info', 'normal', 'schedule', true),
--   ('Maintenance Reminder', 'Vehicle Maintenance Due', 'Your vehicle is due for maintenance. Please schedule an appointment.', 'warning', 'normal', 'maintenance', true),
--   ('Emergency Notice', 'EMERGENCY - Immediate Response Required', 'This is an emergency notification requiring immediate attention.', 'error', 'emergency', 'emergency', true),
--   ('Route Delay', 'Route Delay Notification', 'Your route is experiencing delays. Please check for updates.', 'warning', 'normal', 'schedule', true),
--   ('Weather Alert', 'Weather Alert - Route Impact', 'Severe weather conditions may impact your route. Please exercise caution.', 'warning', 'high', 'safety', true),
--   ('Job Assignment', 'New Job Assignment', 'You have been assigned a new job. Please review the details.', 'info', 'normal', 'general', true),
--   ('Compliance Reminder', 'Compliance Document Due', 'You have compliance documents that need to be updated.', 'warning', 'normal', 'general', true);

-- 12. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 13. Create triggers for updated_at
CREATE TRIGGER update_notification_messages_updated_at 
  BEFORE UPDATE ON public.notification_messages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at 
  BEFORE UPDATE ON public.notification_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at 
  BEFORE UPDATE ON public.notification_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 14. Create function to handle notification delivery
CREATE OR REPLACE FUNCTION handle_notification_delivery()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert delivery log entries for each channel
  INSERT INTO public.notification_delivery_logs (
    notification_id,
    recipient_id,
    channel,
    status,
    sent_at
  )
  SELECT 
    NEW.id,
    COALESCE(NEW.recipient_id, p.id),
    unnest(NEW.channels),
    'pending',
    CASE 
      WHEN NEW.scheduled_for IS NOT NULL THEN NEW.scheduled_for
      ELSE NOW()
    END
  FROM public.profiles p
  WHERE (NEW.recipient_id IS NOT NULL AND p.id = NEW.recipient_id)
     OR (NEW.recipient_role IS NOT NULL AND p.role = NEW.recipient_role AND p.organization_id = NEW.organization_id);
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 15. Create trigger for notification delivery
CREATE TRIGGER trigger_notification_delivery
  AFTER INSERT ON public.notification_messages
  FOR EACH ROW EXECUTE FUNCTION handle_notification_delivery();

-- 16. Create function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.notification_messages
    WHERE (recipient_id = user_uuid OR 
           (recipient_role IS NOT NULL AND EXISTS (
             SELECT 1 FROM public.profiles 
             WHERE id = user_uuid 
             AND role = notification_messages.recipient_role
             AND organization_id = notification_messages.organization_id
           )))
    AND read_at IS NULL
  );
END;
$$ language 'plpgsql';

-- 17. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.notification_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.notification_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.notification_settings TO authenticated;
GRANT SELECT, INSERT ON public.notification_delivery_logs TO authenticated;

-- 18. Create view for notification statistics
CREATE OR REPLACE VIEW notification_stats AS
SELECT 
  organization_id,
  COUNT(*) as total_notifications,
  COUNT(*) FILTER (WHERE read_at IS NULL) as unread_notifications,
  COUNT(*) FILTER (WHERE priority = 'emergency') as emergency_notifications,
  COUNT(*) FILTER (WHERE priority = 'high') as high_priority_notifications,
  COUNT(*) FILTER (WHERE category = 'safety') as safety_notifications,
  COUNT(*) FILTER (WHERE category = 'emergency') as emergency_category_notifications
FROM public.notification_messages
GROUP BY organization_id;

-- Grant access to the view
GRANT SELECT ON notification_stats TO authenticated;

