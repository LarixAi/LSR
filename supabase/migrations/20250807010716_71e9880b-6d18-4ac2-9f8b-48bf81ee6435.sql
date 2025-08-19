-- Create enhanced vehicle inspection system tables

-- Create inspection question templates for PSV and standard checks
CREATE TABLE IF NOT EXISTS public.inspection_question_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  question_text TEXT NOT NULL,
  question_category TEXT NOT NULL, -- 'safety', 'mechanical', 'electrical', 'bodywork', 'psv_specific'
  vehicle_types TEXT[] DEFAULT '{}', -- Empty array means applies to all vehicle types
  is_mandatory BOOLEAN DEFAULT true,
  order_number INTEGER DEFAULT 0,
  expected_response_type TEXT DEFAULT 'pass_fail', -- 'pass_fail', 'pass_fail_na', 'numeric', 'text'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Create storage bucket for vehicle registration photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vehicle-photos', 'vehicle-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for vehicle photos
CREATE POLICY "Drivers can upload vehicle photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'vehicle-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Drivers can view their own vehicle photos" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'vehicle-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all vehicle photos" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'vehicle-photos' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'council')
  )
);

-- Add columns to vehicle_inspections for enhanced tracking
ALTER TABLE public.vehicle_inspections 
ADD COLUMN IF NOT EXISTS vehicle_registration_photo_url TEXT,
ADD COLUMN IF NOT EXISTS defect_number TEXT,
ADD COLUMN IF NOT EXISTS inspection_type TEXT DEFAULT 'daily_check',
ADD COLUMN IF NOT EXISTS fit_to_drive_response BOOLEAN,
ADD COLUMN IF NOT EXISTS fit_to_drive_notes TEXT,
ADD COLUMN IF NOT EXISTS odometer_reading INTEGER,
ADD COLUMN IF NOT EXISTS gps_latitude NUMERIC,
ADD COLUMN IF NOT EXISTS gps_longitude NUMERIC,
ADD COLUMN IF NOT EXISTS is_psv_inspection BOOLEAN DEFAULT false;

-- Create enhanced defect number generator
CREATE OR REPLACE FUNCTION public.generate_enhanced_defect_number(p_vehicle_id UUID, p_inspection_date DATE)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    defect_num TEXT;
    daily_count INTEGER;
    vehicle_number TEXT;
BEGIN
    -- Get vehicle number for reference
    SELECT vehicles.vehicle_number INTO vehicle_number
    FROM public.vehicles 
    WHERE id = p_vehicle_id;
    
    -- Get count of inspections for this vehicle on this date with defects
    SELECT COUNT(*) INTO daily_count
    FROM public.vehicle_inspections 
    WHERE vehicle_id = p_vehicle_id 
    AND inspection_date = p_inspection_date
    AND defects_found = true;
    
    -- Generate defect number: DEF-VEHICLENUM-YYYYMMDD-XX
    defect_num := 'DEF-' || COALESCE(vehicle_number, 'UNK') || '-' || TO_CHAR(p_inspection_date, 'YYYYMMDD') || '-' || LPAD((daily_count + 1)::TEXT, 2, '0');
    
    RETURN defect_num;
END;
$$;

-- Update the existing defect number trigger
CREATE OR REPLACE FUNCTION public.set_enhanced_defect_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Only set defect number if defects were found and no number exists
    IF NEW.defects_found = true AND NEW.defect_number IS NULL THEN
        NEW.defect_number := public.generate_enhanced_defect_number(NEW.vehicle_id, NEW.inspection_date);
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create or replace the trigger
DROP TRIGGER IF EXISTS set_enhanced_defect_number_trigger ON public.vehicle_inspections;
CREATE TRIGGER set_enhanced_defect_number_trigger
    BEFORE INSERT OR UPDATE ON public.vehicle_inspections
    FOR EACH ROW
    EXECUTE FUNCTION public.set_enhanced_defect_number();

-- Insert standard PSV inspection questions
INSERT INTO public.inspection_question_templates (organization_id, question_text, question_category, vehicle_types, is_mandatory, order_number) 
SELECT 
    o.id as organization_id,
    question_text,
    question_category,
    vehicle_types,
    is_mandatory,
    order_number
FROM public.organizations o
CROSS JOIN (VALUES
    ('Check all lights are working (headlights, brake lights, indicators)', 'safety', ARRAY['coach', 'bus', 'minibus'], true, 1),
    ('Check tyres for adequate tread depth (minimum 1.6mm)', 'safety', ARRAY['coach', 'bus', 'minibus'], true, 2),
    ('Check all mirrors are clean and properly adjusted', 'safety', ARRAY['coach', 'bus', 'minibus'], true, 3),
    ('Check emergency exits are clear and operational', 'psv_specific', ARRAY['coach', 'bus', 'minibus'], true, 4),
    ('Check fire extinguisher is present and in date', 'psv_specific', ARRAY['coach', 'bus', 'minibus'], true, 5),
    ('Check first aid kit is present and stocked', 'psv_specific', ARRAY['coach', 'bus', 'minibus'], true, 6),
    ('Check seatbelts are functional (where fitted)', 'safety', ARRAY['coach', 'bus', 'minibus'], true, 7),
    ('Check warning triangle is present', 'safety', '{}', true, 8),
    ('Check windscreen for cracks or damage', 'safety', '{}', true, 9),
    ('Check horn is working', 'mechanical', '{}', true, 10),
    ('Check handbrake operates effectively', 'mechanical', '{}', true, 11),
    ('Check steering has no excessive play', 'mechanical', '{}', true, 12),
    ('Check engine oil level', 'mechanical', '{}', true, 13),
    ('Check coolant level', 'mechanical', '{}', true, 14),
    ('Check brake fluid level', 'mechanical', '{}', true, 15),
    ('Check for any fluid leaks under vehicle', 'mechanical', '{}', true, 16),
    ('Check body panels for damage', 'bodywork', '{}', false, 17),
    ('Check registration plates are secure and clean', 'safety', '{}', true, 18)
) AS questions(question_text, question_category, vehicle_types, is_mandatory, order_number)
ON CONFLICT DO NOTHING;

-- Enable RLS on new table
ALTER TABLE public.inspection_question_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for inspection question templates
CREATE POLICY "Organization members can view inspection templates" 
ON public.inspection_question_templates 
FOR SELECT 
USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Admins can manage inspection templates" 
ON public.inspection_question_templates 
FOR ALL 
USING (organization_id IN (
  SELECT organization_id FROM public.profiles 
  WHERE id = auth.uid() 
  AND role IN ('admin', 'council')
));

-- Add updated_at trigger for inspection_question_templates
CREATE TRIGGER update_inspection_question_templates_updated_at
  BEFORE UPDATE ON public.inspection_question_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();