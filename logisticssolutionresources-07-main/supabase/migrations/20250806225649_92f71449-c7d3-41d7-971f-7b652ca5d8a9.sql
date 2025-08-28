-- Create core UK commercial vehicle document templates
INSERT INTO public.vehicle_document_templates (
  organization_id,
  name,
  description,
  is_mandatory,
  expiry_warning_days,
  renewal_frequency_days,
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
  30,
  null,
  '{}',
  'legal',
  true
),
(
  (SELECT id FROM public.organizations LIMIT 1),
  'MOT Certificate',
  'Annual roadworthiness test certificate required for commercial vehicles',
  true,
  30,
  365,
  '{}',
  'safety',
  true
),
(
  (SELECT id FROM public.organizations LIMIT 1),
  'Vehicle Insurance Certificate',
  'Comprehensive or third party insurance coverage certificate',
  true,
  14,
  365,
  '{}',
  'insurance',
  true
),
(
  (SELECT id FROM public.organizations LIMIT 1),
  'Operator''s Certificate',
  'O-License or Certificate of Professional Competence for commercial operation',
  true,
  60,
  1825,
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
  30,
  365,
  '{"hgv", "truck"}',
  'technical',
  true
),
(
  (SELECT id FROM public.organizations LIMIT 1),
  'Tachograph Calibration Certificate',
  'Digital tachograph calibration and compliance certificate',
  true,
  30,
  730,
  '{"coach", "bus", "hgv", "truck"}',
  'compliance',
  true
),
(
  (SELECT id FROM public.organizations LIMIT 1),
  'ADR Certificate',
  'Certificate for transport of dangerous goods by road',
  false,
  60,
  1825,
  '{"hgv", "truck"}',
  'specialized',
  true
),
(
  (SELECT id FROM public.organizations LIMIT 1),
  'Weight Certificate',
  'Official vehicle weight documentation and capacity certification',
  true,
  365,
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
  7,
  null,
  '{}',
  'safety',
  true
),
(
  (SELECT id FROM public.organizations LIMIT 1),
  'Service & Maintenance Records',
  'Complete service history and maintenance documentation',
  true,
  30,
  null,
  '{}',
  'maintenance',
  true
),
(
  (SELECT id FROM public.organizations LIMIT 1),
  'Defect Report',
  'Any identified vehicle defects and resolution documentation',
  false,
  0,
  null,
  '{}',
  'safety',
  true
),
(
  (SELECT id FROM public.organizations LIMIT 1),
  'Roadside Inspection Report',
  'DVSA roadside enforcement encounter reports',
  false,
  0,
  null,
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
  0,
  null,
  '{}',
  'operational',
  true
),
(
  (SELECT id FROM public.organizations LIMIT 1),
  'Route Allocation Certificate',
  'Routes and services the vehicle is certified to operate',
  false,
  30,
  365,
  '{"coach", "bus"}',
  'operational',
  true
),
(
  (SELECT id FROM public.organizations LIMIT 1),
  'Fuel Card Registration',
  'Fuel card assignment and consumption tracking documentation',
  false,
  30,
  365,
  '{}',
  'operational',
  true
);