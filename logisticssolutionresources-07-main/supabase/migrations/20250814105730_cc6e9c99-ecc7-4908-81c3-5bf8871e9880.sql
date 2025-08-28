-- Create an organization for National Bus Group
INSERT INTO public.organizations (
  id,
  name, 
  legal_name,
  email,
  phone,
  address,
  city,
  country,
  is_active,
  max_drivers,
  max_vehicles
) VALUES (
  gen_random_uuid(),
  'National Bus Group',
  'National Bus Group Ltd',
  'transport@nationalbusgroup.co.uk',
  '+44 20 1234 5678',
  '123 Transport House',
  'London',
  'UK',
  true,
  200,
  100
) RETURNING id;

-- Update the admin user's profile to be assigned to the organization
UPDATE public.profiles 
SET organization_id = (
  SELECT id FROM public.organizations 
  WHERE email = 'transport@nationalbusgroup.co.uk' 
  LIMIT 1
)
WHERE email = 'transport@nationalbusgroup.co.uk';