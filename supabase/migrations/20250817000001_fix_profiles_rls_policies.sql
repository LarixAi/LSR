-- Fix profiles table RLS policies to prevent 400 errors for parent users
-- The current policies are too permissive and conflicting with existing secure policies

-- Drop the overly permissive policies that were created in the recent migration
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.profiles;

-- Ensure we have the correct, secure policies for profiles
-- Policy 1: Users can access their own profile (simple, no recursion)
DROP POLICY IF EXISTS "secure_users_own_profile_access" ON public.profiles;
CREATE POLICY "secure_users_own_profile_access" 
ON public.profiles 
FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 2: Service role access for system operations
DROP POLICY IF EXISTS "service_role_profiles_access" ON public.profiles;
CREATE POLICY "service_role_profiles_access" 
ON public.profiles 
FOR ALL
TO service_role
USING (true);

-- Policy 3: Allow authenticated users to create their own profile
DROP POLICY IF EXISTS "secure_profile_creation" ON public.profiles;
CREATE POLICY "secure_profile_creation" 
ON public.profiles 
FOR INSERT
TO authenticated  
WITH CHECK (auth.uid() = id);

-- Policy 4: Admin access using security definer function to avoid recursion
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid()
        AND raw_user_meta_data->>'role' IN ('admin', 'super_admin', 'council')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create a safe admin policy using the function
DROP POLICY IF EXISTS "admin_profile_management" ON public.profiles;
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

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Log the fix
INSERT INTO public.audit_logs (action, table_name, user_id, organization_id, new_values)
VALUES (
  'FIX_PROFILES_RLS', 
  'profiles', 
  auth.uid(),
  NULL,
  '{"description": "Fixed profiles RLS policies to prevent 400 errors for parent users", "issue": "profiles_rls_conflict"}'::jsonb
);
