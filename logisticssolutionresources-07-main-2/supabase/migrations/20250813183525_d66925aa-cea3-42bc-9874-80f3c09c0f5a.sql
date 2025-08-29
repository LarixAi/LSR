-- Fix infinite recursion in profiles RLS policies
-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Allow admin/council to view org profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;

-- Keep only essential, non-recursive policies
-- Users can view and update their own profile
DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "users_can_view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public.profiles;

-- Clean simple policies
CREATE POLICY "users_can_view_own_profile_safe" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "users_can_update_own_profile_safe" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Keep essential insert policies (already safe)
-- profiles_insert_own and Allow users to insert their own profile are safe

-- Log the fix
INSERT INTO public.security_audit_logs (
  user_id,
  event_type,
  event_details,
  severity,
  created_at
) VALUES (
  null,
  'profiles_policy_recursion_fix',
  jsonb_build_object(
    'description', 'Fixed infinite recursion in profiles RLS policies',
    'action', 'dropped_recursive_policies_created_safe_ones',
    'timestamp', now()
  ),
  'high',
  now()
);