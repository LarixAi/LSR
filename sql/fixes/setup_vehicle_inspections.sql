-- Setup Vehicle Inspections Table and Sample Data
-- Run this in your Supabase SQL Editor

-- Create vehicle_inspections table if it doesn't exist
CREATE TABLE IF NOT EXISTS vehicle_inspections (
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
CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_driver_id ON vehicle_inspections(driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_vehicle_id ON vehicle_inspections(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_status ON vehicle_inspections(overall_status);
CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_date ON vehicle_inspections(inspection_date);

-- Grant permissions
GRANT ALL ON vehicle_inspections TO authenticated;

-- Insert sample data (only if table is empty)
INSERT INTO vehicle_inspections (driver_id, vehicle_id, inspection_type, notes, defects_found, overall_status, inspection_date)
SELECT 
  p.id as driver_id,
  v.id as vehicle_id,
  'daily_check' as inspection_type,
  'Daily pre-trip inspection completed' as notes,
  false as defects_found,
  'passed' as overall_status,
  CURRENT_DATE - INTERVAL '1 day' as inspection_date
FROM profiles p
CROSS JOIN vehicles v
WHERE p.role = 'driver' 
AND p.organization_id = v.organization_id
AND NOT EXISTS (SELECT 1 FROM vehicle_inspections)
LIMIT 5;

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
AND NOT EXISTS (SELECT 1 FROM vehicle_inspections WHERE inspection_date = CURRENT_DATE)
LIMIT 3;

-- Show sample data
SELECT 
  vi.id,
  vi.inspection_type,
  vi.overall_status,
  vi.inspection_date,
  p.first_name || ' ' || p.last_name as driver_name,
  v.license_plate
FROM vehicle_inspections vi
JOIN profiles p ON vi.driver_id = p.id
JOIN vehicles v ON vi.vehicle_id = v.id
LIMIT 10;



