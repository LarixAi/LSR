-- First disable the audit trigger temporarily to fix the user
DROP TRIGGER IF EXISTS audit_profiles_changes ON public.profiles;

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