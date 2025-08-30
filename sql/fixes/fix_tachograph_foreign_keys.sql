-- Fix Tachograph Foreign Key Relationships
-- This script ensures proper foreign key constraints are set up

-- First, let's check what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'tachograph_%';

-- Check current foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name LIKE 'tachograph_%';

-- Drop existing tachograph_records table if it exists (to recreate with proper FKs)
DROP TABLE IF EXISTS public.tachograph_records CASCADE;
DROP TABLE IF EXISTS public.tachograph_folders CASCADE;
DROP TABLE IF EXISTS public.tachograph_card_readers CASCADE;
DROP TABLE IF EXISTS public.tachograph_download_sessions CASCADE;

-- Recreate tachograph_records table with proper foreign keys
CREATE TABLE public.tachograph_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  driver_id UUID,
  vehicle_id UUID,
  record_date DATE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  activity_type TEXT CHECK (activity_type IN ('driving', 'rest', 'break', 'other_work', 'availability', 'poa')),
  distance_km DECIMAL(10,2),
  start_location TEXT,
  end_location TEXT,
  speed_data JSONB,
  violations TEXT[],
  card_type TEXT CHECK (card_type IN ('driver', 'company', 'workshop', 'control')),
  card_number TEXT,
  download_method TEXT CHECK (download_method IN ('manual', 'automatic', 'remote')),
  download_timestamp TIMESTAMP WITH TIME ZONE,
  equipment_serial_number TEXT,
  calibration_date DATE,
  next_calibration_date DATE,
  data_quality_score INTEGER CHECK (data_quality_score >= 0 AND data_quality_score <= 100),
  is_complete BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.tachograph_records 
