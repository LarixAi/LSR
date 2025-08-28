-- Add Notification System for Agreement Management
-- This migration updates existing notification_templates table and creates notification_logs

-- First, check if we need to add is_active column to existing notification_templates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'notification_templates'
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.notification_templates ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Create notification_logs table
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  agreement_id UUID NOT NULL REFERENCES public.user_agreements(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('agreement_update', 'reminder', 'welcome')),
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  user_email TEXT,
  agreement_title TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default notification templates with correct type and category values
INSERT INTO public.notification_templates (name, title, body, type, priority, category, is_default) 
SELECT * FROM (VALUES
  (
    'Agreement Update Notification',
    'Important: Updated Terms of Service - Action Required',
    'Dear {{user_name}},

We have updated our Terms of Service. Please review and accept the new terms to continue using our services.

Key changes include:
- Updated privacy practices
- Enhanced security measures
- Improved user rights

Please log in to your account to review and accept the updated terms.

Best regards,
The LSR Team',
    'warning',
    'high',
    'general',
    true
  ),
  (
    'Agreement Reminder',
    'Reminder: Please Accept Updated Agreements',
    'Dear {{user_name}},

This is a friendly reminder that you have pending agreement updates that need your attention.

To ensure uninterrupted access to our services, please log in to your account and accept the updated agreements.

If you have any questions, please don''t hesitate to contact our support team.

Best regards,
The LSR Team',
    'info',
    'normal',
    'general',
    true
  ),
  (
    'Welcome Agreement',
    'Welcome to LSR - Please Accept Our Terms',
    'Dear {{user_name}},

Welcome to LSR Transport Management System!

To get started, please review and accept our Terms of Service and Privacy Policy. These documents outline how we protect your data and ensure a secure experience.

Please log in to your account to complete this step.

Best regards,
The LSR Team',
    'info',
    'normal',
    'general',
    true
  )
) AS t(name, title, body, type, priority, category, is_default)
WHERE NOT EXISTS (
  SELECT 1 FROM public.notification_templates 
  WHERE notification_templates.name = t.name
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON public.notification_templates(type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_active ON public.notification_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON public.notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_agreement_id ON public.notification_logs(agreement_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON public.notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON public.notification_logs(sent_at);

-- Enable Row Level Security
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Update RLS policies for notification_templates to be more secure
DROP POLICY IF EXISTS "Public can view active notification templates" ON public.notification_templates;
DROP POLICY IF EXISTS "Admins can manage notification templates" ON public.notification_templates;
DROP POLICY IF EXISTS "Organization members can view active templates" ON public.notification_templates;
DROP POLICY IF EXISTS "Admins can manage org templates" ON public.notification_templates;
DROP POLICY IF EXISTS "Organization members can view templates" ON public.notification_templates;
DROP POLICY IF EXISTS "Admins can manage templates" ON public.notification_templates;

-- Create secure RLS policies for notification_templates
CREATE POLICY "Organization members can view templates" ON public.notification_templates
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND is_active = true
    AND (
      organization_id IS NULL -- System templates
      OR organization_id = get_current_user_organization_id_safe()
    )
  );

CREATE POLICY "Admins can manage templates" ON public.notification_templates
  FOR ALL USING (
    auth.uid() IS NOT NULL 
    AND is_current_user_admin_safe()
    AND (
      organization_id IS NULL -- Super admin for system templates
      OR organization_id = get_current_user_organization_id_safe()
    )
  );

-- Create RLS policies for notification_logs
CREATE POLICY "Admins can view all logs" ON public.notification_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'council')
    )
  );

CREATE POLICY "Admins can insert logs" ON public.notification_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'council')
    )
  );

CREATE POLICY "Admins can update logs" ON public.notification_logs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'council')
    )
  );

-- Create function to get notification statistics
CREATE OR REPLACE FUNCTION public.get_notification_stats()
RETURNS TABLE(
  total_sent INTEGER,
  total_failed INTEGER,
  total_pending INTEGER,
  success_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) FILTER (WHERE status = 'sent')::INTEGER as total_sent,
    COUNT(*) FILTER (WHERE status = 'failed')::INTEGER as total_failed,
    COUNT(*) FILTER (WHERE status = 'pending')::INTEGER as total_pending,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*) FILTER (WHERE status = 'sent')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
      ELSE 0 
    END as success_rate
  FROM public.notification_logs;
END;
$$;

-- Create function to get users needing agreement acceptance
CREATE OR REPLACE FUNCTION public.get_users_needing_agreement_acceptance()
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  needs_terms BOOLEAN,
  needs_privacy BOOLEAN,
  last_login TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  latest_terms TEXT;
  latest_privacy TEXT;
BEGIN
  -- Get latest versions
  SELECT get_latest_agreement_version('terms_of_service') INTO latest_terms;
  SELECT get_latest_agreement_version('privacy_policy') INTO latest_privacy;
  
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.email,
    p.first_name,
    p.last_name,
    (latest_terms IS NOT NULL AND (p.terms_version IS NULL OR p.terms_version != latest_terms)) as needs_terms,
    (latest_privacy IS NOT NULL AND (p.privacy_policy_version IS NULL OR p.privacy_policy_version != latest_privacy)) as needs_privacy,
    p.updated_at as last_login
  FROM public.profiles p
  WHERE 
    (latest_terms IS NOT NULL AND (p.terms_version IS NULL OR p.terms_version != latest_terms))
    OR (latest_privacy IS NOT NULL AND (p.privacy_policy_version IS NULL OR p.privacy_policy_version != latest_privacy));
END;
$$;