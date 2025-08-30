-- Insert sample work orders for testing
INSERT INTO public.work_orders (
  organization_id,
  vehicle_id,
  assigned_mechanic_id,
  work_order_number,
  title,
  description,
  priority,
  status,
  work_type,
  estimated_hours,
  actual_hours,
  parts_required,
  labor_cost,
  parts_cost,
  total_cost,
  scheduled_date,
  started_date,
  completed_date,
  due_date,
  location,
  work_area,
  tools_required,
  safety_requirements,
  created_by
) 
SELECT 
  org.id,
  v.id,
  prof.id,
  'WO-2024-001',
  'Brake System Inspection and Maintenance',
  'Complete brake system inspection including pads, rotors, and fluid levels. Replace front brake pads if needed.',
  'high',
  'completed',
  'preventive',
  4.0,
  3.5,
  ARRAY['Front brake pads', 'Brake fluid']::TEXT[],
  140.00,
  85.50,
  225.50,
  '2024-01-15',
  '2024-01-15 09:00:00+00',
  '2024-01-15 12:30:00+00',
  '2024-01-16',
  'Maintenance Bay 1',
  'Brake System',
  ARRAY['Brake caliper tool', 'Torque wrench', 'Brake fluid tester']::TEXT[],
  ARRAY['Safety glasses', 'Gloves', 'Proper ventilation']::TEXT[],
  prof.id
FROM public.organizations org
CROSS JOIN (SELECT id FROM public.vehicles LIMIT 1) v
CROSS JOIN (SELECT id FROM public.profiles WHERE role = 'mechanic' LIMIT 1) prof
LIMIT 1;

INSERT INTO public.work_orders (
  organization_id,
  vehicle_id,
  assigned_mechanic_id,
  work_order_number,
  title,
  description,
  priority,
  status,
  work_type,
  estimated_hours,
  actual_hours,
  parts_required,
  labor_cost,
  parts_cost,
  total_cost,
  scheduled_date,
  due_date,
  location,
  work_area,
  tools_required,
  safety_requirements,
  created_by
) 
SELECT 
  org.id,
  v.id,
  prof.id,
  'WO-2024-002',
  'Engine Oil Change and Filter Replacement',
  'Standard oil change with synthetic oil and new oil filter. Check all fluid levels.',
  'medium',
  'open',
  'preventive',
  1.5,
  NULL,
  ARRAY['Synthetic oil 5W-30', 'Oil filter', 'Air filter']::TEXT[],
  NULL,
  NULL,
  NULL,
  '2024-01-20',
  '2024-01-22',
  'Maintenance Bay 2',
  'Engine Bay',
  ARRAY['Oil filter wrench', 'Drain pan', 'Funnel']::TEXT[],
  ARRAY['Safety glasses', 'Gloves']::TEXT[],
  prof.id
FROM public.organizations org
CROSS JOIN (SELECT id FROM public.vehicles LIMIT 1) v
CROSS JOIN (SELECT id FROM public.profiles WHERE role = 'mechanic' LIMIT 1) prof
LIMIT 1;

-- Insert sample defect reports for testing
INSERT INTO public.defect_reports (
  organization_id,
  vehicle_id,
  reported_by,
  defect_type,
  description,
  severity,
  status,
  location,
  component_affected,
  estimated_repair_cost,
  actual_repair_cost,
  reported_date,
  investigation_notes,
  resolution_notes,
  parts_used,
  labor_hours
) 
SELECT 
  org.id,
  v.id,
  prof.id,
  'mechanical',
  'Unusual grinding noise from front left wheel during braking. Brake pads appear to be worn down to metal.',
  'high',
  'resolved',
  'Front left wheel',
  'Brake system',
  150.00,
  145.00,
  '2024-01-10',
  'Confirmed brake pad wear. Metal-on-metal contact detected. Immediate replacement required.',
  'Replaced front brake pads and rotors. System tested and working properly.',
  ARRAY['Front brake pads', 'Brake rotors']::TEXT[],
  2.5
