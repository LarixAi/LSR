
-- Fix the infinite recursion issue in profiles table RLS policies
-- Drop all existing policies on profiles table to start fresh
DROP POLICY IF EXISTS "profiles_own_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_access" ON public.profiles;
DROP POLICY IF EXISTS "Drivers and admins can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;

-- Create simple, non-recursive policies using existing security definer functions
CREATE POLICY "profiles_own_access" ON public.profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "profiles_admin_access" ON public.profiles
    FOR ALL USING (public.is_admin_user(auth.uid()));

-- Update the user's employment status to 'active' since transport@transentrix.com should be an active admin
UPDATE public.profiles 
SET employment_status = 'active', 
    onboarding_status = 'completed'
WHERE email = 'transport@transentrix.com';

-- Also ensure any other admin emails are properly set up
UPDATE public.profiles 
SET employment_status = 'active', 
    onboarding_status = 'completed'
WHERE email IN (
    'transport@logisticssolutionresources.com',
    'admin@logisticssolutionresources.com'
) AND employment_status != 'active';
