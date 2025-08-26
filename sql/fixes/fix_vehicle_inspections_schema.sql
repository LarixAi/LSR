-- Fix Vehicle Inspections Table Schema
-- Run this in your Supabase SQL Editor

-- Drop the existing table if it exists
DROP TABLE IF EXISTS vehicle_inspections CASCADE;

-- Create vehicle_inspections table with correct schema
CREATE TABLE vehicle_inspections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  inspection_type VARCHAR(50) NOT NULL,
  notes TEXT,
  signature_data TEXT,
  walkaround_data JSONB,
  location_data JSONB,
  defects_found BOOLEAN DEFAULT FALSE,
  overall_status VARCHAR(20) DEFAULT 'pending' CHECK (overall_status IN ('pending', 'passed', 'flagged', 'failed')),
  inspection_date DATE DEFAULT CURRENT_DATE,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE vehicle_inspections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view inspections for their organization" ON vehicle_inspections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = vehicle_inspections.driver_id
      AND p.organization_id = (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert inspections for their organization" ON vehicle_inspections
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = vehicle_inspections.driver_id
      AND p.organization_id = (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update inspections for their organization" ON vehicle_inspections
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = vehicle_inspections.driver_id
      AND p.organization_id = (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Create indexes
CREATE INDEX idx_vehicle_inspections_driver_id ON vehicle_inspections(driver_id);
CREATE INDEX idx_vehicle_inspections_vehicle_id ON vehicle_inspections(vehicle_id);
CREATE INDEX idx_vehicle_inspections_status ON vehicle_inspections(overall_status);
CREATE INDEX idx_vehicle_inspections_date ON vehicle_inspections(inspection_date);
CREATE INDEX idx_vehicle_inspections_type ON vehicle_inspections(inspection_type);

-- Grant permissions
GRANT ALL ON vehicle_inspections TO authenticated;

-- Insert sample data
INSERT INTO vehicle_inspections (driver_id, vehicle_id, inspection_type, notes, defects_found, overall_status, inspection_date)
SELECT 
  p.id as driver_id,
  v.id as vehicle_id,
  'daily_check' as inspection_type,
  'Daily pre-trip inspection completed successfully' as notes,
  false as defects_found,
  'passed' as overall_status,
  CURRENT_DATE - INTERVAL '1 day' as inspection_date
FROM profiles p
CROSS JOIN vehicles v
WHERE p.role = 'driver' 
AND p.organization_id = v.organization_id
LIMIT 3;

-- Insert more sample data with different statuses
INSERT INTO vehicle_inspections (driver_id, vehicle_id, inspection_type, notes, defects_found, overall_status, inspection_date)
SELECT 
  p.id as driver_id,
  v.id as vehicle_id,
  'pre_trip' as inspection_type,
  'Pre-trip inspection - minor issues noted' as notes,
  true as defects_found,
  'flagged' as overall_status,
  CURRENT_DATE as inspection_date
FROM profiles p
CROSS JOIN vehicles v
WHERE p.role = 'driver' 
AND p.organization_id = v.organization_id
LIMIT 2;

-- Insert failed inspection
INSERT INTO vehicle_inspections (driver_id, vehicle_id, inspection_type, notes, defects_found, overall_status, inspection_date)
SELECT 
  p.id as driver_id,
  v.id as vehicle_id,
  'post_trip' as inspection_type,
  'Post-trip inspection failed - major defects found' as notes,
  true as defects_found,
  'failed' as overall_status,
  CURRENT_DATE - INTERVAL '2 days' as inspection_date
FROM profiles p
CROSS JOIN vehicles v
WHERE p.role = 'driver' 
AND p.organization_id = v.organization_id
LIMIT 1;

-- Show the created data
SELECT 
  vi.id,
  vi.inspection_type,
  vi.overall_status,
  vi.defects_found,
  vi.inspection_date,
  p.first_name || ' ' || p.last_name as driver_name,
  v.license_plate,
  v.make || ' ' || v.model as vehicle_info
FROM vehicle_inspections vi
JOIN profiles p ON vi.driver_id = p.id
JOIN vehicles v ON vi.vehicle_id = v.id
ORDER BY vi.created_at DESC;


