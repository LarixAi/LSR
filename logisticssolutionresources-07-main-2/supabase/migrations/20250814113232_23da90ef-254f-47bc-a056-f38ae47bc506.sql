-- Create incidents table
CREATE TABLE public.incidents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id),
    incident_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT DEFAULT 'low'::TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'open'::TEXT CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
    incident_date DATE,
    incident_time TIME,
    location_lat NUMERIC,
    location_lng NUMERIC,
    location_address TEXT,
    people_involved TEXT[],
    witnesses TEXT[],
    vehicle_id UUID REFERENCES public.vehicles(id),
    driver_id UUID REFERENCES public.profiles(id),
    reported_by UUID REFERENCES public.profiles(id) NOT NULL,
    attachments JSONB DEFAULT '[]'::JSONB,
    additional_data JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view incidents in their organization" 
ON public.incidents 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create incidents in their organization" 
ON public.incidents 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update incidents in their organization" 
ON public.incidents 
FOR UPDATE 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_incidents_updated_at
    BEFORE UPDATE ON public.incidents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();