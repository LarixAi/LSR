
-- Add compliance-specific columns to vehicle_checks table
ALTER TABLE public.vehicle_checks ADD COLUMN IF NOT EXISTS compliance_score integer CHECK (compliance_score >= 0 AND compliance_score <= 100);
ALTER TABLE public.vehicle_checks ADD COLUMN IF NOT EXISTS compliance_status text DEFAULT 'compliant' CHECK (compliance_status IN ('compliant', 'non_compliant', 'warning', 'critical'));
ALTER TABLE public.vehicle_checks ADD COLUMN IF NOT EXISTS regulatory_notes text;
ALTER TABLE public.vehicle_checks ADD COLUMN IF NOT EXISTS next_inspection_due date;
ALTER TABLE public.vehicle_checks ADD COLUMN IF NOT EXISTS inspection_type text DEFAULT 'daily' CHECK (inspection_type IN ('daily', 'weekly', 'monthly', 'annual', 'pre_trip', 'post_trip'));

-- Create compliance_standards table for configurable compliance rules
CREATE TABLE IF NOT EXISTS public.compliance_standards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL,
  requirement_name text NOT NULL,
  description text,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  points_deduction integer DEFAULT 0,
  is_mandatory boolean DEFAULT true,
  regulation_reference text,
  organization_id uuid REFERENCES public.organizations(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create driver_compliance_scores table to track driver compliance over time
CREATE TABLE IF NOT EXISTS public.driver_compliance_scores (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid REFERENCES auth.users NOT NULL,
  organization_id uuid REFERENCES public.organizations(id),
  score_date date NOT NULL DEFAULT CURRENT_DATE,
  overall_score integer NOT NULL DEFAULT 100 CHECK (overall_score >= 0 AND overall_score <= 100),
  vehicle_check_score integer DEFAULT 100,
  safety_score integer DEFAULT 100,
  documentation_score integer DEFAULT 100,
  incident_count integer DEFAULT 0,
  risk_level text DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(driver_id, score_date)
);

-- Enable RLS on new tables
ALTER TABLE public.compliance_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_compliance_scores ENABLE ROW LEVEL SECURITY;

-- RLS policies for compliance_standards
CREATE POLICY "Users can view organization compliance standards" 
  ON public.compliance_standards 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations uo 
      WHERE uo.user_id = auth.uid() 
      AND uo.organization_id = compliance_standards.organization_id
      AND uo.is_active = true
    )
  );

CREATE POLICY "Admins can manage compliance standards" 
  ON public.compliance_standards 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'council')
    )
  );

-- RLS policies for driver_compliance_scores
CREATE POLICY "Drivers can view their own compliance scores" 
  ON public.driver_compliance_scores 
  FOR SELECT 
  USING (auth.uid() = driver_id);

CREATE POLICY "Admins can view all compliance scores" 
  ON public.driver_compliance_scores 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'council')
    )
  );

CREATE POLICY "System can insert compliance scores" 
  ON public.driver_compliance_scores 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can update compliance scores" 
  ON public.driver_compliance_scores 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'council')
    )
  );

-- Insert default compliance standards
INSERT INTO public.compliance_standards (category, requirement_name, description, severity, points_deduction, regulation_reference) VALUES
('Vehicle Safety', 'Brake System Check', 'Brake system must be in good working condition', 'critical', 25, 'DOT-FMCSA-393.40'),
('Vehicle Safety', 'Tire Condition', 'Tires must have adequate tread depth and no damage', 'high', 15, 'DOT-FMCSA-393.75'),
('Vehicle Safety', 'Light Systems', 'All lights must be functional', 'medium', 10, 'DOT-FMCSA-393.9'),
('Documentation', 'Daily Inspection Report', 'Complete daily vehicle inspection must be documented', 'high', 20, 'DOT-FMCSA-396.11'),
('Driver Requirements', 'Valid License', 'Driver must have valid commercial license', 'critical', 50, 'DOT-FMCSA-383.23'),
('Hours of Service', 'Drive Time Limits', 'Must comply with maximum driving hours', 'critical', 30, 'DOT-FMCSA-395.8');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_compliance_standards_category ON public.compliance_standards(category);
CREATE INDEX IF NOT EXISTS idx_driver_compliance_scores_driver_date ON public.driver_compliance_scores(driver_id, score_date DESC);
CREATE INDEX IF NOT EXISTS idx_vehicle_checks_compliance ON public.vehicle_checks(compliance_status, compliance_score);
