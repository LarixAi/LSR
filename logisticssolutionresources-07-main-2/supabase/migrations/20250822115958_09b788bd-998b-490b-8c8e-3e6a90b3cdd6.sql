-- PHASE 1: CRITICAL SECURITY FIXES
-- Fix missing RLS policies and strengthen existing ones

-- Add missing RLS policies for child_profiles to protect children's data
CREATE POLICY "protect_child_data_strict" ON public.child_profiles 
FOR ALL USING (
  -- Only allow access to parents of the child OR organization admins
  auth.uid() = parent_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'council') 
    AND organization_id = (
      SELECT organization_id FROM public.profiles WHERE id = child_profiles.parent_id
    )
  )
);

-- Add organization_id to child_profiles for better security isolation
ALTER TABLE public.child_profiles 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- Update existing child_profiles to have proper organization_id
UPDATE public.child_profiles 
SET organization_id = (
  SELECT p.organization_id 
  FROM public.profiles p 
  WHERE p.id = child_profiles.parent_id
)
WHERE organization_id IS NULL;

-- Strengthen existing security policies
DROP POLICY IF EXISTS "Users can manage child_profiles in their organization" ON public.child_profiles;
CREATE POLICY "strict_child_organization_access" ON public.child_profiles 
FOR ALL USING (
  -- Parent access OR organization admin access within same org
  auth.uid() = parent_id OR 
  (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'council') 
      AND organization_id = child_profiles.organization_id
    )
  )
);

-- Fix child_tracking table to prevent cross-organization data leakage
DROP POLICY IF EXISTS "Users can manage child_tracking in their organization" ON public.child_tracking;
CREATE POLICY "strict_child_tracking_access" ON public.child_tracking 
FOR ALL USING (
  organization_id = get_current_user_organization_id_safe() AND
  (
    -- Only drivers can create, organization admins can view all
    (TG_OP = 'INSERT' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'driver')) OR
    (TG_OP != 'INSERT' AND is_current_user_admin_safe()) OR
    -- Parents can view their own children's tracking
    EXISTS (
      SELECT 1 FROM public.child_profiles cp 
      WHERE cp.id = child_tracking.child_id 
      AND cp.parent_id = auth.uid()
    )
  )
);

-- Add strong RLS policy for rail_replacement_services
CREATE POLICY "rail_services_organization_isolation" ON public.rail_replacement_services 
FOR ALL USING (
  organization_id = get_current_user_organization_id_safe()
);

-- Strengthen vehicle access policies to prevent cross-org access
DROP POLICY IF EXISTS "Users can manage vehicles in their organization" ON public.vehicles;
CREATE POLICY "strict_vehicle_organization_access" ON public.vehicles 
FOR ALL USING (
  organization_id = get_current_user_organization_id_safe() AND
  (
    is_current_user_admin_safe() OR 
    -- Drivers can only view vehicles assigned to them
    (role_from_auth() = 'driver' AND EXISTS (
      SELECT 1 FROM public.driver_assignments da 
      WHERE da.vehicle_id = vehicles.id 
      AND da.driver_id = auth.uid() 
      AND da.status = 'active'
    ))
  )
);

-- Create helper function to get role from auth context safely
CREATE OR REPLACE FUNCTION public.role_from_auth()
RETURNS TEXT
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Add audit trigger for child data access
CREATE OR REPLACE FUNCTION public.audit_child_data_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log any access to child data for compliance
  INSERT INTO public.admin_operation_logs (
    admin_user_id,
    operation_type,
    operation_details,
    success,
    organization_id
  ) VALUES (
    auth.uid(),
    'child_data_access',
    jsonb_build_object(
      'table_name', TG_TABLE_NAME,
      'operation', TG_OP,
      'child_id', COALESCE(NEW.id, OLD.id),
      'timestamp', extract(epoch from now())
    ),
    true,
    get_current_user_organization_id_safe()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply audit trigger to child-related tables
DROP TRIGGER IF EXISTS audit_child_profiles_access ON public.child_profiles;
CREATE TRIGGER audit_child_profiles_access
  AFTER INSERT OR UPDATE OR DELETE ON public.child_profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_child_data_access();

DROP TRIGGER IF EXISTS audit_child_tracking_access ON public.child_tracking;
CREATE TRIGGER audit_child_tracking_access
  AFTER INSERT OR UPDATE OR DELETE ON public.child_tracking
  FOR EACH ROW EXECUTE FUNCTION public.audit_child_data_access();