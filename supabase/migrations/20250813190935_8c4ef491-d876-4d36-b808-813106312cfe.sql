-- Fix infinite recursion in profiles table RLS policies
-- This is blocking all profile access and authentication

-- Drop ALL problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "secure_admin_org_access" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_users_can_create_profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

-- Keep only the essential, non-recursive policies
-- Policy 1: Users can access their own profile (simple, no recursion)
-- This policy already exists and is safe: "secure_users_own_profile_access"

-- Policy 2: Service role access (safe, no recursion)
-- This policy already exists and is safe: "service_role_profiles_access"

-- Policy 3: Users can create their own profile (safe, no recursion)  
-- This policy already exists and is safe: "Allow users to insert their own profile"

-- Add a simple admin policy that doesn't cause recursion
-- Using a security definer function to avoid recursion
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

-- Ensure we have the basic policies needed for authentication to work
-- Check if the user own profile access policy exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'secure_users_own_profile_access'
    ) THEN
        CREATE POLICY "secure_users_own_profile_access" 
        ON public.profiles 
        FOR ALL
        TO authenticated
        USING (auth.uid() = id)
        WITH CHECK (auth.uid() = id);
    END IF;
END
$$;

-- Log the critical fix
INSERT INTO public.audit_logs (action, table_name, user_id, organization_id, new_values)
VALUES (
  'CRITICAL_FIX', 
  'profiles', 
  auth.uid(),
  NULL,
  '{"description": "Fixed infinite recursion in profiles table RLS policies that was blocking all authentication", "issue": "infinite_recursion_profiles_policies"}'::jsonb
);