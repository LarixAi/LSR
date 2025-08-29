-- Fix 42P17 recursion: replace recursive profiles policies with safe ones
-- Ensure helper functions exist with proper search_path
CREATE OR REPLACE FUNCTION public.get_current_user_organization_id_safe()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin_safe()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'council', 'compliance_officer')
  );
$function$;

-- Enable RLS on profiles (idempotent)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop recursive/old policies if they exist
DROP POLICY IF EXISTS "Admins can manage profiles in their organization" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile and org profiles" ON public.profiles;

-- Minimal, non-recursive policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can manage org profiles"
ON public.profiles FOR ALL
USING (
  is_current_user_admin_safe() AND 
  organization_id = get_current_user_organization_id_safe()
)
WITH CHECK (
  is_current_user_admin_safe() AND 
  organization_id = get_current_user_organization_id_safe()
);
