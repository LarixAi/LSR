-- Fix Mechanic Role and Access Issues
-- This script ensures the mechanic role is properly configured

-- First, let's check and fix Jimmy's role
UPDATE profiles 
SET 
  role = 'mechanic',
  first_name = 'Jimmy',
  last_name = 'Brick',
  updated_at = NOW()
WHERE email = 'laronelaing3@outlook.com';

-- Verify the mechanic role exists in the enum
DO $$ 
DECLARE
    role_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'mechanic' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    ) INTO role_exists;
    
    IF NOT role_exists THEN
        RAISE EXCEPTION 'mechanic role not found in user_role enum';
    END IF;
    
    RAISE NOTICE 'SUCCESS: mechanic role exists in user_role enum';
END $$;

-- Ensure mechanics table exists and has proper data
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
    AND p.role IN ('admin', 'council')
  )
);

-- Add Jimmy to mechanics table if not exists
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

-- Verify the setup
SELECT 'Updated Profile:' as info;
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
WHERE p.email = 'laronelaing3@outlook.com';

SELECT 'All Mechanic Profiles:' as info;
SELECT 
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  p.role,
  p.created_at
FROM profiles p
WHERE p.role = 'mechanic'
ORDER BY p.created_at DESC;
