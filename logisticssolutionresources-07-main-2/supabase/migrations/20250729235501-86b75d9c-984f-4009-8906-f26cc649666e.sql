-- Create email templates table
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email logs table
CREATE TABLE public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  template_used UUID,
  sent_by UUID NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  error_message TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for email_templates
CREATE POLICY "Organization members can view email templates" 
ON public.email_templates 
FOR SELECT 
USING (organization_id IN (
  SELECT organization_id 
  FROM public.profiles 
  WHERE id = auth.uid()
));

CREATE POLICY "Staff can manage email templates" 
ON public.email_templates 
FOR ALL 
USING (organization_id IN (
  SELECT organization_id 
  FROM public.profiles 
  WHERE id = auth.uid() 
  AND role IN ('admin', 'council')
));

-- Create policies for email_logs
CREATE POLICY "Organization members can view email logs" 
ON public.email_logs 
FOR SELECT 
USING (organization_id IN (
  SELECT organization_id 
  FROM public.profiles 
  WHERE id = auth.uid()
));

CREATE POLICY "Staff can manage email logs" 
ON public.email_logs 
FOR ALL 
USING (organization_id IN (
  SELECT organization_id 
  FROM public.profiles 
  WHERE id = auth.uid() 
  AND role IN ('admin', 'council')
));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for email_templates
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_email_templates_updated_at();