-- Create enhanced notifications table for driver events
CREATE TABLE public.enhanced_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  sender_id UUID,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'success', 'error'
  priority TEXT NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  action_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  read_at TIMESTAMP WITH TIME ZONE,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.enhanced_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.enhanced_notifications 
FOR SELECT 
USING (recipient_id = auth.uid());

CREATE POLICY "Organization admins can view all organization notifications" 
ON public.enhanced_notifications 
FOR SELECT 
USING (
  organization_id = get_current_user_organization_id_safe() 
  AND is_current_user_admin_safe()
);

CREATE POLICY "System can insert notifications" 
ON public.enhanced_notifications 
FOR INSERT 
WITH CHECK (organization_id = get_current_user_organization_id_safe());

CREATE POLICY "Users can update their own notifications (mark as read)" 
ON public.enhanced_notifications 
FOR UPDATE 
USING (recipient_id = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_enhanced_notifications_updated_at
  BEFORE UPDATE ON public.enhanced_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_enhanced_notifications_recipient ON public.enhanced_notifications(recipient_id, created_at DESC);
CREATE INDEX idx_enhanced_notifications_organization ON public.enhanced_notifications(organization_id, created_at DESC);
CREATE INDEX idx_enhanced_notifications_unread ON public.enhanced_notifications(recipient_id, is_read, created_at DESC);