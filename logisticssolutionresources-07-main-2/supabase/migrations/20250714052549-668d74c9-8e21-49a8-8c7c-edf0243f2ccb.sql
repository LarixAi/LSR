-- Create vehicle_inspections table for smart inspection system
CREATE TABLE public.vehicle_inspections (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL,
    inspection_date DATE NOT NULL DEFAULT CURRENT_DATE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    defect_number TEXT, -- Only assigned on second+ inspections on same day
    inspection_type TEXT NOT NULL DEFAULT 'initial' CHECK (inspection_type IN ('initial', 'recheck', 'breakdown')),
    defects_found BOOLEAN NOT NULL DEFAULT FALSE,
    overall_status TEXT NOT NULL DEFAULT 'pending' CHECK (overall_status IN ('pending', 'passed', 'flagged', 'failed')),
    notes TEXT,
    signature_data TEXT, -- Digital signature or name
    walkaround_data JSONB DEFAULT '{}',
    location_data JSONB DEFAULT '{}',
    organization_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create inspection_questions table
CREATE TABLE public.inspection_questions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    inspection_id UUID NOT NULL REFERENCES public.vehicle_inspections(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_category TEXT NOT NULL,
    response TEXT NOT NULL CHECK (response IN ('pass', 'fail', 'flag', 'n/a')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create function to generate defect numbers
CREATE OR REPLACE FUNCTION public.generate_defect_number(
    p_vehicle_id UUID,
    p_inspection_date DATE
) RETURNS TEXT
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    defect_num TEXT;
    inspection_count INTEGER;
BEGIN
    -- Get count of inspections for this vehicle on this date
    SELECT COUNT(*) INTO inspection_count
    FROM public.vehicle_inspections 
    WHERE vehicle_id = p_vehicle_id 
    AND inspection_date = p_inspection_date;
    
    -- Only generate defect number for second+ inspections
    IF inspection_count > 0 THEN
        defect_num := 'DF-' || TO_CHAR(p_inspection_date, 'YYYYMMDD') || '-' || (inspection_count + 1)::TEXT;
        RETURN defect_num;
    END IF;
    
    RETURN NULL;
END;
$$;

-- Create trigger to auto-assign defect numbers
CREATE OR REPLACE FUNCTION public.set_defect_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Only set defect number if not already set and this is a subsequent inspection
    IF NEW.defect_number IS NULL THEN
        NEW.defect_number := public.generate_defect_number(NEW.vehicle_id, NEW.inspection_date);
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER trigger_set_defect_number
    BEFORE INSERT ON public.vehicle_inspections
    FOR EACH ROW
    EXECUTE FUNCTION public.set_defect_number();

-- Enable RLS
ALTER TABLE public.vehicle_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vehicle_inspections
CREATE POLICY "Drivers can manage their own inspections"
ON public.vehicle_inspections
FOR ALL
USING (auth.uid() = driver_id)
WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Admins can view all inspections"
ON public.vehicle_inspections
FOR SELECT
USING (is_admin_user(auth.uid()));

CREATE POLICY "Mechanics can view vehicle inspections"
ON public.vehicle_inspections
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'mechanic'
    )
);

-- RLS Policies for inspection_questions
CREATE POLICY "Drivers can manage their inspection questions"
ON public.inspection_questions
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.vehicle_inspections
        WHERE id = inspection_questions.inspection_id
        AND driver_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.vehicle_inspections
        WHERE id = inspection_questions.inspection_id
        AND driver_id = auth.uid()
    )
);

CREATE POLICY "Admins can view all inspection questions"
ON public.inspection_questions
FOR SELECT
USING (is_admin_user(auth.uid()));

CREATE POLICY "Mechanics can view inspection questions"
ON public.inspection_questions
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'mechanic'
    )
);

-- Add indexes for performance
CREATE INDEX idx_vehicle_inspections_driver_date ON public.vehicle_inspections(driver_id, inspection_date);
CREATE INDEX idx_vehicle_inspections_vehicle_date ON public.vehicle_inspections(vehicle_id, inspection_date);
CREATE INDEX idx_vehicle_inspections_defect_number ON public.vehicle_inspections(defect_number) WHERE defect_number IS NOT NULL;
CREATE INDEX idx_inspection_questions_inspection_id ON public.inspection_questions(inspection_id);

-- Add updated_at trigger
CREATE TRIGGER update_vehicle_inspections_updated_at
    BEFORE UPDATE ON public.vehicle_inspections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicle_inspections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inspection_questions;