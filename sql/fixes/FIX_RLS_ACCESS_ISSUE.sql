-- Fix RLS Access Issue
-- Temporarily disable RLS to allow profile access

-- Disable RLS on profiles table
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Update user to admin role
UPDATE public.profiles 
SET 
  role = 'admin',
  employment_status = 'active',
  onboarding_status = 'completed',
  is_active = true,
  updated_at = now()
WHERE email = 'laronelaing1@outlook.com';

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'council')
  )
);

-- Verify the fix
SELECT 'User Profile After Fix:' as info;
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  is_active
FROM public.profiles 
WHERE email = 'laronelaing1@outlook.com';
