-- First, let's create a proper notification permissions system
CREATE TABLE IF NOT EXISTS public.notification_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_role TEXT NOT NULL,
  recipient_role TEXT NOT NULL,
  can_send BOOLEAN NOT NULL DEFAULT true,
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sender_role, recipient_role, organization_id)
);

-- Enable RLS on notification permissions
ALTER TABLE public.notification_permissions ENABLE ROW LEVEL SECURITY;

-- Create policy for notification permissions
CREATE POLICY "Users can view organization notification permissions"
ON public.notification_permissions
FOR SELECT
TO authenticated
USING (organization_id IN (
  SELECT organization_id FROM profiles WHERE id = auth.uid()
));

-- Insert default notification permissions based on requirements
INSERT INTO public.notification_permissions (sender_role, recipient_role, can_send) VALUES
('admin', 'driver', true),
('admin', 'mechanic', true), 
('admin', 'council', true),
('admin', 'parent', true),
('driver', 'admin', true),
('driver', 'mechanic', true),
('driver', 'parent', true),
('parent', 'driver', true),
('parent', 'council', true),
('mechanic', 'admin', true),
('council', 'admin', true),
('council', 'parent', true)
ON CONFLICT (sender_role, recipient_role, organization_id) DO NOTHING;

-- Add function to check notification permissions
CREATE OR REPLACE FUNCTION public.can_send_notification(
  sender_user_id UUID,
  recipient_user_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  sender_role TEXT;
  recipient_role TEXT;
  sender_org_id UUID;
  recipient_org_id UUID;
  can_send_flag BOOLEAN := false;
BEGIN
  -- Get sender info
  SELECT role, organization_id INTO sender_role, sender_org_id
  FROM public.profiles 
  WHERE id = sender_user_id;
  
  -- Get recipient info
  SELECT role, organization_id INTO recipient_role, recipient_org_id
  FROM public.profiles 
  WHERE id = recipient_user_id;
  
  -- Check if both users are in the same organization
  IF sender_org_id != recipient_org_id OR sender_org_id IS NULL OR recipient_org_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check permissions table
  SELECT COALESCE(np.can_send, false) INTO can_send_flag
  FROM public.notification_permissions np
  WHERE np.sender_role = sender_role
    AND np.recipient_role = recipient_role
    AND (np.organization_id = sender_org_id OR np.organization_id IS NULL);
  
  RETURN COALESCE(can_send_flag, false);
END;
$$;