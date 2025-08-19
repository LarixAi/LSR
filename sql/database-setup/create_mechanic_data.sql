-- Create Mechanic Data and Ensure Proper Role Setup
-- This script adds sample mechanic data and fixes role assignments

-- First, let's ensure we have the correct role for Jimmy Brick
UPDATE profiles 
SET 
  role = 'mechanic',
  first_name = 'Jimmy',
  last_name = 'Brick',
  updated_at = NOW()
WHERE email = 'laronelaing3@outlook.com';

-- Create sample mechanic data if it doesn't exist
INSERT INTO profiles (id, email, first_name, last_name, role, phone, address, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'jimmy.brick@transport.com',
  'Jimmy',
  'Brick',
  'mechanic',
  '+44 7123 456793',
  '123 Workshop Street, Anytown, AT1 2CD',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE email = 'jimmy.brick@transport.com'
);

-- Add another sample mechanic
INSERT INTO profiles (id, email, first_name, last_name, role, phone, address, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'sarah.mechanic@transport.com',
  'Sarah',
  'Johnson',
  'mechanic',
  '+44 7123 456794',
  '456 Garage Road, Anytown, AT3 4EF',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE email = 'sarah.mechanic@transport.com'
);

-- Create mechanics table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.mechanics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  specialization TEXT[],
  certifications TEXT[],
  experience_years INTEGER,
  hourly_rate DECIMAL(10,2),
  is_available BOOLEAN DEFAULT true,
  current_location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for mechanics table
ALTER TABLE public.mechanics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for mechanics
CREATE POLICY "Mechanics can view their own data" 
ON public.mechanics 
FOR SELECT 
USING (profile_id = auth.uid());

CREATE POLICY "Admins can manage all mechanics" 
ON public.mechanics 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND p.role = 'admin'
  )
);

-- Add mechanic records
INSERT INTO mechanics (profile_id, specialization, certifications, experience_years, hourly_rate, is_available)
SELECT 
  p.id,
  ARRAY['engine_repair', 'brake_systems', 'electrical'],
  ARRAY['ASE_Certified', 'HVAC_Certified'],
  8,
  45.00,
  true
FROM profiles p
WHERE p.email = 'laronelaing3@outlook.com'
AND NOT EXISTS (
  SELECT 1 FROM mechanics m WHERE m.profile_id = p.id
);

INSERT INTO mechanics (profile_id, specialization, certifications, experience_years, hourly_rate, is_available)
SELECT 
  p.id,
  ARRAY['transmission', 'suspension', 'diagnostics'],
  ARRAY['ASE_Certified', 'Transmission_Specialist'],
  12,
  50.00,
  true
FROM profiles p
WHERE p.email = 'jimmy.brick@transport.com'
AND NOT EXISTS (
  SELECT 1 FROM mechanics m WHERE m.profile_id = p.id
);

INSERT INTO mechanics (profile_id, specialization, certifications, experience_years, hourly_rate, is_available)
SELECT 
  p.id,
  ARRAY['body_repair', 'paint', 'welding'],
  ARRAY['I-CAR_Certified', 'Paint_Specialist'],
  6,
  40.00,
  true
FROM profiles p
WHERE p.email = 'sarah.mechanic@transport.com'
AND NOT EXISTS (
  SELECT 1 FROM mechanics m WHERE m.profile_id = p.id
);

-- Create trigger for updated_at
CREATE TRIGGER update_mechanics_updated_at
    BEFORE UPDATE ON public.mechanics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Verify the setup
SELECT 'Updated Profiles:' as info;
SELECT 
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  p.role,
  m.specialization,
  m.certifications,
  m.experience_years,
  m.hourly_rate
FROM profiles p
LEFT JOIN mechanics m ON p.id = m.profile_id
WHERE p.role = 'mechanic'
ORDER BY p.created_at DESC;

SELECT 'All Roles Summary:' as info;
SELECT 
  role,
  COUNT(*) as count
FROM profiles 
GROUP BY role
ORDER BY role;
