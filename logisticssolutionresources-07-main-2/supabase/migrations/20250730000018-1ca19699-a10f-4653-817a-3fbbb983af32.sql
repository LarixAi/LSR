-- Create email templates table
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  organization_id UUID REFERENCES public.organizations(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email logs table
CREATE TABLE public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered', 'bounced')),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  template_used UUID REFERENCES public.email_templates(id),
  organization_id UUID REFERENCES public.organizations(id),
  sent_by UUID REFERENCES auth.users(id),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for email_templates
CREATE POLICY "Users can view organization email templates" 
ON public.email_templates 
FOR SELECT 
USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Admins can manage email templates" 
ON public.email_templates 
FOR ALL 
USING (organization_id IN (
  SELECT organization_id FROM public.profiles 
  WHERE id = auth.uid() AND role IN ('admin', 'council')
));

-- RLS policies for email_logs
CREATE POLICY "Users can view organization email logs" 
ON public.email_logs 
FOR SELECT 
USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Admins can manage email logs" 
ON public.email_logs 
FOR ALL 
USING (organization_id IN (
  SELECT organization_id FROM public.profiles 
  WHERE id = auth.uid() AND role IN ('admin', 'council')
));

-- Add indexes for performance
CREATE INDEX idx_email_templates_organization ON public.email_templates(organization_id);
CREATE INDEX idx_email_templates_category ON public.email_templates(category);
CREATE INDEX idx_email_logs_organization ON public.email_logs(organization_id);
CREATE INDEX idx_email_logs_status ON public.email_logs(status);
CREATE INDEX idx_email_logs_sent_at ON public.email_logs(sent_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_email_templates_updated_at();