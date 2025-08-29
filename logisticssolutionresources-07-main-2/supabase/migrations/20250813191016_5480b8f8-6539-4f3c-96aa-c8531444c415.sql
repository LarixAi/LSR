-- Fix the function search path issue by dropping and recreating both policy and function
DROP POLICY IF EXISTS "admin_profile_management" ON public.profiles;
DROP FUNCTION IF EXISTS public.is_current_user_admin() CASCADE;

-- Recreate the function with proper search path
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
STABLE
SET search_path = 'public'  -- Fix: Set explicit search path
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid()
        AND raw_user_meta_data->>'role' IN ('admin', 'super_admin', 'council')
    );
END;
$$;

-- Recreate the admin policy
CREATE POLICY "admin_profile_management" 
ON public.profiles 
FOR ALL
TO authenticated
USING (
  auth.uid() = id OR public.is_current_user_admin()
)
WITH CHECK (
  auth.uid() = id OR public.is_current_user_admin()
);