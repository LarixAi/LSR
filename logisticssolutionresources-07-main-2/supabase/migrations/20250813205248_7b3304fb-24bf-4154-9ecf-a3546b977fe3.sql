-- Create some test documents for the current organization
INSERT INTO public.documents (
  id, name, type, category, status, organization_id, 
  uploaded_by, file_size, file_path, related_entity_type,
  created_at, uploaded_at
) VALUES 
-- Sample driver documents
(
  gen_random_uuid(),
  'Driver License - John Smith',
  'PDF',
  'Driver Documents - License',
  'approved',
  '00000000-0000-0000-0000-000000000001',
  'bb8b0151-059a-4de1-8cf2-3ddc88807060',
  245760,
  'demo/driver-license-john-smith.pdf',
  'driver',
  now() - interval '5 days',
  now() - interval '5 days'
),
(
  gen_random_uuid(),
  'Vehicle Insurance Certificate',
  'PDF', 
  'Vehicle Documents - Insurance',
  'pending',
  '00000000-0000-0000-0000-000000000001',
  'bb8b0151-059a-4de1-8cf2-3ddc88807060',
  189432,
  'demo/vehicle-insurance.pdf',
  'vehicle',
  now() - interval '3 days',
  now() - interval '3 days'
),
(
  gen_random_uuid(),
  'MOT Certificate LSR001',
  'PDF',
  'Vehicle Documents - MOT',
  'expiring_soon',
  '00000000-0000-0000-0000-000000000001', 
  'bb8b0151-059a-4de1-8cf2-3ddc88807060',
  156890,
  'demo/mot-certificate-lsr001.pdf',
  'vehicle',
  now() - interval '2 days',
  now() - interval '2 days'
),
(
  gen_random_uuid(),
  'Safety Training Certificate',
  'PDF',
  'Compliance - Training Record',
  'approved',
  '00000000-0000-0000-0000-000000000001',
  'bb8b0151-059a-4de1-8cf2-3ddc88807060', 
  298765,
  'demo/safety-training.pdf',
  'compliance',
  now() - interval '1 day',
  now() - interval '1 day'
),
(
  gen_random_uuid(),
  'Route Risk Assessment',
  'DOCX',
  'Route Documents - Risk Assessment', 
  'rejected',
  '00000000-0000-0000-0000-000000000001',
  'bb8b0151-059a-4de1-8cf2-3ddc88807060',
  145690,
  'demo/route-risk-assessment.docx',
  'route',
  now() - interval '6 hours',
  now() - interval '6 hours'
);