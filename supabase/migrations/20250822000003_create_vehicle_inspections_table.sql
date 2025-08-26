-- Create vehicle_inspections table for compliance tracking
CREATE TABLE IF NOT EXISTS public.vehicle_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.profiles(id),
  inspection_date DATE NOT NULL,
  inspection_type TEXT NOT NULL CHECK (inspection_type IN ('daily', 'weekly', 'monthly', 'annual', 'pre_trip', 'post_trip', 'safety', 'compliance')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'passed', 'failed', 'conditional')),
  inspector_name TEXT,
  inspector_id UUID REFERENCES public.profiles(id),
  inspection_notes TEXT,
  defects_found TEXT[],
  compliance_score INTEGER CHECK (compliance_score >= 0 AND compliance_score <= 100),
  next_inspection_date DATE,
  inspection_location TEXT,
  weather_conditions TEXT,
  vehicle_mileage INTEGER,
  fuel_level TEXT,
  oil_level TEXT,
  tire_condition TEXT,
  brake_condition TEXT,
  lights_condition TEXT,
  emergency_equipment TEXT[],
  photos TEXT[], -- URLs to inspection photos
  signature_data TEXT, -- Digital signature data
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_organization_id ON public.vehicle_inspections(organization_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_vehicle_id ON public.vehicle_inspections(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_driver_id ON public.vehicle_inspections(driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_inspection_date ON public.vehicle_inspections(inspection_date);
CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_status ON public.vehicle_inspections(status);
CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_inspection_type ON public.vehicle_inspections(inspection_type);
CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_next_inspection_date ON public.vehicle_inspections(next_inspection_date);

-- Enable Row Level Security
ALTER TABLE public.vehicle_inspections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view vehicle inspections from their organization" ON public.vehicle_inspections
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert vehicle inspections for their organization" ON public.vehicle_inspections
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update vehicle inspections from their organization" ON public.vehicle_inspections
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete vehicle inspections from their organization" ON public.vehicle_inspections
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Create updated_at trigger
CREATE TRIGGER handle_vehicle_inspections_updated_at
  BEFORE UPDATE ON public.vehicle_inspections
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
