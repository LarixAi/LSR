-- Create incidents table for incident reporting
CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('minor', 'major', 'severe', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  organization_id UUID NOT NULL,
  incident_date DATE,
  incident_time TIME,
  location_lat NUMERIC,
  location_lng NUMERIC,
  location_address TEXT,
  people_involved TEXT[],
  witnesses TEXT[],
  vehicle_id UUID,
  driver_id UUID,
  reported_by UUID NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  additional_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT fk_incidents_organization 
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_incidents_vehicle 
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  CONSTRAINT fk_incidents_driver 
    FOREIGN KEY (driver_id) REFERENCES profiles(id),
  CONSTRAINT fk_incidents_reported_by 
    FOREIGN KEY (reported_by) REFERENCES profiles(id)
);

-- Enable Row Level Security
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view organization incidents" 
ON public.incidents 
FOR SELECT 
USING (organization_id IN (
  SELECT organization_id 
  FROM profiles 
  WHERE id = auth.uid()
));

CREATE POLICY "Users can create incidents in their organization" 
ON public.incidents 
FOR INSERT 
WITH CHECK (organization_id IN (
  SELECT organization_id 
  FROM profiles 
  WHERE id = auth.uid()
));

CREATE POLICY "Users can update incidents in their organization" 
ON public.incidents 
FOR UPDATE 
USING (organization_id IN (
  SELECT organization_id 
  FROM profiles 
  WHERE id = auth.uid()
));

CREATE POLICY "Admins can delete incidents in their organization" 
ON public.incidents 
FOR DELETE 
USING (organization_id IN (
  SELECT organization_id 
  FROM profiles 
  WHERE id = auth.uid() 
  AND role IN ('admin', 'council')
));

-- Create indexes for better performance
CREATE INDEX idx_incidents_organization_id ON public.incidents(organization_id);
CREATE INDEX idx_incidents_vehicle_id ON public.incidents(vehicle_id);
CREATE INDEX idx_incidents_driver_id ON public.incidents(driver_id);
CREATE INDEX idx_incidents_reported_by ON public.incidents(reported_by);
CREATE INDEX idx_incidents_status ON public.incidents(status);
CREATE INDEX idx_incidents_severity ON public.incidents(severity);
CREATE INDEX idx_incidents_date ON public.incidents(incident_date);

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_incidents_updated_at
  BEFORE UPDATE ON public.incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();