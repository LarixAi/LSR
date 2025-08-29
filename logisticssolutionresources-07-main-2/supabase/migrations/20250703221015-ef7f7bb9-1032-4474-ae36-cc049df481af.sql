-- Fix admin user employment status
UPDATE public.profiles 
SET employment_status = 'active' 
WHERE role = 'admin' AND employment_status = 'applicant';

-- Simplify and consolidate admin vehicle access policies
-- Drop existing conflicting policies first
DROP POLICY IF EXISTS "Admins can manage vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_admin_modify" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_admin_update" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_admin_delete" ON public.vehicles;

-- Create a single comprehensive admin policy that overrides all restrictions
DROP POLICY IF EXISTS "Admins can manage all vehicles" ON public.vehicles;
CREATE POLICY "Admins can manage all vehicles" 
ON public.vehicles 
FOR ALL 
TO authenticated 
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));

-- Ensure the organization-based policy doesn't conflict
DROP POLICY IF EXISTS "Admins can manage vehicles in their organization" ON public.vehicles;
CREATE POLICY "Organization admins can manage vehicles in their organization" 
ON public.vehicles 
FOR ALL 
TO authenticated 
USING (
  (organization_id_new = get_user_organization_id()) 
  AND has_admin_privileges(auth.uid())
)
WITH CHECK (
  (organization_id_new = get_user_organization_id()) 
  AND has_admin_privileges(auth.uid())
);

-- Ensure users can view vehicles in their organization
DROP POLICY IF EXISTS "Users can view vehicles in their organization" ON public.vehicles;
CREATE POLICY "Users can view vehicles in their organization" 
ON public.vehicles 
FOR SELECT 
TO authenticated 
USING (organization_id_new = get_user_organization_id());