FROM public.organizations org
CROSS JOIN (SELECT id FROM public.vehicles LIMIT 1) v
CROSS JOIN (SELECT id FROM public.profiles WHERE role = 'driver' LIMIT 1) prof
LIMIT 1;

INSERT INTO public.defect_reports (
  organization_id,
  vehicle_id,
  reported_by,
  defect_type,
  description,
  severity,
  status,
  location,
  component_affected,
  estimated_repair_cost,
  reported_date,
  investigation_notes
) 
SELECT 
  org.id,
  v.id,
  prof.id,
  'electrical',
  'Dashboard warning light for low tire pressure. All tires show normal pressure when checked manually.',
  'medium',
  'investigating',
  'Dashboard',
  'Tire pressure monitoring system',
  75.00,
  '2024-01-18',
  'TPMS sensor may be faulty. Need to check sensor connections and replace if necessary.'
FROM public.organizations org
CROSS JOIN (SELECT id FROM public.vehicles LIMIT 1) v
CROSS JOIN (SELECT id FROM public.profiles WHERE role = 'driver' LIMIT 1) prof
LIMIT 1;

-- Insert sample parts inventory for testing
INSERT INTO public.parts_inventory (
  organization_id,
  part_number,
  part_name,
  description,
  category,
  manufacturer,
  supplier,
  unit_cost,
  unit_price,
  current_stock,
  minimum_stock,
  maximum_stock,
  reorder_point,
  reorder_quantity,
  location,
  bin_location,
  condition,
  warranty_months,
  compatible_vehicles,
  created_by
) 
SELECT 
  org.id,
  'BP-FRONT-001',
  'Front Brake Pads',
  'High-quality ceramic brake pads for front wheels. Compatible with most commercial vehicles.',
  'brakes',
  'Brembo',
  'AutoParts Plus',
  25.50,
  45.00,
  15,
  5,
  50,
  10,
  20,
  'Warehouse A',
  'A-12-3',
  'new',
  24,
  ARRAY['Mercedes Sprinter', 'Ford Transit', 'Iveco Daily']::TEXT[],
  prof.id
FROM public.organizations org
CROSS JOIN (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1) prof
LIMIT 1;

INSERT INTO public.parts_inventory (
  organization_id,
  part_number,
  part_name,
  description,
  category,
  manufacturer,
  supplier,
  unit_cost,
  unit_price,
  current_stock,
  minimum_stock,
  maximum_stock,
  reorder_point,
  reorder_quantity,
  location,
  bin_location,
  condition,
  warranty_months,
  compatible_vehicles,
  created_by
) 
SELECT 
  org.id,
  'OIL-SYN-5W30',
  'Synthetic Engine Oil 5W-30',
  'High-performance synthetic engine oil. 5-liter containers.',
  'fluids',
  'Castrol',
  'Oil Supplies Ltd',
  18.75,
  32.00,
  25,
  10,
  100,
  15,
  30,
  'Warehouse B',
  'B-05-2',
  'new',
  12,
  ARRAY['All diesel engines', 'All petrol engines']::TEXT[],
  prof.id
FROM public.organizations org
CROSS JOIN (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1) prof
LIMIT 1;

INSERT INTO public.parts_inventory (
  organization_id,
  part_number,
  part_name,
  description,
  category,
  manufacturer,
  supplier,
  unit_cost,
  unit_price,
  current_stock,
  minimum_stock,
  maximum_stock,
  reorder_point,
  reorder_quantity,
  location,
  bin_location,
  condition,
  warranty_months,
  compatible_vehicles,
  created_by
) 
SELECT 
  org.id,
  'FILTER-OIL-001',
  'Oil Filter',
  'Premium oil filter for commercial vehicles. High filtration efficiency.',
  'engine',
  'Mann Filter',
  'Filter Solutions',
  8.50,
  15.00,
  8,
  5,
  30,
  8,
  15,
  'Warehouse A',
  'A-08-1',
  'new',
  12,
  ARRAY['Mercedes Sprinter', 'Ford Transit']::TEXT[],
  prof.id
FROM public.organizations org
CROSS JOIN (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1) prof
LIMIT 1;
