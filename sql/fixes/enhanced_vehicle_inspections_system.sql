-- Enhanced Vehicle Inspections System
-- Run this in your Supabase SQL Editor

-- Drop existing tables if they exist
DROP TABLE IF EXISTS vehicle_inspections CASCADE;
DROP TABLE IF EXISTS inspection_schedules CASCADE;
DROP TABLE IF EXISTS inspection_templates CASCADE;

-- Create inspection templates table
CREATE TABLE inspection_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  inspection_type VARCHAR(50) NOT NULL,
  frequency_days INTEGER NOT NULL, -- 1 for daily, 7 for weekly, 28 for 4-weekly, 42 for 6-weekly
  is_active BOOLEAN DEFAULT TRUE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inspection schedules table for planned inspections
CREATE TABLE inspection_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES inspection_templates(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  assigned_driver_id UUID REFERENCES profiles(id),
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'overdue', 'cancelled')),
  notes TEXT,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enhanced vehicle_inspections table
CREATE TABLE vehicle_inspections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES inspection_schedules(id),
  inspection_type VARCHAR(50) NOT NULL,
  inspection_category VARCHAR(50) NOT NULL, -- daily, weekly, 4_weekly, 6_weekly, pre_trip, post_trip, breakdown
  notes TEXT,
  signature_data TEXT,
  walkaround_data JSONB,
  location_data JSONB,
  defects_found BOOLEAN DEFAULT FALSE,
  defects_details JSONB,
  overall_status VARCHAR(20) DEFAULT 'pending' CHECK (overall_status IN ('pending', 'passed', 'flagged', 'failed')),
  inspection_date DATE DEFAULT CURRENT_DATE,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  next_inspection_date DATE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE inspection_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_inspections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for inspection_templates
CREATE POLICY "Users can view templates for their organization" ON inspection_templates
  FOR SELECT USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert templates for their organization" ON inspection_templates
  FOR INSERT WITH CHECK (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update templates for their organization" ON inspection_templates
  FOR UPDATE USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Create RLS policies for inspection_schedules
CREATE POLICY "Users can view schedules for their organization" ON inspection_schedules
  FOR SELECT USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert schedules for their organization" ON inspection_schedules
  FOR INSERT WITH CHECK (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update schedules for their organization" ON inspection_schedules
  FOR UPDATE USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Create RLS policies for vehicle_inspections
CREATE POLICY "Users can view inspections for their organization" ON vehicle_inspections
  FOR SELECT USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert inspections for their organization" ON vehicle_inspections
  FOR INSERT WITH CHECK (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update inspections for their organization" ON vehicle_inspections
  FOR UPDATE USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Create indexes
CREATE INDEX idx_inspection_templates_org ON inspection_templates(organization_id);
CREATE INDEX idx_inspection_schedules_vehicle ON inspection_schedules(vehicle_id);
CREATE INDEX idx_inspection_schedules_date ON inspection_schedules(scheduled_date);
CREATE INDEX idx_inspection_schedules_status ON inspection_schedules(status);
CREATE INDEX idx_vehicle_inspections_vehicle ON vehicle_inspections(vehicle_id);
CREATE INDEX idx_vehicle_inspections_driver ON vehicle_inspections(driver_id);
CREATE INDEX idx_vehicle_inspections_date ON vehicle_inspections(inspection_date);
CREATE INDEX idx_vehicle_inspections_category ON vehicle_inspections(inspection_category);
CREATE INDEX idx_vehicle_inspections_status ON vehicle_inspections(overall_status);

-- Grant permissions
GRANT ALL ON inspection_templates TO authenticated;
GRANT ALL ON inspection_schedules TO authenticated;
GRANT ALL ON vehicle_inspections TO authenticated;

-- Insert default inspection templates
INSERT INTO inspection_templates (name, description, inspection_type, frequency_days, organization_id)
SELECT 
  'Daily Vehicle Check',
  'Daily pre-trip inspection checklist',
  'daily_check',
  1,
  o.id
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM inspection_templates WHERE organization_id = o.id AND inspection_type = 'daily_check');

INSERT INTO inspection_templates (name, description, inspection_type, frequency_days, organization_id)
SELECT 
  'Weekly Safety Inspection',
  'Weekly comprehensive safety check',
  'weekly',
  7,
  o.id
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM inspection_templates WHERE organization_id = o.id AND inspection_type = 'weekly');

INSERT INTO inspection_templates (name, description, inspection_type, frequency_days, organization_id)
SELECT 
  '4-Weekly Maintenance Check',
  '4-weekly detailed maintenance inspection',
  '4_weekly',
  28,
  o.id
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM inspection_templates WHERE organization_id = o.id AND inspection_type = '4_weekly');

