-- Create walk_around_checks table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.walk_around_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.profiles(id),
  question_set_id UUID REFERENCES public.inspection_question_sets(id) ON DELETE SET NULL,
  check_date DATE NOT NULL,
  check_time TIME,
  overall_status TEXT DEFAULT 'pending' CHECK (overall_status IN ('pass', 'fail', 'warning', 'pending')),
  location TEXT,
  weather_conditions TEXT,
  mileage INTEGER,
  notes TEXT,
  defects_found INTEGER DEFAULT 0,
  photos_taken INTEGER DEFAULT 0,
  check_items JSONB,
  vehicle_year TEXT,
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_number TEXT,
  inspection_form TEXT DEFAULT 'Daily Pre-Trip Inspection',
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  duration TEXT,
  submission_source TEXT DEFAULT 'Mobile App',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_warning TEXT,
  fuel_level TEXT,
  oil_life INTEGER,
  vehicle_condition TEXT DEFAULT 'good' CHECK (vehicle_condition IN ('excellent', 'good', 'fair', 'poor')),
  driver_signature TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_walk_around_checks_organization_id ON public.walk_around_checks(organization_id);
CREATE INDEX IF NOT EXISTS idx_walk_around_checks_vehicle_id ON public.walk_around_checks(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_walk_around_checks_driver_id ON public.walk_around_checks(driver_id);
CREATE INDEX IF NOT EXISTS idx_walk_around_checks_question_set_id ON public.walk_around_checks(question_set_id);
CREATE INDEX IF NOT EXISTS idx_walk_around_checks_check_date ON public.walk_around_checks(check_date);
CREATE INDEX IF NOT EXISTS idx_walk_around_checks_overall_status ON public.walk_around_checks(overall_status);

-- Enable Row Level Security
ALTER TABLE public.walk_around_checks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view walk around checks from their organization" ON public.walk_around_checks
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert walk around checks for their organization" ON public.walk_around_checks
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update walk around checks from their organization" ON public.walk_around_checks
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete walk around checks from their organization" ON public.walk_around_checks
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Create updated_at trigger
CREATE TRIGGER handle_walk_around_checks_updated_at
  BEFORE UPDATE ON public.walk_around_checks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add comments
COMMENT ON TABLE public.walk_around_checks IS 'Store vehicle walk-around check results';
COMMENT ON COLUMN public.walk_around_checks.question_set_id IS 'References the question set used for this inspection';
