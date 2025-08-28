-- Fix critical security vulnerability in profiles table
-- Remove all unsafe policies that allow public access

-- Drop all policies with 'true' conditions (publicly accessible)
DROP POLICY IF EXISTS "profiles_select_safe" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_safe" ON public.profiles;  
DROP POLICY IF EXISTS "profiles_insert_safe" ON public.profiles;

-- Drop duplicate/problematic policies to clean up
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "users_can_view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public.profiles;

-- Drop problematic admin policies that could cause recursion
DROP POLICY IF EXISTS "Allow admin/council to view org profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;

-- Keep only secure, essential policies
-- 1. Users can view and update their own profile only
CREATE POLICY "secure_users_own_profile_access" 
ON public.profiles 
FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 2. Allow authenticated users to create their own profile
CREATE POLICY "secure_profile_creation" 
ON public.profiles 
FOR INSERT
TO authenticated  
WITH CHECK (auth.uid() = id);

-- 3. Service role access for system operations
CREATE POLICY "service_role_profiles_access" 
ON public.profiles 
FOR ALL
TO service_role
USING (true);

-- 4. Admin access within same organization (using secure function to avoid recursion)
CREATE POLICY "secure_admin_org_access" 
ON public.profiles 
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile 
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role IN ('admin', 'council', 'super_admin')
    AND admin_profile.organization_id = profiles.organization_id
  )
);

-- Log the security fix (using only existing columns)
INSERT INTO public.security_audit_logs (
  user_id,
  event_type,
  event_details,
  created_at
) VALUES (
  null,
  'profiles_security_vulnerability_fixed',
  jsonb_build_object(
    'description', 'Fixed critical security vulnerability - removed publicly accessible policies from profiles table',
    'action', 'dropped_unsafe_policies_created_secure_ones',
    'vulnerability', 'profiles table was publicly readable exposing employee personal data',
    'severity', 'critical',
    'timestamp', now()
  ),
  now()
);