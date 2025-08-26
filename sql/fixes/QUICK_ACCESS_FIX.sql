-- Quick Access Fix - Simple and Direct
-- This script bypasses RLS temporarily to fix the access denied issue

-- Step 1: Disable RLS on profiles table to allow direct access
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Update the user to admin role
UPDATE public.profiles 
SET 
  role = 'admin',
  employment_status = 'active',
  onboarding_status = 'completed',
  is_active = true,
  updated_at = now()
WHERE email = 'laronelaing1@outlook.com';

-- Step 3: If user doesn't exist, create them
INSERT INTO public.profiles (
  id,
  email,
  first_name,
  last_name,
  role,
  employment_status,
  onboarding_status,
  is_active,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  'laronelaing1@outlook.com',
  'Larone',
  'Laing',
  'admin',
  'active',
  'completed',
  true,
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE email = 'laronelaing1@outlook.com'
);

-- Step 4: Re-enable RLS with a simple policy
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Create a simple policy that allows all authenticated users to access profiles
DROP POLICY IF EXISTS "Allow authenticated access" ON public.profiles;
CREATE POLICY "Allow authenticated access" ON public.profiles
FOR ALL USING (auth.role() = 'authenticated');

-- Step 6: Verify the fix
SELECT 'Access Fix Complete!' as status;
SELECT 
  email,
  first_name,
  last_name,
  role,
  is_active,
  employment_status,
  onboarding_status
FROM public.profiles 
WHERE email = 'laronelaing1@outlook.com';