INSERT INTO inspection_templates (name, description, inspection_type, frequency_days, organization_id)
SELECT 
  '6-Weekly Comprehensive Check',
  '6-weekly comprehensive vehicle inspection',
  '6_weekly',
  42,
  o.id
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM inspection_templates WHERE organization_id = o.id AND inspection_type = '6_weekly');

-- Insert sample inspection schedules
INSERT INTO inspection_schedules (vehicle_id, template_id, scheduled_date, assigned_driver_id, status, organization_id)
SELECT 
  v.id,
  t.id,
  CURRENT_DATE + INTERVAL '1 day',
  p.id,
  'scheduled',
  v.organization_id
FROM vehicles v
CROSS JOIN inspection_templates t
CROSS JOIN profiles p
WHERE v.organization_id = t.organization_id
AND p.organization_id = v.organization_id
AND p.role = 'driver'
AND t.inspection_type = 'daily_check'
AND NOT EXISTS (SELECT 1 FROM inspection_schedules WHERE vehicle_id = v.id AND template_id = t.id AND scheduled_date = CURRENT_DATE + INTERVAL '1 day')
LIMIT 5;

-- Insert sample vehicle inspections
INSERT INTO vehicle_inspections (driver_id, vehicle_id, inspection_type, inspection_category, notes, defects_found, overall_status, inspection_date, organization_id)
SELECT 
  p.id,
  v.id,
  'daily_check',
  'daily',
  'Daily pre-trip inspection completed successfully',
  false,
  'passed',
  CURRENT_DATE - INTERVAL '1 day',
  v.organization_id
FROM profiles p
CROSS JOIN vehicles v
WHERE p.role = 'driver' 
AND p.organization_id = v.organization_id
LIMIT 3;

INSERT INTO vehicle_inspections (driver_id, vehicle_id, inspection_type, inspection_category, notes, defects_found, overall_status, inspection_date, organization_id)
SELECT 
  p.id,
  v.id,
  '4_weekly',
  '4_weekly',
  '4-weekly maintenance inspection - minor issues found',
  true,
  'flagged',
  CURRENT_DATE - INTERVAL '5 days',
  v.organization_id
FROM profiles p
CROSS JOIN vehicles v
WHERE p.role = 'driver' 
AND p.organization_id = v.organization_id
LIMIT 2;

INSERT INTO vehicle_inspections (driver_id, vehicle_id, inspection_type, inspection_category, notes, defects_found, overall_status, inspection_date, organization_id)
SELECT 
  p.id,
  v.id,
  '6_weekly',
  '6_weekly',
  '6-weekly comprehensive inspection - all systems operational',
  false,
  'passed',
  CURRENT_DATE - INTERVAL '10 days',
  v.organization_id
FROM profiles p
CROSS JOIN vehicles v
WHERE p.role = 'driver' 
AND p.organization_id = v.organization_id
LIMIT 2;

-- Show sample data
SELECT 
  'Templates' as table_name,
  name,
  inspection_type,
  frequency_days
FROM inspection_templates
UNION ALL
SELECT 
  'Schedules' as table_name,
  'Scheduled for ' || scheduled_date::text,
  status,
  NULL
FROM inspection_schedules
UNION ALL
SELECT 
  'Inspections' as table_name,
  inspection_category,
  overall_status,
  NULL
FROM vehicle_inspections;



