-- =====================================================
-- ADD SAMPLE CARD READERS
-- =====================================================

-- Insert sample card readers for testing
INSERT INTO public.tachograph_card_readers (
  id,
  organization_id,
  device_name,
  device_type,
  serial_number,
  firmware_version,
  status,
  last_calibration_date,
  next_calibration_due,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  (SELECT id FROM public.organizations LIMIT 1),
  'DigiVu Plus Reader',
  'digivu_plus',
  'DVP-2024-001',
  'v2.1.4',
  'active',
  '2024-01-15',
  '2025-01-15',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM public.organizations LIMIT 1),
  'USB Card Reader Pro',
  'usb_reader',
  'USB-2024-002',
  'v1.8.2',
  'active',
  '2024-02-20',
  '2025-02-20',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM public.organizations LIMIT 1),
  'Bluetooth Smart Reader',
  'bluetooth_reader',
  'BT-2024-003',
  'v2.0.1',
  'active',
  '2024-03-10',
  '2025-03-10',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM public.organizations LIMIT 1),
  'Generation 2 Reader',
  'generation_2',
  'GEN2-2024-004',
  'v3.2.0',
  'maintenance',
  '2024-01-05',
  '2025-01-05',
  NOW(),
  NOW()
)
ON CONFLICT (serial_number) DO NOTHING;

