-- Enhanced Vehicle Inspection System Setup
-- This script creates the necessary database tables for the enhanced inspection system

-- 1. Drop existing tables if they exist (to avoid conflicts)
DROP TABLE IF EXISTS inspection_schedules CASCADE;
DROP TABLE IF EXISTS inspection_templates CASCADE;
DROP TABLE IF EXISTS vehicle_inspections CASCADE;

-- 2. Create inspection templates table
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

-- 3. Create inspection schedules table for planned inspections
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

-- 4. Create enhanced vehicle_inspections table
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

-- 5. Enable RLS on all tables
ALTER TABLE inspection_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_inspections ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for inspection_templates
CREATE POLICY "Users can view templates for their organization" ON inspection_templates
  FOR SELECT USING (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert templates for their organization" ON inspection_templates
  FOR INSERT WITH CHECK (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update templates for their organization" ON inspection_templates
  FOR UPDATE USING (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- 7. Create RLS policies for inspection_schedules
CREATE POLICY "Users can view schedules for their organization" ON inspection_schedules
  FOR SELECT USING (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert schedules for their organization" ON inspection_schedules
  FOR INSERT WITH CHECK (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update schedules for their organization" ON inspection_schedules
  FOR UPDATE USING (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- 8. Create RLS policies for vehicle_inspections
CREATE POLICY "Users can view inspections for their organization" ON vehicle_inspections
  FOR SELECT USING (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert inspections for their organization" ON vehicle_inspections
  FOR INSERT WITH CHECK (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update inspections for their organization" ON vehicle_inspections
  FOR UPDATE USING (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- 9. Create indexes for better performance
CREATE INDEX idx_inspection_templates_organization_id ON inspection_templates(organization_id);
CREATE INDEX idx_inspection_templates_type ON inspection_templates(inspection_type);
CREATE INDEX idx_inspection_templates_active ON inspection_templates(is_active);

CREATE INDEX idx_inspection_schedules_vehicle_id ON inspection_schedules(vehicle_id);
CREATE INDEX idx_inspection_schedules_template_id ON inspection_schedules(template_id);
CREATE INDEX idx_inspection_schedules_scheduled_date ON inspection_schedules(scheduled_date);
CREATE INDEX idx_inspection_schedules_status ON inspection_schedules(status);
CREATE INDEX idx_inspection_schedules_organization_id ON inspection_schedules(organization_id);

CREATE INDEX idx_vehicle_inspections_driver_id ON vehicle_inspections(driver_id);
CREATE INDEX idx_vehicle_inspections_vehicle_id ON vehicle_inspections(vehicle_id);
CREATE INDEX idx_vehicle_inspections_schedule_id ON vehicle_inspections(schedule_id);
CREATE INDEX idx_vehicle_inspections_status ON vehicle_inspections(overall_status);
CREATE INDEX idx_vehicle_inspections_date ON vehicle_inspections(inspection_date);
CREATE INDEX idx_vehicle_inspections_type ON vehicle_inspections(inspection_type);
CREATE INDEX idx_vehicle_inspections_category ON vehicle_inspections(inspection_category);
CREATE INDEX idx_vehicle_inspections_organization_id ON vehicle_inspections(organization_id);

-- 10. Grant permissions
GRANT ALL ON inspection_templates TO authenticated;
GRANT ALL ON inspection_schedules TO authenticated;
GRANT ALL ON vehicle_inspections TO authenticated;

-- 11. Insert default inspection templates
INSERT INTO inspection_templates (name, description, inspection_type, frequency_days, organization_id, created_by)
SELECT 
  'Daily Pre-Trip Inspection',
  'Standard daily pre-trip vehicle inspection checklist',
  'pre_trip',
  1,
  o.id,
  p.id
FROM organizations o
CROSS JOIN profiles p
WHERE p.role = 'admin'
AND p.organization_id = o.id
LIMIT 1;

INSERT INTO inspection_templates (name, description, inspection_type, frequency_days, organization_id, created_by)
SELECT 
  '4-Weekly Comprehensive Inspection',
  'Comprehensive vehicle inspection every 4 weeks',
  'comprehensive',
  28,
  o.id,
  p.id
FROM organizations o
CROSS JOIN profiles p
WHERE p.role = 'admin'
AND p.organization_id = o.id
LIMIT 1;

INSERT INTO inspection_templates (name, description, inspection_type, frequency_days, organization_id, created_by)
SELECT 
  '6-Weekly Safety Inspection',
  'Safety-focused inspection every 6 weeks',
  'safety',
  42,
  o.id,
  p.id
FROM organizations o
CROSS JOIN profiles p
WHERE p.role = 'admin'
AND p.organization_id = o.id
LIMIT 1;

-- 12. Insert sample inspection schedules
INSERT INTO inspection_schedules (vehicle_id, template_id, scheduled_date, assigned_driver_id, organization_id)
SELECT 
  v.id,
  t.id,
  CURRENT_DATE + INTERVAL '1 day',
  p.id,
  v.organization_id
FROM vehicles v
CROSS JOIN inspection_templates t
CROSS JOIN profiles p
WHERE p.role = 'driver'
AND p.organization_id = v.organization_id
AND t.organization_id = v.organization_id
AND t.inspection_type = 'pre_trip'
LIMIT 3;

-- 13. Insert sample vehicle inspections with enhanced data
INSERT INTO vehicle_inspections (
  driver_id, 
  vehicle_id, 
  inspection_type, 
  inspection_category, 
  notes, 
  walkaround_data,
  location_data,
  defects_found, 
  overall_status, 
  inspection_date,
  organization_id
)
SELECT
  p.id as driver_id,
  v.id as vehicle_id,
  'daily_check' as inspection_type,
  'daily' as inspection_category,
  'Daily pre-trip inspection completed successfully' as notes,
  jsonb_build_object(
    'questions', jsonb_build_array(
      jsonb_build_object(
        'id', '1',
        'question', 'Are all lights working properly?',
        'category', 'lights',
        'answer', 'pass',
        'notes', 'All lights functioning correctly',
        'timestamp', NOW()
      ),
      jsonb_build_object(
        'id', '2',
        'question', 'Are tires in good condition with proper pressure?',
        'category', 'tires',
        'answer', 'pass',
        'notes', 'Tire pressure checked and within range',
        'timestamp', NOW()
      ),
      jsonb_build_object(
        'id', '3',
        'question', 'Are brakes functioning properly?',
        'category', 'brakes',
        'answer', 'pass',
        'notes', 'Brake test completed successfully',
        'timestamp', NOW()
      )
    )
  ) as walkaround_data,
  jsonb_build_object(
    'latitude', 51.5074,
    'longitude', -0.1278,
    'accuracy', 5,
    'timestamp', NOW(),
    'address', 'London, UK'
  ) as location_data,
  false as defects_found,
  'passed' as overall_status,
  CURRENT_DATE as inspection_date,
  v.organization_id
FROM profiles p
CROSS JOIN vehicles v
WHERE p.role = 'driver'
AND p.organization_id = v.organization_id
LIMIT 2;

-- Insert a failed inspection for testing
INSERT INTO vehicle_inspections (
  driver_id, 
  vehicle_id, 
  inspection_type, 
  inspection_category, 
  notes, 
  walkaround_data,
  location_data,
  defects_found, 
  defects_details,
  overall_status, 
  inspection_date,
  organization_id
)
SELECT
  p.id as driver_id,
  v.id as vehicle_id,
  'pre_trip' as inspection_type,
  'daily' as inspection_category,
  'Pre-trip inspection failed - brake issues detected' as notes,
  jsonb_build_object(
    'questions', jsonb_build_array(
      jsonb_build_object(
        'id', '1',
        'question', 'Are all lights working properly?',
        'category', 'lights',
        'answer', 'pass',
        'notes', 'All lights functioning correctly',
        'timestamp', NOW()
      ),
      jsonb_build_object(
        'id', '2',
        'question', 'Are brakes functioning properly?',
        'category', 'brakes',
        'answer', 'fail',
        'notes', 'Brake pedal feels soft, requires immediate attention',
        'timestamp', NOW()
      ),
      jsonb_build_object(
        'id', '3',
        'question', 'Is engine running smoothly?',
        'category', 'engine',
        'answer', 'pass',
        'notes', 'Engine running normally',
        'timestamp', NOW()
      )
    )
  ) as walkaround_data,
  jsonb_build_object(
    'latitude', 51.5074,
    'longitude', -0.1278,
    'accuracy', 5,
    'timestamp', NOW(),
    'address', 'London, UK'
  ) as location_data,
  true as defects_found,
  jsonb_build_object(
    'description', 'Brake system failure detected',
    'items', jsonb_build_array('Soft brake pedal', 'Reduced braking power', 'Safety concern')
  ) as defects_details,
  'failed' as overall_status,
  CURRENT_DATE as inspection_date,
  v.organization_id
FROM profiles p
CROSS JOIN vehicles v
WHERE p.role = 'driver'
AND p.organization_id = v.organization_id
LIMIT 1;