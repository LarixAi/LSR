-- Create Email Management Tables (excluding existing ones)
-- This script creates the necessary tables for email campaigns and templates

-- 1. Create email_campaigns table (new)
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

-- 2. Create email_recipients table (new)
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

-- 3. Create email_settings table (new)
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

-- 4. Add type column to existing email_templates table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'email_templates' 
                   AND column_name = 'type' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.email_templates 
        ADD COLUMN type TEXT CHECK (type IN ('newsletter', 'billing', 'onboarding', 'notification', 'promotional'));
    END IF;
END $$;

-- 5. Enable Row Level Security
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
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

-- 7. Create RLS policies for email_recipients
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

-- 8. Create RLS policies for email_settings
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

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_campaigns_organization_id ON public.email_campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON public.email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_at ON public.email_campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled_for ON public.email_campaigns(scheduled_for);

CREATE INDEX IF NOT EXISTS idx_email_recipients_campaign_id ON public.email_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_recipients_status ON public.email_recipients(status);
CREATE INDEX IF NOT EXISTS idx_email_recipients_email ON public.email_recipients(recipient_email);

CREATE INDEX IF NOT EXISTS idx_email_settings_organization_id ON public.email_settings(organization_id);

-- 10. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_campaigns TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_recipients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_settings TO authenticated;