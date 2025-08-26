-- Create tachograph_records table for driver hours tracking
CREATE TABLE IF NOT EXISTS public.tachograph_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  activity_type TEXT CHECK (activity_type IN ('driving', 'rest', 'break', 'other_work', 'availability', 'poa')),
  distance_km DECIMAL(8,2),
  start_location TEXT,
  end_location TEXT,
  speed_data JSONB, -- Store speed data as JSON
  violations TEXT[], -- Array of violations found
  card_type TEXT CHECK (card_type IN ('driver', 'company', 'workshop', 'control')),
  card_number TEXT,
  download_method TEXT CHECK (download_method IN ('manual', 'automatic', 'remote')),
  download_timestamp TIMESTAMPTZ DEFAULT now(),
  equipment_serial_number TEXT,
  calibration_date DATE,
  next_calibration_date DATE,
  data_quality_score INTEGER CHECK (data_quality_score >= 0 AND data_quality_score <= 100),
  is_complete BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tachograph_records_organization_id ON public.tachograph_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_tachograph_records_driver_id ON public.tachograph_records(driver_id);
CREATE INDEX IF NOT EXISTS idx_tachograph_records_vehicle_id ON public.tachograph_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_tachograph_records_record_date ON public.tachograph_records(record_date);
CREATE INDEX IF NOT EXISTS idx_tachograph_records_activity_type ON public.tachograph_records(activity_type);
CREATE INDEX IF NOT EXISTS idx_tachograph_records_card_type ON public.tachograph_records(card_type);
CREATE INDEX IF NOT EXISTS idx_tachograph_records_download_timestamp ON public.tachograph_records(download_timestamp);

-- Enable Row Level Security
ALTER TABLE public.tachograph_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view tachograph records from their organization" ON public.tachograph_records
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert tachograph records for their organization" ON public.tachograph_records
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update tachograph records from their organization" ON public.tachograph_records
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete tachograph records from their organization" ON public.tachograph_records
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Create updated_at trigger
CREATE TRIGGER handle_tachograph_records_updated_at
  BEFORE UPDATE ON public.tachograph_records
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
