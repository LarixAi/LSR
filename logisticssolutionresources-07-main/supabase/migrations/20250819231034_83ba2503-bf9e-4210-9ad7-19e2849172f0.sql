-- CRITICAL SECURITY FIX: Emergency RLS Policy Hardening
-- This migration addresses critical security vulnerabilities identified in the security audit

-- 1. Fix overly permissive RLS policies that allow cross-organization data access

-- Drop and recreate secure RLS policies for tachograph_records
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.tachograph_records;
DROP POLICY IF EXISTS "Users can manage tachograph records" ON public.tachograph_records;

CREATE POLICY "Organization users can manage their tachograph records"
ON public.tachograph_records
FOR ALL
TO authenticated
USING (organization_id = get_current_user_organization_id_safe())
WITH CHECK (organization_id = get_current_user_organization_id_safe());

-- Fix support_tickets table - ensure organization isolation
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.support_tickets;

CREATE POLICY "Organization users can manage their support tickets"
ON public.support_tickets
FOR ALL
TO authenticated
USING (organization_id = get_current_user_organization_id_safe())
WITH CHECK (organization_id = get_current_user_organization_id_safe());

-- Fix vehicle_checks table - critical vehicle safety data protection
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.vehicle_checks;

CREATE POLICY "Organization users can manage their vehicle checks"
ON public.vehicle_checks
FOR ALL  
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.vehicles v 
    WHERE v.id = vehicle_checks.vehicle_id 
    AND v.organization_id = get_current_user_organization_id_safe()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.vehicles v 
    WHERE v.id = vehicle_checks.vehicle_id 
    AND v.organization_id = get_current_user_organization_id_safe()
  )
);

-- CRITICAL: Fix student_pickups - CHILD SAFETY DATA PROTECTION
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.student_pickups;

-- Restrict to authorized parents and assigned drivers only
CREATE POLICY "Parents can view their children's pickup records"
ON public.student_pickups
FOR SELECT
TO authenticated
USING (
  student_id IN (
    SELECT cp.id 
    FROM child_profiles cp 
    WHERE cp.parent_id = auth.uid()
  )
);

CREATE POLICY "Drivers can manage pickup records for their assigned routes"
ON public.student_pickups
FOR ALL
TO authenticated
USING (
  driver_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM route_assignments ra 
    WHERE ra.driver_id = auth.uid() 
    AND ra.route_id = student_pickups.route_id
    AND ra.assigned_date = student_pickups.pickup_date
  )
)
WITH CHECK (
  driver_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM route_assignments ra 
    WHERE ra.driver_id = auth.uid() 
    AND ra.route_id = student_pickups.route_id
    AND ra.assigned_date = student_pickups.pickup_date
  )
);

CREATE POLICY "Admins can manage all pickup records in their organization"
ON public.student_pickups
FOR ALL
TO authenticated
USING (
  is_current_user_admin_safe() 
  AND EXISTS (
    SELECT 1 FROM child_profiles cp 
    WHERE cp.id = student_pickups.student_id 
    AND cp.organization_id = get_current_user_organization_id_safe()
  )
)
WITH CHECK (
  is_current_user_admin_safe() 
  AND EXISTS (
    SELECT 1 FROM child_profiles cp 
    WHERE cp.id = student_pickups.student_id 
    AND cp.organization_id = get_current_user_organization_id_safe()
  )
);

-- Fix organizations table - prevent cross-organization visibility
DROP POLICY IF EXISTS "Enable read access for all users" ON public.organizations;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.organizations;

CREATE POLICY "Users can view their own organization"
ON public.organizations
FOR SELECT
TO authenticated
USING (id = get_current_user_organization_id_safe());

CREATE POLICY "Admins can manage their own organization"
ON public.organizations  
FOR UPDATE
TO authenticated
USING (
  id = get_current_user_organization_id_safe() 
  AND is_current_user_admin_safe()
)
WITH CHECK (
  id = get_current_user_organization_id_safe() 
  AND is_current_user_admin_safe()
);

-- Fix vehicle_inspections table
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.vehicle_inspections;

CREATE POLICY "Organization users can manage their vehicle inspections"
ON public.vehicle_inspections
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.vehicles v 
    WHERE v.id = vehicle_inspections.vehicle_id 
    AND v.organization_id = get_current_user_organization_id_safe()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.vehicles v 
    WHERE v.id = vehicle_inspections.vehicle_id 
    AND v.organization_id = get_current_user_organization_id_safe()
  )
);

-- Fix maintenance_schedules table
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.maintenance_schedules;

CREATE POLICY "Organization users can manage their maintenance schedules"
ON public.maintenance_schedules
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.vehicles v 
    WHERE v.id = maintenance_schedules.vehicle_id 
    AND v.organization_id = get_current_user_organization_id_safe()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.vehicles v 
    WHERE v.id = maintenance_schedules.vehicle_id 
    AND v.organization_id = get_current_user_organization_id_safe()
  )
);

-- Add audit logging trigger for child data access
CREATE OR REPLACE FUNCTION log_child_data_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log access to sensitive child data
  INSERT INTO admin_operation_logs (
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
      'child_id', COALESCE(NEW.child_id, NEW.student_id, OLD.child_id, OLD.student_id),
      'timestamp', extract(epoch from now())
    ),
    true,
    get_current_user_organization_id_safe()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit logging to child-related tables
DROP TRIGGER IF EXISTS log_child_profiles_access ON public.child_profiles;
CREATE TRIGGER log_child_profiles_access
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.child_profiles
  FOR EACH ROW EXECUTE FUNCTION log_child_data_access();

DROP TRIGGER IF EXISTS log_student_pickups_access ON public.student_pickups;
CREATE TRIGGER log_student_pickups_access
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.student_pickups
  FOR EACH ROW EXECUTE FUNCTION log_child_data_access();

-- Create security validation function
CREATE OR REPLACE FUNCTION validate_organization_access(target_org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_org_id uuid;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO user_org_id
  FROM profiles
  WHERE id = auth.uid();
  
  -- Check if user belongs to target organization
  IF user_org_id != target_org_id THEN
    -- Log potential security violation
    PERFORM create_security_alert(
      'cross_organization_access_attempt',
      'high',
      jsonb_build_object(
        'user_org', user_org_id,
        'target_org', target_org_id,
        'user_id', auth.uid()
      )
    );
    
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;