-- Insert sample invoices for testing
INSERT INTO public.invoices (
  organization_id,
  invoice_number,
  customer_name,
  customer_email,
  customer_address,
  service_type,
  description,
  subtotal,
  vat_rate,
  vat_amount,
  total_amount,
  status,
  issue_date,
  due_date,
  created_by
) 
SELECT 
  org.id,
  'INV-2024-001',
  'Elmwood Primary School',
  'admin@elmwood.edu',
  '123 School Lane, London, SW1A 1AA',
  'School Transport',
  'Daily school transport service for January 2024',
  4500.00,
  20.00,
  900.00,
  5400.00,
  'paid',
  '2024-01-01',
  '2024-01-31',
  prof.id
FROM public.organizations org
CROSS JOIN (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1) prof
LIMIT 1;

INSERT INTO public.invoices (
  organization_id,
  invoice_number,
  customer_name,
  customer_email,
  customer_address,
  service_type,
  description,
  subtotal,
  vat_rate,
  vat_amount,
  total_amount,
  status,
  issue_date,
  due_date,
  created_by
) 
SELECT 
  org.id,
  'INV-2024-002',
  'Sunset Care Home',
  'finance@sunsetcare.co.uk',
  '456 Care Street, Manchester, M1 2AB',
  'Medical Transport',
  'Medical appointment transport services',
  1800.00,
  20.00,
  360.00,
  2160.00,
  'pending',
  '2024-01-15',
  '2024-02-14',
  prof.id
FROM public.organizations org
CROSS JOIN (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1) prof
LIMIT 1;

-- Insert sample quotations for testing
INSERT INTO public.quotations (
  organization_id,
  quote_number,
  customer_name,
  contact_person,
  customer_email,
  customer_phone,
  customer_address,
  service_type,
  description,
  route_details,
  passengers,
  duration,
  frequency,
  base_amount,
  discount_amount,
  vat_rate,
  vat_amount,
  total_amount,
  status,
  priority,
  created_date,
  valid_until,
  expires_at,
  created_by
) 
SELECT 
  org.id,
  'QUO-2024-001',
  'St. Margaret''s Academy',
  'Mrs. Sarah Thompson',
  'sarah.thompson@stmargarets.edu',
  '+44 20 7123 4567',
  '456 Education Lane, London, SW2 3BC',
  'School Transport',
  'Daily school transport service for academic year 2024-2025',
  'Pickup from residential areas to school campus, 2 routes',
  45,
  '12 months',
  'Daily (Mon-Fri)',
  48000.00,
  2400.00,
  20.00,
  9120.00,
  54720.00,
  'pending',
  'high',
  '2024-01-05',
  '2024-02-05',
  '2024-02-05 23:59:59'::timestamptz,
  prof.id
FROM public.organizations org
CROSS JOIN (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1) prof
LIMIT 1;

INSERT INTO public.quotations (
  organization_id,
  quote_number,
  customer_name,
  contact_person,
  customer_email,
  customer_phone,
  customer_address,
  service_type,
  description,
  route_details,
  passengers,
  duration,
  frequency,
  base_amount,
  discount_amount,
  vat_rate,
  vat_amount,
  total_amount,
  status,
  priority,
  created_date,
  valid_until,
  expires_at,
  created_by
) 
SELECT 
  org.id,
  'QUO-2024-002',
  'Healthcare Solutions Ltd',
  'Dr. Michael Roberts',
  'michael.roberts@healthsolutions.co.uk',
  '+44 161 987 6543',
  '789 Medical Centre, Manchester, M2 4DE',
  'Medical Transport',
  'Patient transport for dialysis treatments',
  'Home to clinic transport, wheelchair accessible',
  8,
  '6 months',
  '3 times per week',
  15600.00,
  0.00,
  20.00,
  3120.00,
  18720.00,
  'accepted',
  'medium',
  '2024-01-12',
  '2024-02-12',
  '2024-02-12 23:59:59'::timestamptz,
  prof.id
FROM public.organizations org
CROSS JOIN (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1) prof
LIMIT 1;
