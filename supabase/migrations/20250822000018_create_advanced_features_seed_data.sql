-- Insert sample vehicle check templates for testing
INSERT INTO public.vehicle_check_templates (
  organization_id,
  name,
  description,
  version,
  is_active,
  is_default,
  category,
  vehicle_types,
  required_checks,
  optional_checks,
  estimated_completion_time_minutes,
  safety_critical,
  compliance_required,
  compliance_standards,
  created_by
) 
SELECT 
  org.id,
  'Standard Pre-Trip Check',
  'Comprehensive pre-trip vehicle inspection checklist for all vehicle types',
  '1.0',
  true,
  true,
  'pre_trip',
  ARRAY['bus', 'minibus', 'coach', 'van']::TEXT[],
  15,
  8,
  10,
  true,
  true,
  ARRAY['DVSA', 'PSV']::TEXT[],
  prof.id
FROM public.organizations org
CROSS JOIN (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1) prof
LIMIT 1;

INSERT INTO public.vehicle_check_templates (
  organization_id,
  name,
  description,
  version,
  is_active,
  is_default,
  category,
  vehicle_types,
  required_checks,
  optional_checks,
  estimated_completion_time_minutes,
  safety_critical,
  compliance_required,
  compliance_standards,
  created_by
) 
SELECT 
  org.id,
  'Post-Trip Safety Check',
  'Post-trip inspection to ensure vehicle is safe for next use',
  '1.0',
  true,
  false,
  'post_trip',
  ARRAY['bus', 'minibus', 'coach', 'van']::TEXT[],
  8,
  5,
  5,
  true,
  true,
  ARRAY['DVSA']::TEXT[],
  prof.id
FROM public.organizations org
CROSS JOIN (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1) prof
LIMIT 1;

-- Insert sample vehicle check questions for the pre-trip template
INSERT INTO public.vehicle_check_questions (
  template_id,
  question_text,
  question_type,
  required,
  order_index,
  category,
  safety_critical,
  help_text
)
SELECT 
  template.id,
  'Are all lights working correctly?',
  'yes_no',
  true,
  1,
  'lights',
  true,
  'Check headlights, indicators, brake lights, and hazard lights'
FROM public.vehicle_check_templates template
WHERE template.name = 'Standard Pre-Trip Check'
LIMIT 1;

INSERT INTO public.vehicle_check_questions (
  template_id,
  question_text,
  question_type,
  required,
  order_index,
  category,
  safety_critical,
  help_text
)
SELECT 
  template.id,
  'Are tire pressures within recommended range?',
  'yes_no',
  true,
  2,
  'tires',
  true,
  'Check all tires including spare tire'
FROM public.vehicle_check_templates template
WHERE template.name = 'Standard Pre-Trip Check'
LIMIT 1;

INSERT INTO public.vehicle_check_questions (
  template_id,
  question_text,
  question_type,
  required,
  order_index,
  category,
  safety_critical,
  help_text
)
SELECT 
  template.id,
  'Is the engine oil level correct?',
  'yes_no',
  true,
  3,
  'engine',
  true,
  'Check oil level using dipstick when engine is cold'
FROM public.vehicle_check_templates template
WHERE template.name = 'Standard Pre-Trip Check'
LIMIT 1;

INSERT INTO public.vehicle_check_questions (
  template_id,
  question_text,
  question_type,
  required,
  order_index,
  category,
  safety_critical,
  help_text
)
SELECT 
  template.id,
  'Are brakes functioning properly?',
  'yes_no',
  true,
  4,
  'brakes',
  true,
  'Test brake pedal feel and check for any unusual noises'
FROM public.vehicle_check_templates template
WHERE template.name = 'Standard Pre-Trip Check'
LIMIT 1;

INSERT INTO public.vehicle_check_questions (
  template_id,
  question_text,
  question_type,
  required,
  order_index,
  category,
  safety_critical,
  help_text
)
SELECT 
  template.id,
  'Is the windshield washer fluid topped up?',
  'yes_no',
  false,
  5,
  'wipers',
  false,
  'Check washer fluid level and wiper operation'
FROM public.vehicle_check_templates template
WHERE template.name = 'Standard Pre-Trip Check'
LIMIT 1;

-- Insert sample rail replacement services for testing
INSERT INTO public.rail_replacement_services (
  organization_id,
  service_name,
  service_code,
  affected_line,
  service_type,
  priority,
  status,
  start_date,
  end_date,
  start_time,
  end_time,
  frequency,
  vehicles_required,
  vehicles_assigned,
  passengers_affected,
  estimated_cost,
  rail_operator,
  operator_contact,
  operator_phone,
  operator_email,
  special_requirements,
  route_details,
  pickup_locations,
  dropoff_locations,
  notes,
  created_by
) 
SELECT 
  org.id,
  'London Bridge - Victoria Rail Replacement',
  'RR-2024-001',
  'London Bridge to Victoria',
  'maintenance',
  'high',
  'active',
  '2024-01-15',
  '2024-01-20',
  '06:00:00',
  '23:00:00',
  'Every 15 minutes',
  8,
  6,
  2500,
  15000.00,
  'Southern Railway',
  'John Smith',
  '+44 20 7123 4567',
  'john.smith@southernrailway.co.uk',
  ARRAY['wheelchair accessible', 'air conditioning']::TEXT[],
  'Direct replacement service between London Bridge and Victoria stations',
  ARRAY['London Bridge Station', 'Elephant & Castle', 'Kennington']::TEXT[],
  ARRAY['Elephant & Castle', 'Kennington', 'Victoria Station']::TEXT[],
  'Emergency rail replacement service due to track maintenance. All vehicles must be wheelchair accessible.',
  prof.id
FROM public.organizations org
CROSS JOIN (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1) prof
LIMIT 1;

INSERT INTO public.rail_replacement_services (
  organization_id,
  service_name,
  service_code,
  affected_line,
  service_type,
  priority,
  status,
  start_date,
  end_date,
  start_time,
  end_time,
  frequency,
  vehicles_required,
  vehicles_assigned,
  passengers_affected,
  estimated_cost,
  rail_operator,
  operator_contact,
  operator_phone,
  operator_email,
  special_requirements,
  route_details,
  pickup_locations,
  dropoff_locations,
  notes,
  created_by
) 
SELECT 
  org.id,
  'Manchester Piccadilly - Airport Express',
  'RR-2024-002',
  'Manchester Piccadilly to Manchester Airport',
  'planned',
  'medium',
  'planned',
  '2024-02-01',
  '2024-02-03',
  '05:30:00',
  '00:30:00',
  'Every 30 minutes',
  12,
  0,
  1800,
  22000.00,
  'Northern Rail',
  'Sarah Johnson',
  '+44 161 987 6543',
  'sarah.johnson@northernrail.co.uk',
  ARRAY['luggage space', 'airport transfer']::TEXT[],
  'Express service between Manchester Piccadilly and Manchester Airport',
  ARRAY['Manchester Piccadilly', 'Manchester Oxford Road', 'Deansgate']::TEXT[],
  ARRAY['Manchester Oxford Road', 'Deansgate', 'Manchester Airport']::TEXT[],
  'Planned rail replacement service for track upgrades. Priority given to airport passengers.',
  prof.id
FROM public.organizations org
CROSS JOIN (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1) prof
LIMIT 1;
