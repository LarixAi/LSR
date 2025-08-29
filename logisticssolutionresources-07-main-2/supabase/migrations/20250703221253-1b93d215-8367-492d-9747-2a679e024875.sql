-- Fix admin user employment status
UPDATE public.profiles 
SET employment_status = 'active' 
WHERE role = 'admin' AND employment_status = 'applicant';

-- Simplify vehicle access policies for admins
-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "vehicles_admin_modify" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_admin_update" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_admin_delete" ON public.vehicles;

-- Ensure the main admin policy exists and is comprehensive
DROP POLICY IF EXISTS "Admins can manage all vehicles" ON public.vehicles;
CREATE POLICY "Admins can manage all vehicles" 
ON public.vehicles 
FOR ALL 
TO authenticated 
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));