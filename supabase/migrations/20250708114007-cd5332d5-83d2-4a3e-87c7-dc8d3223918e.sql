-- Create training completions table
CREATE TABLE public.training_completions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    driver_id UUID NOT NULL,
    module_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed',
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '3 months'),
    certificate_url TEXT,
    organization_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create training certificates table
CREATE TABLE public.training_certificates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    completion_id UUID NOT NULL,
    driver_id UUID NOT NULL,
    module_name TEXT NOT NULL,
    score INTEGER NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    certificate_number TEXT NOT NULL,
    organization_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.training_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_certificates ENABLE ROW LEVEL SECURITY;

-- RLS policies for training_completions
CREATE POLICY "Drivers can view their own completions" 
ON public.training_completions 
FOR SELECT 
USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can create their own completions" 
ON public.training_completions 
FOR INSERT 
WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Admins can manage all completions" 
ON public.training_completions 
FOR ALL 
USING (is_admin_user(auth.uid()));

-- RLS policies for training_certificates
CREATE POLICY "Drivers can view their own certificates" 
ON public.training_certificates 
FOR SELECT 
USING (auth.uid() = driver_id);

CREATE POLICY "Admins can manage all certificates" 
ON public.training_certificates 
FOR ALL 
USING (is_admin_user(auth.uid()));

-- Create function to generate certificate number
CREATE OR REPLACE FUNCTION public.generate_certificate_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    cert_num TEXT;
BEGIN
    SELECT 'CERT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('public.ticket_number_seq')::TEXT, 4, '0')
    INTO cert_num;
    
    RETURN cert_num;
END;
$$;

-- Create trigger to auto-generate certificate number
CREATE OR REPLACE FUNCTION public.set_certificate_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.certificate_number IS NULL THEN
        NEW.certificate_number := public.generate_certificate_number();
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_certificate_number_trigger
    BEFORE INSERT ON public.training_certificates
    FOR EACH ROW
    EXECUTE FUNCTION public.set_certificate_number();

-- Add updated_at trigger for training_completions
CREATE TRIGGER update_training_completions_updated_at
    BEFORE UPDATE ON public.training_completions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();