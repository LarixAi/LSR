-- Insert the actual form documents that exist in public/forms
INSERT INTO documents (
  id,
  name,
  file_path,
  file_size,
  type,
  category,
  description,
  status,
  organization_id,
  uploaded_by,
  uploaded_at,
  created_at,
  updated_at
) VALUES 
-- DBS Check Form
(
  gen_random_uuid(),
  'DBS Check Application Form',
  '/forms/dbs-check-form.pdf',
  2400,
  'PDF',
  'Forms - Employment',
  'Official DBS (Disclosure and Barring Service) check application form for employment screening. Includes sections for personal details, 5-year address history, position details, identity verification, and applicant declaration.',
  'approved',
  '00000000-0000-0000-0000-000000000001',
  'bb8b0151-059a-4de1-8cf2-3ddc88807060',
  NOW(),
  NOW(),
  NOW()
),
-- Right to Work Check Form  
(
  gen_random_uuid(),
  'Right to Work Check Form',
  '/forms/right-to-work-check-form.pdf',
  2200,
  'PDF',
  'Forms - Employment',
  'UK Right to Work verification form for employers. Documents acceptable identification, work restrictions, and employee eligibility verification including passport, birth certificate, biometric residence permit options.',
  'approved',
  '00000000-0000-0000-0000-000000000001',
  'bb8b0151-059a-4de1-8cf2-3ddc88807060',
  NOW(),
  NOW(),
  NOW()
),
-- Driver Application Form
(
  gen_random_uuid(),
  'Driver Application Form',
  '/forms/driver-application-form.pdf',
  2500,
  'PDF',
  'Forms - Driver',
  'Complete driver employment application form including personal information, driving license details, employment history, references, and declaration sections for professional driver positions.',
  'approved',
  '00000000-0000-0000-0000-000000000001',
  'bb8b0151-059a-4de1-8cf2-3ddc88807060',
  NOW(),
  NOW(),
  NOW()
),
-- Driver License Check Form
(
  gen_random_uuid(),
  'Driver License Check Form',
  '/forms/driver-license-check-form.pdf',
  1800,
  'PDF',
  'Forms - Driver',
  'DVLA driver license verification form for employers. Includes license verification checklist, endorsement tracking, and validation requirements for commercial driver employment.',
  'approved',
  '00000000-0000-0000-0000-000000000001',
  'bb8b0151-059a-4de1-8cf2-3ddc88807060',
  NOW(),
  NOW(),
  NOW()
),
-- Bank Details Form
(
  gen_random_uuid(),
  'Employee Bank Details Form',
  '/forms/bank-details-form.pdf',
  2000,
  'PDF',
  'Forms - Payroll',
  'Employee bank account details form for payroll setup. Includes account holder information, bank details, sort codes, IBAN/BIC codes for international accounts, and HR processing section.',
  'approved',
  '00000000-0000-0000-0000-000000000001',
  'bb8b0151-059a-4de1-8cf2-3ddc88807060',
  NOW(),
  NOW(),
  NOW()
),
-- Company Policy Document
(
  gen_random_uuid(),
  'Company Driver Policy',
  '/forms/company-policy.pdf',
  3500,
  'PDF',
  'Policies - Driver',
  'Comprehensive company driver policy document outlining driver conduct, vehicle safety requirements, driving standards, hours of service, customer service expectations, prohibited activities, documentation requirements, and disciplinary procedures.',
  'approved',
  '00000000-0000-0000-0000-000000000001',
  'bb8b0151-059a-4de1-8cf2-3ddc88807060',
  NOW(),
  NOW(),
  NOW()
);