-- Create Email Management Tables
-- This script creates the necessary tables for email campaigns and templates

-- 1. Create email_campaigns table
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('newsletter', 'announcement', 'reminder', 'promotional', 'notification')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled')),
  recipients_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create email_templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('newsletter', 'billing', 'onboarding', 'notification', 'promotional')),
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  used_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create email_recipients table
CREATE TABLE IF NOT EXISTS public.email_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create email_settings table
CREATE TABLE IF NOT EXISTS public.email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  smtp_host TEXT,
  smtp_port INTEGER,
  smtp_username TEXT,
  smtp_password TEXT,
  from_email TEXT,
  from_name TEXT,
  reply_to_email TEXT,
  daily_send_limit INTEGER DEFAULT 1000,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Enable Row Level Security
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for email_campaigns
CREATE POLICY "Users can view email campaigns from their organization" ON public.email_campaigns
FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Admins can manage email campaigns" ON public.email_campaigns
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'council')
  )
);

-- 7. Create RLS policies for email_templates
CREATE POLICY "Users can view email templates from their organization" ON public.email_templates
FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Admins can manage email templates" ON public.email_templates
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'council')
  )
);

-- 8. Create RLS policies for email_recipients
CREATE POLICY "Users can view email recipients from their organization" ON public.email_recipients
FOR SELECT USING (
  campaign_id IN (
    SELECT id FROM public.email_campaigns 
    WHERE organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Admins can manage email recipients" ON public.email_recipients
FOR ALL USING (
  campaign_id IN (
    SELECT id FROM public.email_campaigns 
    WHERE organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'council')
    )
  )
);

-- 9. Create RLS policies for email_settings
CREATE POLICY "Admins can view email settings" ON public.email_settings
FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'council')
  )
);

CREATE POLICY "Admins can manage email settings" ON public.email_settings
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'council')
  )
);

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_campaigns_organization_id ON public.email_campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON public.email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_at ON public.email_campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled_for ON public.email_campaigns(scheduled_for);

CREATE INDEX IF NOT EXISTS idx_email_templates_organization_id ON public.email_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON public.email_templates(type);
CREATE INDEX IF NOT EXISTS idx_email_templates_is_default ON public.email_templates(is_default);

CREATE INDEX IF NOT EXISTS idx_email_recipients_campaign_id ON public.email_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_recipients_status ON public.email_recipients(status);
CREATE INDEX IF NOT EXISTS idx_email_recipients_email ON public.email_recipients(recipient_email);

CREATE INDEX IF NOT EXISTS idx_email_settings_organization_id ON public.email_settings(organization_id);

-- 11. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_campaigns TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_recipients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_settings TO authenticated;

-- 12. Insert sample data
INSERT INTO public.email_templates (organization_id, name, subject, content, type, description, is_default, created_by)
SELECT 
  o.id as organization_id,
  'Service Update Template',
  'LSR Logistics - Monthly Service Updates',
  '<h2>Monthly Service Updates</h2><p>Dear valued customer,</p><p>Here are the latest updates from LSR Logistics...</p>',
  'newsletter',
  'Monthly service updates and company news',
  true,
  p.id as created_by
FROM public.organizations o
CROSS JOIN public.profiles p
WHERE p.role = 'admin' 
  AND p.organization_id = o.id
  AND NOT EXISTS (
    SELECT 1 FROM public.email_templates et 
    WHERE et.organization_id = o.id AND et.name = 'Service Update Template'
  )
LIMIT 1;

INSERT INTO public.email_templates (organization_id, name, subject, content, type, description, is_default, created_by)
SELECT 
  o.id as organization_id,
  'Invoice Template',
  'LSR Logistics - Invoice for Services',
  '<h2>Invoice for Services</h2><p>Dear customer,</p><p>Please find attached your invoice for services rendered...</p>',
  'billing',
  'Professional invoice email template',
  false,
  p.id as created_by
FROM public.organizations o
CROSS JOIN public.profiles p
WHERE p.role = 'admin' 
  AND p.organization_id = o.id
  AND NOT EXISTS (
    SELECT 1 FROM public.email_templates et 
    WHERE et.organization_id = o.id AND et.name = 'Invoice Template'
  )
LIMIT 1;

INSERT INTO public.email_templates (organization_id, name, subject, content, type, description, is_default, created_by)
SELECT 
  o.id as organization_id,
  'Welcome Email',
  'Welcome to LSR Logistics',
  '<h2>Welcome to LSR Logistics</h2><p>Dear customer,</p><p>Welcome to our transportation services...</p>',
  'onboarding',
  'Welcome new customers to our service',
  false,
  p.id as created_by
FROM public.organizations o
CROSS JOIN public.profiles p
WHERE p.role = 'admin' 
  AND p.organization_id = o.id
  AND NOT EXISTS (
    SELECT 1 FROM public.email_templates et 
    WHERE et.organization_id = o.id AND et.name = 'Welcome Email'
  )
LIMIT 1;



