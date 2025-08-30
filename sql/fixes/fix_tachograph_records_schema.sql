-- Fix tachograph_records table schema and foreign key relationships
-- This script ensures the table has proper structure and relationships

-- Drop existing tachograph_records table if it exists (to avoid conflicts)
DROP TABLE IF EXISTS public.tachograph_records CASCADE;

-- Create tachograph_records table with proper schema
CREATE TABLE public.tachograph_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
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
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_tachograph_records_updated_at
  BEFORE UPDATE ON public.tachograph_records
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert some sample data for testing
INSERT INTO public.tachograph_records (
  organization_id,
  driver_id,
  vehicle_id,
  record_date,
  start_time,
  end_time,
  activity_type,
  distance_km,
  start_location,
  end_location,
  violations,
  card_type,
  card_number,
  download_method,
  data_quality_score,
  is_complete,
  notes
) VALUES 
-- Sample record 1
(
  (SELECT id FROM public.organizations LIMIT 1),
  (SELECT id FROM public.profiles WHERE role = 'driver' LIMIT 1),
  (SELECT id FROM public.vehicles LIMIT 1),
  CURRENT_DATE - INTERVAL '1 day',
  (CURRENT_DATE - INTERVAL '1 day')::date + INTERVAL '08:00:00',
  (CURRENT_DATE - INTERVAL '1 day')::date + INTERVAL '17:00:00',
  'driving',
  150.5,
  'London',
  'Manchester',
  ARRAY['speed_limit_exceeded'],
  'driver',
  'DRIVER123456',
  'manual',
  95,
  true,
  'Daily driving record'
),
-- Sample record 2
(
  (SELECT id FROM public.organizations LIMIT 1),
  (SELECT id FROM public.profiles WHERE role = 'driver' LIMIT 1),
  (SELECT id FROM public.vehicles LIMIT 1),
  CURRENT_DATE,
  CURRENT_DATE::date + INTERVAL '09:00:00',
  CURRENT_DATE::date + INTERVAL '18:00:00',
  'driving',
  120.0,
  'Birmingham',
  'Leeds',
  ARRAY[],
  'driver',
  'DRIVER789012',
  'automatic',
  98,
  true,
  'Current day record'
);

-- Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'tachograph_records' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verify foreign key relationships
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'tachograph_records';