ADD CONSTRAINT fk_tachograph_records_organization 
FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.tachograph_records 
ADD CONSTRAINT fk_tachograph_records_driver 
FOREIGN KEY (driver_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.tachograph_records 
ADD CONSTRAINT fk_tachograph_records_vehicle 
FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE SET NULL;

-- Create tachograph_folders table
CREATE TABLE public.tachograph_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  name TEXT NOT NULL,
  parent_folder_id UUID,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add foreign key constraints for folders
ALTER TABLE public.tachograph_folders 
ADD CONSTRAINT fk_tachograph_folders_organization 
FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.tachograph_folders 
ADD CONSTRAINT fk_tachograph_folders_parent 
FOREIGN KEY (parent_folder_id) REFERENCES public.tachograph_folders(id) ON DELETE CASCADE;

ALTER TABLE public.tachograph_folders 
ADD CONSTRAINT fk_tachograph_folders_created_by 
FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Create tachograph_card_readers table
CREATE TABLE public.tachograph_card_readers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  device_name TEXT NOT NULL,
  device_type TEXT CHECK (device_type IN ('digivu_plus', 'generation_2', 'bluetooth_reader', 'usb_reader')),
  serial_number TEXT UNIQUE,
  firmware_version TEXT,
  status TEXT CHECK (status IN ('active', 'inactive', 'maintenance', 'calibration_due')),
  last_calibration_date DATE,
  next_calibration_due DATE,
  connection_type TEXT CHECK (connection_type IN ('usb', 'bluetooth', 'wifi')),
  battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100),
  signal_strength INTEGER CHECK (signal_strength >= 0 AND signal_strength <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add foreign key constraint for card readers
ALTER TABLE public.tachograph_card_readers 
ADD CONSTRAINT fk_tachograph_card_readers_organization 
FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Create tachograph_download_sessions table
CREATE TABLE public.tachograph_download_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  card_reader_id UUID,
  card_type TEXT CHECK (card_type IN ('driver', 'vehicle', 'workshop')),
  card_number TEXT,
  download_status TEXT CHECK (download_status IN ('in_progress', 'completed', 'failed', 'partial')),
  download_start_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  download_end_time TIMESTAMP WITH TIME ZONE,
  records_downloaded INTEGER DEFAULT 0,
  errors_encountered INTEGER DEFAULT 0,
  download_method TEXT CHECK (download_method IN ('card_reader', 'bluetooth', 'remote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add foreign key constraints for download sessions
ALTER TABLE public.tachograph_download_sessions 
ADD CONSTRAINT fk_tachograph_download_sessions_organization 
FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.tachograph_download_sessions 
ADD CONSTRAINT fk_tachograph_download_sessions_card_reader 
FOREIGN KEY (card_reader_id) REFERENCES public.tachograph_card_readers(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tachograph_records_organization_id ON public.tachograph_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_tachograph_records_driver_id ON public.tachograph_records(driver_id);
CREATE INDEX IF NOT EXISTS idx_tachograph_records_vehicle_id ON public.tachograph_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_tachograph_records_record_date ON public.tachograph_records(record_date);
CREATE INDEX IF NOT EXISTS idx_tachograph_folders_organization_id ON public.tachograph_folders(organization_id);
CREATE INDEX IF NOT EXISTS idx_tachograph_card_readers_organization_id ON public.tachograph_card_readers(organization_id);
CREATE INDEX IF NOT EXISTS idx_tachograph_download_sessions_organization_id ON public.tachograph_download_sessions(organization_id);

-- Enable Row Level Security
ALTER TABLE public.tachograph_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tachograph_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tachograph_card_readers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tachograph_download_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view tachograph records from their organization" ON public.tachograph_records
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert tachograph records to their organization" ON public.tachograph_records
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

-- Policies for other tables
CREATE POLICY "Users can manage tachograph folders in their organization" ON public.tachograph_folders
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can manage tachograph card readers in their organization" ON public.tachograph_card_readers
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can manage tachograph download sessions in their organization" ON public.tachograph_download_sessions
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER handle_tachograph_records_updated_at
  BEFORE UPDATE ON public.tachograph_records
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_tachograph_folders_updated_at
  BEFORE UPDATE ON public.tachograph_folders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_tachograph_card_readers_updated_at
  BEFORE UPDATE ON public.tachograph_card_readers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample data
DO $$
DECLARE
    org_id UUID;
    driver1_id UUID;
    driver2_id UUID;
    vehicle1_id UUID;
    vehicle2_id UUID;
    folder1_id UUID;
    card_reader_id UUID;
BEGIN
    -- Get organization and user IDs
    SELECT id INTO org_id FROM public.organizations LIMIT 1;
    SELECT id INTO driver1_id FROM public.profiles WHERE role = 'driver' LIMIT 1;
    SELECT id INTO driver2_id FROM public.profiles WHERE role = 'driver' LIMIT 1 OFFSET 1;
    SELECT id INTO vehicle1_id FROM public.vehicles LIMIT 1;
    SELECT id INTO vehicle2_id FROM public.vehicles LIMIT 1 OFFSET 1;
    
    -- Insert sample tachograph records
    INSERT INTO public.tachograph_records (
        organization_id, driver_id, vehicle_id, record_date, start_time, end_time,
        activity_type, distance_km, start_location, end_location, violations,
        card_type, card_number, download_method, data_quality_score, is_complete, notes
    ) VALUES 
    -- Sample record 1 - Clean record
    (
        org_id, driver1_id, vehicle1_id,
        CURRENT_DATE - INTERVAL '2 days',
        (CURRENT_DATE - INTERVAL '2 days')::date + INTERVAL '08:00:00',
        (CURRENT_DATE - INTERVAL '2 days')::date + INTERVAL '17:00:00',
        'driving', 180.5, 'London', 'Manchester',
        ARRAY[],
        'driver', 'DRIVER123456', 'manual', 98, true,
        'Daily driving record - clean'
    ),
    -- Sample record 2 - With violation
    (
        org_id, driver1_id, vehicle1_id,
        CURRENT_DATE - INTERVAL '1 day',
        (CURRENT_DATE - INTERVAL '1 day')::date + INTERVAL '09:00:00',
        (CURRENT_DATE - INTERVAL '1 day')::date + INTERVAL '18:00:00',
        'driving', 220.0, 'Birmingham', 'Leeds',
        ARRAY['speed_limit_exceeded', 'rest_period_violation'],
        'driver', 'DRIVER789012', 'automatic', 85, true,
        'Daily driving record - violations detected'
    ),
    -- Sample record 3 - Current day
    (
        org_id, driver2_id, vehicle2_id,
        CURRENT_DATE,
        CURRENT_DATE::date + INTERVAL '07:30:00',
        CURRENT_DATE::date + INTERVAL '16:30:00',
        'driving', 150.0, 'Liverpool', 'Sheffield',
        ARRAY['rest_period_violation'],
        'driver', 'DRIVER345678', 'remote', 92, true,
        'Current day record - minor violation'
    ),
    -- Sample record 4 - Different driver
    (
        org_id, driver2_id, vehicle2_id,
        CURRENT_DATE - INTERVAL '3 days',
        (CURRENT_DATE - INTERVAL '3 days')::date + INTERVAL '06:00:00',
        (CURRENT_DATE - INTERVAL '3 days')::date + INTERVAL '15:00:00',
        'driving', 300.0, 'Edinburgh', 'Cardiff',
        ARRAY[],
        'driver', 'DRIVER901234', 'manual', 95, true,
        'Long distance journey - clean record'
    ),
    -- Sample record 5 - Company card
    (
        org_id, driver1_id, vehicle1_id,
        CURRENT_DATE - INTERVAL '4 days',
        (CURRENT_DATE - INTERVAL '4 days')::date + INTERVAL '10:00:00',
        (CURRENT_DATE - INTERVAL '4 days')::date + INTERVAL '19:00:00',
        'driving', 120.0, 'Newcastle', 'Bristol',
        ARRAY['speed_limit_exceeded'],
        'company', 'COMPANY567890', 'automatic', 88, true,
        'Company vehicle record'
    );

    -- Insert sample folders
    INSERT INTO public.tachograph_folders (organization_id, name, created_by) VALUES
    (org_id, '2024', driver1_id),
    (org_id, 'Q1', driver1_id),
    (org_id, 'Q2', driver1_id),
    (org_id, 'Q3', driver1_id),
    (org_id, 'Q4', driver1_id)
    RETURNING id INTO folder1_id;

    -- Insert sample card reader
    INSERT INTO public.tachograph_card_readers (
        organization_id, device_name, device_type, serial_number,
        firmware_version, status, connection_type, battery_level, signal_strength
    ) VALUES (
        org_id, 'DigiVu Plus Reader', 'digivu_plus', 'DVP001234',
        'v2.1.5', 'active', 'usb', 85, 95
    ) RETURNING id INTO card_reader_id;

    -- Insert sample download session
    INSERT INTO public.tachograph_download_sessions (
        organization_id, card_reader_id, card_type, card_number,
        download_status, records_downloaded, download_method
    ) VALUES (
        org_id, card_reader_id, 'driver', 'DRIVER123456',
        'completed', 5, 'card_reader'
    );

    RAISE NOTICE 'Sample data inserted successfully';
END $$;

-- Verify the setup
SELECT 
    'tachograph_records' as table_name,
    COUNT(*) as record_count
FROM public.tachograph_records
UNION ALL
SELECT 
    'tachograph_folders' as table_name,
    COUNT(*) as record_count
FROM public.tachograph_folders
UNION ALL
SELECT 
    'tachograph_card_readers' as table_name,
    COUNT(*) as record_count
FROM public.tachograph_card_readers
UNION ALL
SELECT 
    'tachograph_download_sessions' as table_name,
    COUNT(*) as record_count
FROM public.tachograph_download_sessions;

-- Show foreign key relationships
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name LIKE 'tachograph_%';

-- Test a query with joins
SELECT 
    tr.id,
    tr.record_date,
    tr.activity_type,
    tr.distance_km,
    tr.violations,
    tr.card_type,
    tr.data_quality_score,
    p.first_name || ' ' || p.last_name as driver_name,
    v.vehicle_number,
    v.license_plate
FROM public.tachograph_records tr
LEFT JOIN public.profiles p ON tr.driver_id = p.id
LEFT JOIN public.vehicles v ON tr.vehicle_id = v.id
ORDER BY tr.record_date DESC
LIMIT 5;

