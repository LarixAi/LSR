-- Fix infinite recursion in profiles RLS policies
-- Create security definer functions to avoid infinite recursion

-- Function to get current user's role and organization
CREATE OR REPLACE FUNCTION public.get_current_user_org_and_role()
RETURNS TABLE(organization_id UUID, role TEXT)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT p.organization_id, p.role::TEXT
  FROM public.profiles p
  WHERE p.id = auth.uid()
  LIMIT 1;
$$;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'council')
  );
$$;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Organization admins can manage organization profiles" ON public.profiles;
DROP POLICY IF EXISTS "Organization admins can view organization profiles" ON public.profiles;

-- Recreate policies using security definer functions
CREATE POLICY "Organization admins can manage organization profiles"
ON public.profiles
FOR ALL
TO public
USING (
  public.is_current_user_admin() 
  AND organization_id = (SELECT get_current_user_org_and_role().organization_id)
);

CREATE POLICY "Organization admins can view organization profiles"
ON public.profiles
FOR SELECT
TO public
USING (
  public.is_current_user_admin() 
  AND organization_id = (SELECT get_current_user_org_and_role().organization_id)
);