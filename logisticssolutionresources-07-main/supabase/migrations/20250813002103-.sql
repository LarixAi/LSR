-- Fix RLS policies to prevent infinite recursion completely

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles; 
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Drop the problematic security definer functions
DROP FUNCTION IF EXISTS public.get_current_user_organization_safe();
DROP FUNCTION IF EXISTS public.get_current_user_role_safe();

-- Create simple, direct RLS policies without recursion
CREATE POLICY "profiles_select_own" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles  
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin policies using simple checks - no function calls
CREATE POLICY "profiles_admin_all" ON public.profiles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = auth.uid() 
    AND u.raw_user_meta_data->>'role' IN ('admin', 'super_admin', 'council')
  )
);