-- Secure the vehicles table to prevent public access to fleet information
-- This fixes the security vulnerability where criminals could access license plates, 
-- vehicle numbers, makes, and models to target vehicles for theft

-- Enable RLS on vehicles table if not already enabled
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Drop any existing unsafe policies that might allow public access
DROP POLICY IF EXISTS "vehicles_select_all" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_public_read" ON public.vehicles;

-- Create secure RLS policies for vehicles table

-- Policy 1: Organization members can view vehicles in their organization
CREATE POLICY "vehicles_org_members_select" 
ON public.vehicles 
FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT profiles.organization_id 
    FROM public.profiles 
    WHERE profiles.id = auth.uid()
  )
);

-- Policy 2: Admins and council can manage vehicles in their organization
CREATE POLICY "vehicles_org_admins_manage" 
ON public.vehicles 
FOR ALL
TO authenticated
USING (
  organization_id IN (
    SELECT profiles.organization_id 
    FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'council', 'super_admin')
  )
)
WITH CHECK (
  organization_id IN (
    SELECT profiles.organization_id 
    FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'council', 'super_admin')
  )
);

-- Policy 3: Service role access for system operations
CREATE POLICY "vehicles_service_role_access" 
ON public.vehicles 
FOR ALL
TO service_role
USING (true);

-- Policy 4: Drivers can view vehicles they are assigned to
CREATE POLICY "vehicles_assigned_drivers_view" 
ON public.vehicles 
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT da.vehicle_id 
    FROM public.driver_assignments da
    WHERE da.driver_id = auth.uid() 
    AND da.is_active = true
  )
);

-- Create index for performance on organization_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_vehicles_organization_id ON public.vehicles (organization_id);

-- Log the security fix
INSERT INTO public.audit_logs (action, table_name, user_id, organization_id, new_values)
VALUES (
  'SECURITY_FIX', 
  'vehicles', 
  auth.uid(),
  (SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1),
  '{"description": "Implemented RLS policies to secure vehicle data from public access", "vulnerability": "PUBLIC_VEHICLE_DATA"}'::jsonb
);