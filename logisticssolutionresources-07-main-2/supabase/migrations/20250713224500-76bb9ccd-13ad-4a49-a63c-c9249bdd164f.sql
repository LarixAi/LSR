-- Fix enhanced_notifications table by adding missing user_id column
ALTER TABLE public.enhanced_notifications 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing records to have proper user_id (use recipient_id as fallback)
UPDATE public.enhanced_notifications 
SET user_id = recipient_id 
WHERE user_id IS NULL AND recipient_id IS NOT NULL;

-- Enable RLS on enhanced_notifications
ALTER TABLE public.enhanced_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for enhanced_notifications
CREATE POLICY "Users can view their own notifications" 
ON public.enhanced_notifications 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = recipient_id OR auth.uid() = sender_id);

CREATE POLICY "Users can create notifications" 
ON public.enhanced_notifications 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own notifications" 
ON public.enhanced_notifications 
FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() = recipient_id);

-- Fix vehicles table organization_id column mismatch
-- Update vehicles to use the correct organization_id column consistently
UPDATE public.vehicles 
SET organization_id = organization_id_new 
WHERE organization_id IS NULL AND organization_id_new IS NOT NULL;

-- Create proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_enhanced_notifications_user_id ON public.enhanced_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_notifications_recipient_id ON public.enhanced_notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_organization_id ON public.vehicles(organization_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_organization_id_new ON public.vehicles(organization_id_new);