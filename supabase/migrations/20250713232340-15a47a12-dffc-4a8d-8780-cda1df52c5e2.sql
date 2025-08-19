-- Create messaging system tables
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('admin', 'driver', 'parent', 'mechanic', 'council')),
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for broadcast messages
  receiver_role TEXT CHECK (receiver_role IN ('admin', 'driver', 'parent', 'mechanic', 'council')),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'chat' CHECK (message_type IN ('alert', 'chat', 'system', 'emergency', 'broadcast')),
  read_status BOOLEAN DEFAULT false,
  thread_id UUID REFERENCES public.messages(id) ON DELETE SET NULL, -- For reply threading
  linked_job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  linked_vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'emergency')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create enhanced notifications table (replacing/extending existing)
DROP TABLE IF EXISTS public.enhanced_notifications CASCADE;
CREATE TABLE public.enhanced_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('schedule', 'vehicle', 'incident', 'feedback', 'emergency', 'compliance', 'maintenance', 'info')),
  is_read BOOLEAN DEFAULT false,
  linked_job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  linked_vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  linked_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  action_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'emergency')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  emergency_only BOOLEAN DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  blocked_senders UUID[] DEFAULT '{}',
  notification_types JSONB DEFAULT '{
    "schedule": true,
    "vehicle": true,
    "incident": true,
    "feedback": true,
    "emergency": true,
    "compliance": true,
    "maintenance": true
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_organization_id ON public.messages(organization_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_type_priority ON public.messages(message_type, priority);

CREATE INDEX IF NOT EXISTS idx_enhanced_notifications_user_id ON public.enhanced_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_notifications_organization_id ON public.enhanced_notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_notifications_created_at ON public.enhanced_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enhanced_notifications_read ON public.enhanced_notifications(is_read, user_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_notifications_type ON public.enhanced_notifications(type, user_id);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enhanced_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "Users can view messages sent to them or sent by them"
  ON public.messages FOR SELECT
  USING (
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id OR 
    (receiver_id IS NULL AND message_type = 'broadcast' AND 
     EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND organization_id = messages.organization_id))
  );

CREATE POLICY "Users can create messages in their organization"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND organization_id = messages.organization_id)
  );

CREATE POLICY "Users can update their own messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- RLS Policies for enhanced notifications
CREATE POLICY "Users can view their own notifications"
  ON public.enhanced_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create notifications in their organization"
  ON public.enhanced_notifications FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND organization_id = enhanced_notifications.organization_id)
  );

CREATE POLICY "Users can update their own notifications"
  ON public.enhanced_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for notification preferences
CREATE POLICY "Users can manage their own notification preferences"
  ON public.notification_preferences FOR ALL
  USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enhanced_notifications_updated_at BEFORE UPDATE ON public.enhanced_notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for all messaging tables
ALTER publication supabase_realtime ADD TABLE public.messages;
ALTER publication supabase_realtime ADD TABLE public.enhanced_notifications;
ALTER publication supabase_realtime ADD TABLE public.notification_preferences;

-- Function to create system notification
CREATE OR REPLACE FUNCTION create_system_notification(
  p_user_id UUID,
  p_organization_id UUID,
  p_title TEXT,
  p_body TEXT,
  p_type TEXT DEFAULT 'info',
  p_priority TEXT DEFAULT 'normal',
  p_linked_job_id UUID DEFAULT NULL,
  p_linked_vehicle_id UUID DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.enhanced_notifications (
    user_id, organization_id, title, body, type, priority,
    linked_job_id, linked_vehicle_id, action_url, metadata
  ) VALUES (
    p_user_id, p_organization_id, p_title, p_body, p_type, p_priority,
    p_linked_job_id, p_linked_vehicle_id, p_action_url, p_metadata
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;