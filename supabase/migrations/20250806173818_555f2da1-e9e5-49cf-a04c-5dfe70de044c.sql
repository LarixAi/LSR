-- Create infringement management system tables

-- Create infringement_types table
CREATE TABLE public.infringement_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  penalty_points INTEGER DEFAULT 0,
  fine_amount NUMERIC(10,2) DEFAULT 0,
  organization_id UUID NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create infringements table for tracking violations
CREATE TABLE public.infringements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  infringement_number TEXT NOT NULL UNIQUE,
  driver_id UUID NOT NULL,
  vehicle_id UUID,
  infringement_type_id UUID NOT NULL REFERENCES public.infringement_types(id),
  organization_id UUID NOT NULL,
  incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  description TEXT NOT NULL,
  evidence_urls TEXT[],
  reported_by UUID,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'confirmed', 'dismissed', 'appealed', 'resolved')),
  penalty_points INTEGER DEFAULT 0,
  fine_amount NUMERIC(10,2) DEFAULT 0,
  due_date DATE,
  paid_date TIMESTAMP WITH TIME ZONE,
  appeal_notes TEXT,
  resolution_notes TEXT,
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create driver_points_history for tracking penalty points
CREATE TABLE public.driver_points_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL,
  infringement_id UUID REFERENCES public.infringements(id),
  points_added INTEGER NOT NULL,
  points_removed INTEGER DEFAULT 0,
  total_points INTEGER NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('infringement', 'appeal_success', 'points_reduction', 'points_reset')),
  notes TEXT,
  created_by UUID,
  organization_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create infringement_appeals table
CREATE TABLE public.infringement_appeals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  infringement_id UUID NOT NULL REFERENCES public.infringements(id),
  driver_id UUID NOT NULL,
  appeal_reason TEXT NOT NULL,
  supporting_evidence TEXT[],
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  reviewed_by UUID,
  review_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  organization_id UUID NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.infringement_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infringements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infringement_appeals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for infringement_types
CREATE POLICY "Organization members can view infringement types" 
ON public.infringement_types FOR SELECT 
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage infringement types" 
ON public.infringement_types FOR ALL 
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'council', 'compliance_officer')));

-- RLS Policies for infringements
CREATE POLICY "Drivers can view their own infringements" 
ON public.infringements FOR SELECT 
USING (driver_id = auth.uid() OR organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'council', 'compliance_officer')));

CREATE POLICY "Admins can manage all infringements" 
ON public.infringements FOR ALL 
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'council', 'compliance_officer')));

-- RLS Policies for driver_points_history
CREATE POLICY "Drivers can view their points history" 
ON public.driver_points_history FOR SELECT 
USING (driver_id = auth.uid() OR organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'council', 'compliance_officer')));

CREATE POLICY "Admins can manage points history" 
ON public.driver_points_history FOR ALL 
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'council', 'compliance_officer')));

-- RLS Policies for infringement_appeals
CREATE POLICY "Drivers can manage their appeals" 
ON public.infringement_appeals FOR ALL 
USING (driver_id = auth.uid() OR organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'council', 'compliance_officer')));

-- Create functions for infringement number generation
CREATE OR REPLACE FUNCTION public.generate_infringement_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    infringement_num TEXT;
    sequence_val INTEGER;
BEGIN
    -- Get next sequence value for today
    SELECT COALESCE(MAX(CAST(SUBSTRING(infringement_number FROM 'INF-[0-9]{8}-([0-9]+)') AS INTEGER)), 0) + 1
    INTO sequence_val
    FROM public.infringements
    WHERE infringement_number LIKE 'INF-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-%';
    
    -- Generate infringement number: INF-YYYYMMDD-XXXX
    infringement_num := 'INF-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(sequence_val::TEXT, 4, '0');
    
    RETURN infringement_num;
END;
$$;

-- Create trigger to set infringement number
CREATE OR REPLACE FUNCTION public.set_infringement_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF NEW.infringement_number IS NULL THEN
        NEW.infringement_number := public.generate_infringement_number();
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_infringement_number_trigger
BEFORE INSERT ON public.infringements
FOR EACH ROW
EXECUTE FUNCTION public.set_infringement_number();

-- Create function to update driver points
CREATE OR REPLACE FUNCTION public.update_driver_points(
    p_driver_id UUID,
    p_infringement_id UUID,
    p_points INTEGER,
    p_action_type TEXT,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    current_total INTEGER := 0;
    new_total INTEGER;
    history_id UUID;
    user_org_id UUID;
BEGIN
    -- Get user's organization
    SELECT organization_id INTO user_org_id
    FROM public.profiles WHERE id = auth.uid();
    
    -- Get current total points
    SELECT COALESCE(total_points, 0) INTO current_total
    FROM public.driver_points_history
    WHERE driver_id = p_driver_id
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Calculate new total
    new_total := current_total + p_points;
    IF new_total < 0 THEN
        new_total := 0;
    END IF;
    
    -- Insert points history record
    INSERT INTO public.driver_points_history (
        driver_id, infringement_id, points_added, total_points,
        action_type, notes, created_by, organization_id
    ) VALUES (
        p_driver_id, p_infringement_id, p_points, new_total,
        p_action_type, p_notes, auth.uid(), user_org_id
    ) RETURNING id INTO history_id;
    
    RETURN history_id;
END;
$$;

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_infringement_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_infringement_types_updated_at
BEFORE UPDATE ON public.infringement_types
FOR EACH ROW
EXECUTE FUNCTION public.update_infringement_updated_at();

CREATE TRIGGER update_infringements_updated_at
BEFORE UPDATE ON public.infringements
FOR EACH ROW
EXECUTE FUNCTION public.update_infringement_updated_at();

-- Insert default infringement types
INSERT INTO public.infringement_types (name, description, severity, penalty_points, fine_amount, organization_id) 
SELECT 
    'Speeding', 'Exceeding speed limits', 'medium', 3, 100.00, o.id
FROM public.organizations o;

INSERT INTO public.infringement_types (name, description, severity, penalty_points, fine_amount, organization_id) 
SELECT 
    'Reckless Driving', 'Dangerous or reckless driving behavior', 'high', 6, 300.00, o.id
FROM public.organizations o;

INSERT INTO public.infringement_types (name, description, severity, penalty_points, fine_amount, organization_id) 
SELECT 
    'Vehicle Maintenance', 'Failure to maintain vehicle properly', 'medium', 3, 150.00, o.id
FROM public.organizations o;

INSERT INTO public.infringement_types (name, description, severity, penalty_points, fine_amount, organization_id) 
SELECT 
    'Documentation', 'Missing or invalid documentation', 'low', 1, 50.00, o.id
FROM public.organizations o;

INSERT INTO public.infringement_types (name, description, severity, penalty_points, fine_amount, organization_id) 
SELECT 
    'Hours of Service', 'Violation of driving time regulations', 'high', 4, 200.00, o.id
FROM public.organizations o;