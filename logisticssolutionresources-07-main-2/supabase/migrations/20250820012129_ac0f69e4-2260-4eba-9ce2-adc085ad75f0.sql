-- Phase 1: Critical RLS Policy Fixes (URGENT)

-- 1. Fix organizations table RLS policies - remove overly permissive policies
DROP POLICY IF EXISTS "Users can manage organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.organizations;

-- Create proper organization access policies
CREATE POLICY "Users can view their own organization" 
ON public.organizations 
FOR SELECT 
USING (id = get_current_user_organization_id_safe());

CREATE POLICY "Organization admins can manage their organization" 
ON public.organizations 
FOR ALL 
USING (id = get_current_user_organization_id_safe() AND is_current_user_admin_safe())
WITH CHECK (id = get_current_user_organization_id_safe() AND is_current_user_admin_safe());

-- 2. Fix tachograph_records - remove overly permissive policies
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.tachograph_records;

-- Create proper tachograph access policies
CREATE POLICY "Users can manage tachograph records in their organization" 
ON public.tachograph_records 
FOR ALL 
USING (organization_id = get_current_user_organization_id_safe())
WITH CHECK (organization_id = get_current_user_organization_id_safe());

-- 3. Fix support_tickets - remove overly permissive policies  
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.support_tickets;

-- Create proper support ticket access policies
CREATE POLICY "Users can manage support tickets in their organization" 
ON public.support_tickets 
FOR ALL 
USING (organization_id = get_current_user_organization_id_safe())
WITH CHECK (organization_id = get_current_user_organization_id_safe());

-- 4. Fix vehicle_check_sessions - remove overly permissive policies
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.vehicle_check_sessions;

-- Create proper vehicle check access policies
CREATE POLICY "Users can manage vehicle checks in their organization" 
ON public.vehicle_check_sessions 
FOR ALL 
USING (organization_id = get_current_user_organization_id_safe())
WITH CHECK (organization_id = get_current_user_organization_id_safe());

-- 5. Fix daily_rest - remove overly permissive policies
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.daily_rest;

-- Create proper daily rest access policies
CREATE POLICY "Users can manage daily rest in their organization" 
ON public.daily_rest 
FOR ALL 
USING (organization_id = get_current_user_organization_id_safe())
WITH CHECK (organization_id = get_current_user_organization_id_safe());

-- 6. Enhance child data protection - add organization-based restrictions
DROP POLICY IF EXISTS "Admins can view all documents" ON public.child_documents;
DROP POLICY IF EXISTS "Parents can manage their children's documents" ON public.child_documents;

-- Create proper child document access policies
CREATE POLICY "Parents can manage their children's documents in same organization" 
ON public.child_documents 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM child_profiles cp 
  WHERE cp.id = child_documents.child_id 
  AND cp.parent_id = auth.uid() 
  AND cp.organization_id = get_current_user_organization_id_safe()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM child_profiles cp 
  WHERE cp.id = child_documents.child_id 
  AND cp.parent_id = auth.uid() 
  AND cp.organization_id = get_current_user_organization_id_safe()
));

CREATE POLICY "Organization admins can view child documents in their organization" 
ON public.child_documents 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM child_profiles cp 
  WHERE cp.id = child_documents.child_id 
  AND cp.organization_id = get_current_user_organization_id_safe() 
  AND is_current_user_admin_safe()
));

-- 7. Add security audit trigger for cross-organization access attempts
CREATE OR REPLACE FUNCTION public.log_cross_org_attempt()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_org_id uuid;
  target_org_id uuid;
BEGIN
  -- Get user's organization
  user_org_id := get_current_user_organization_id_safe();
  
  -- Extract organization ID from the record being accessed
  IF TG_TABLE_NAME = 'organizations' THEN
    target_org_id := NEW.id;
  ELSIF TG_TABLE_NAME = 'child_profiles' THEN
    target_org_id := NEW.organization_id;
  ELSIF TG_TABLE_NAME = 'vehicles' THEN
    target_org_id := NEW.organization_id;
  ELSIF TG_TABLE_NAME = 'defect_reports' THEN
    target_org_id := NEW.organization_id;
  END IF;
  
  -- Log suspicious cross-organization access attempts
  IF user_org_id IS NOT NULL AND target_org_id IS NOT NULL AND user_org_id != target_org_id THEN
    INSERT INTO admin_operation_logs (
      admin_user_id,
      operation_type,
      operation_details,
      success,
      organization_id
    ) VALUES (
      auth.uid(),
      'security_alert',
      jsonb_build_object(
        'alert_type', 'cross_organization_access_attempt',
        'table', TG_TABLE_NAME,
        'user_org', user_org_id,
        'target_org', target_org_id,
        'operation', TG_OP,
        'timestamp', extract(epoch from now())
      ),
      false,
      user_org_id
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply the trigger to sensitive tables
DROP TRIGGER IF EXISTS log_cross_org_attempt_organizations ON public.organizations;
CREATE TRIGGER log_cross_org_attempt_organizations
  BEFORE INSERT OR UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.log_cross_org_attempt();

DROP TRIGGER IF EXISTS log_cross_org_attempt_child_profiles ON public.child_profiles;  
CREATE TRIGGER log_cross_org_attempt_child_profiles
  BEFORE INSERT OR UPDATE ON public.child_profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_cross_org_attempt();