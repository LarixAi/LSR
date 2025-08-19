-- Create core UK commercial vehicle document templates
INSERT INTO public.vehicle_document_templates (
  organization_id,
  name,
  description,
  is_mandatory,
  requires_expiry,
  reminder_days_before_expiry,
  applicable_vehicle_types,
  category,
  is_active
) VALUES 
-- Core Registration & Legal Documents
(
  (SELECT id FROM public.organizations LIMIT 1),
  'V5C Registration Certificate',
  'Vehicle registration document (logbook) proving ownership and registration with DVLA',
  true,
  false,
  30,
  '{}',
  'legal',
  true
),
(
  (SELECT id FROM public.organizations LIMIT 1),
  'MOT Certificate',
  'Annual roadworthiness test certificate required for commercial vehicles',
  true,
  true,
  30,
  '{}',
  'safety',
  true
),
(
  (SELECT id FROM public.organizations LIMIT 1),
  'Vehicle Insurance Certificate',
  'Comprehensive or third party insurance coverage certificate',
  true,
  true,
  14,
  '{}',
  'insurance',
  true
),
(
  (SELECT id FROM public.organizations LIMIT 1),
  'Operator''s Certificate',
  'O-License or Certificate of Professional Competence for commercial operation',
  true,
  true,
  60,
  '{"coach", "bus", "hgv"}',
  'operational',
  true
),

-- Technical & Safety Certificates
(
  (SELECT id FROM public.organizations LIMIT 1),
  'Plating Certificate',
  'Weight and dimension certification for Heavy Goods Vehicles',
  true,
  true,
  30,
  '{"hgv", "truck"}',
  'technical',
  true
),
(
  (SELECT id FROM public.organizations LIMIT 1),
  'Tachograph Calibration Certificate',
  'Digital tachograph calibration and compliance certificate',
  true,
  true,
  30,
  '{"coach", "bus", "hgv", "truck"}',
  'compliance',
  true
),
(
  (SELECT id FROM public.organizations LIMIT 1),
  'ADR Certificate',
  'Certificate for transport of dangerous goods by road',
  false,
  true,
  60,
  '{"hgv", "truck"}',
  'specialized',
  true
),
(
  (SELECT id FROM public.organizations LIMIT 1),
  'Weight Certificate',
  'Official vehicle weight documentation and capacity certification',
  true,
  true,
  365,
  '{"hgv", "truck", "coach", "bus"}',
  'technical',
  true
),

-- Additional Safety & Compliance Documents
(
  (SELECT id FROM public.organizations LIMIT 1),
  'Vehicle Inspection Report',
  'Daily/weekly safety inspection checklist and report',
  true,
  false,
  7,
  '{}',
  'safety',
  true
),
(
  (SELECT id FROM public.organizations LIMIT 1),
  'Service & Maintenance Records',
  'Complete service history and maintenance documentation',
  true,
  false,
  30,
  '{}',
  'maintenance',
  true
),
(
  (SELECT id FROM public.organizations LIMIT 1),
  'Defect Report',
  'Any identified vehicle defects and resolution documentation',
  false,
  false,
  0,
  '{}',
  'safety',
  true
),
(
  (SELECT id FROM public.organizations LIMIT 1),
  'Roadside Inspection Report',
  'DVSA roadside enforcement encounter reports',
  false,
  false,
  0,
  '{}',
  'compliance',
  true
),

-- Operational Documents
(
  (SELECT id FROM public.organizations LIMIT 1),
  'Driver Assignment Record',
  'Documentation of drivers authorized to operate this vehicle',
  true,
  false,
  0,
  '{}',
  'operational',
  true
),
(
  (SELECT id FROM public.organizations LIMIT 1),
  'Route Allocation Certificate',
  'Routes and services the vehicle is certified to operate',
  false,
  true,
  30,
  '{"coach", "bus"}',
  'operational',
  true
),
(
  (SELECT id FROM public.organizations LIMIT 1),
  'Fuel Card Registration',
  'Fuel card assignment and consumption tracking documentation',
  false,
  true,
  30,
  '{}',
  'operational',
  true
);