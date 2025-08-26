-- Insert sample vehicle inspections for testing
INSERT INTO public.vehicle_inspections (
  organization_id,
  vehicle_id,
  driver_id,
  inspection_date,
  inspection_type,
  status,
  inspector_name,
  inspector_id,
  inspection_notes,
  defects_found,
  compliance_score,
  next_inspection_date,
  inspection_location,
  weather_conditions,
  vehicle_mileage,
  fuel_level,
  oil_level,
  tire_condition,
  brake_condition,
  lights_condition,
  emergency_equipment,
  created_by
) 
SELECT 
  org.id,
  v.id,
  prof.id,
  '2024-01-15',
  'daily',
  'passed',
  'John Smith',
  prof.id,
  'All systems functioning properly. Vehicle ready for service.',
  ARRAY['Minor scratch on passenger door'],
  95,
  '2024-01-16',
  'Depot Yard A',
  'Clear',
  125000,
  '3/4',
  'Good',
  'Good',
  'Good',
  'All working',
  ARRAY['First Aid Kit', 'Fire Extinguisher', 'Warning Triangle'],
  prof.id
FROM public.organizations org
CROSS JOIN (SELECT id FROM public.vehicles LIMIT 1) v
CROSS JOIN (SELECT id FROM public.profiles WHERE role = 'driver' LIMIT 1) prof
LIMIT 1;

INSERT INTO public.vehicle_inspections (
  organization_id,
  vehicle_id,
  driver_id,
  inspection_date,
  inspection_type,
  status,
  inspector_name,
  inspector_id,
  inspection_notes,
  defects_found,
  compliance_score,
  next_inspection_date,
  inspection_location,
  weather_conditions,
  vehicle_mileage,
  fuel_level,
  oil_level,
  tire_condition,
  brake_condition,
  lights_condition,
  emergency_equipment,
  created_by
) 
SELECT 
  org.id,
  v.id,
  prof.id,
  '2024-01-14',
  'weekly',
  'passed',
  'Sarah Johnson',
  prof.id,
  'Weekly inspection completed. Minor maintenance required.',
  ARRAY['Low tire pressure on rear left', 'Wiper blade needs replacement'],
  88,
  '2024-01-21',
  'Maintenance Bay 3',
  'Rainy',
  124500,
  '1/2',
  'Good',
  'Good',
  'Needs attention',
  'All working',
  ARRAY['First Aid Kit', 'Fire Extinguisher', 'Warning Triangle', 'Spare Tire'],
  prof.id
FROM public.organizations org
CROSS JOIN (SELECT id FROM public.vehicles LIMIT 1) v
CROSS JOIN (SELECT id FROM public.profiles WHERE role = 'driver' LIMIT 1) prof
LIMIT 1;

-- Insert sample tachograph records for testing
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
  speed_data,
  violations,
  card_type,
  card_number,
  download_method,
  equipment_serial_number,
  data_quality_score,
  is_complete,
  notes
) 
SELECT 
  org.id,
  prof.id,
  v.id,
  '2024-01-15',
  '2024-01-15 08:00:00+00',
  '2024-01-15 16:00:00+00',
  'driving',
  120.5,
  'London Depot',
  'Manchester Station',
  '{"max_speed": 85, "avg_speed": 65, "speed_violations": 0}',
  ARRAY[]::TEXT[],
  'driver',
  'DR123456789',
  'automatic',
  'TACH001234',
  98,
  true,
  'Normal driving day - no violations'
FROM public.organizations org
CROSS JOIN (SELECT id FROM public.profiles WHERE role = 'driver' LIMIT 1) prof
CROSS JOIN (SELECT id FROM public.vehicles LIMIT 1) v
LIMIT 1;

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
  speed_data,
  violations,
  card_type,
  card_number,
  download_method,
  equipment_serial_number,
  data_quality_score,
  is_complete,
  notes
) 
SELECT 
  org.id,
  prof.id,
  v.id,
  '2024-01-14',
  '2024-01-14 07:30:00+00',
  '2024-01-14 15:30:00+00',
  'driving',
  95.2,
  'Birmingham Depot',
  'Leeds Station',
  '{"max_speed": 78, "avg_speed": 62, "speed_violations": 1}',
  ARRAY['Speed limit exceeded by 3mph']::TEXT[],
  'driver',
  'DR987654321',
  'automatic',
  'TACH005678',
  95,
  true,
  'Minor speed violation noted'
FROM public.organizations org
CROSS JOIN (SELECT id FROM public.profiles WHERE role = 'driver' LIMIT 1) prof
CROSS JOIN (SELECT id FROM public.vehicles LIMIT 1) v
LIMIT 1;

-- Insert sample compliance violations for testing
INSERT INTO public.compliance_violations (
  organization_id,
  driver_id,
  vehicle_id,
  violation_type,
  violation_date,
  severity,
  description,
  status,
  penalty_amount,
  resolution_date,
  resolution_notes,
  regulatory_body,
  case_number,
  location,
  witnesses,
  corrective_actions,
  follow_up_required,
  risk_assessment_score,
  impact_on_operations,
  created_by
) 
SELECT 
  org.id,
  prof.id,
  v.id,
  'speed_limit',
  '2024-01-10',
  'medium',
  'Driver exceeded speed limit by 5mph in a 30mph zone',
  'resolved',
  150.00,
  '2024-01-12',
  'Driver completed speed awareness course. No further action required.',
  'Local Police',
  'SPEED-2024-001',
  'A1 Highway, London',
  ARRAY['Passenger on board', 'GPS tracking data'],
  ARRAY['Speed awareness course completed', 'Additional driver training scheduled'],
  false,
  6,
  'Minimal impact - driver back on duty after course completion',
  prof.id
FROM public.organizations org
CROSS JOIN (SELECT id FROM public.profiles WHERE role = 'driver' LIMIT 1) prof
CROSS JOIN (SELECT id FROM public.vehicles LIMIT 1) v
LIMIT 1;

INSERT INTO public.compliance_violations (
  organization_id,
  driver_id,
  vehicle_id,
  violation_type,
  violation_date,
  severity,
  description,
  status,
  penalty_amount,
  resolution_date,
  resolution_notes,
  regulatory_body,
  case_number,
  location,
  witnesses,
  corrective_actions,
  follow_up_required,
  risk_assessment_score,
  impact_on_operations,
  created_by
) 
SELECT 
  org.id,
  prof.id,
  v.id,
  'hours_of_service',
  '2024-01-08',
  'high',
  'Driver exceeded daily driving hours by 30 minutes',
  'investigating',
  500.00,
  NULL,
  'Under investigation by DVSA',
  'DVSA',
  'HOS-2024-002',
  'M6 Motorway, Birmingham',
  ARRAY['Tachograph data', 'GPS tracking'],
  ARRAY['Driver suspended pending investigation', 'Review of scheduling procedures'],
  true,
  8,
  'Driver temporarily suspended - route covered by relief driver',
  prof.id
FROM public.organizations org
CROSS JOIN (SELECT id FROM public.profiles WHERE role = 'driver' LIMIT 1) prof
CROSS JOIN (SELECT id FROM public.vehicles LIMIT 1) v
LIMIT 1;
