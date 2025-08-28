-- Add missing RLS policies for tables that have RLS enabled but no policies

-- Check which tables might need policies and add basic organization-based policies

-- Add RLS policy for analog_chart_analysis_sessions (if missing)
DROP POLICY IF EXISTS "Organization users can manage analysis sessions" ON public.analog_chart_analysis_sessions;
CREATE POLICY "Organization users can manage analysis sessions" 
ON public.analog_chart_analysis_sessions 
FOR ALL
USING (organization_id = get_current_user_organization_id_safe())
WITH CHECK (organization_id = get_current_user_organization_id_safe());

-- Add RLS policy for analog_chart_storage (if missing)
DROP POLICY IF EXISTS "Admins can manage chart storage" ON public.analog_chart_storage;
CREATE POLICY "Admins can manage chart storage" 
ON public.analog_chart_storage 
FOR ALL
USING (
  organization_id = get_current_user_organization_id_safe() 
  AND is_current_user_admin_safe()
)
WITH CHECK (
  organization_id = get_current_user_organization_id_safe() 
  AND is_current_user_admin_safe()
);

-- Add RLS policy for any other tables that might be missing policies
-- Check for missing policies on other organization-related tables

-- Ensure compliance_audit_logs has proper policies
DROP POLICY IF EXISTS "Users can manage compliance_audit_logs in their organization" ON public.compliance_audit_logs;
CREATE POLICY "Organization admins can manage audit logs" 
ON public.compliance_audit_logs 
FOR ALL
USING (
  organization_id = get_current_user_organization_id_safe() 
  AND is_current_user_admin_safe()
)
WITH CHECK (
  organization_id = get_current_user_organization_id_safe() 
  AND is_current_user_admin_safe()
);

-- Add audit logging for sensitive operations (revised)
CREATE OR REPLACE FUNCTION public.log_sensitive_operation(
  operation_type text,
  table_name text,
  record_id uuid,
  details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO compliance_audit_logs (
    user_id,
    organization_id,
    action_type,
    table_name,
    record_id,
    new_values
  ) VALUES (
    auth.uid(),
    get_current_user_organization_id_safe(),
    operation_type,
    table_name,
    record_id,
    details
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Log errors but don't fail the operation
    RAISE NOTICE 'Failed to log audit entry: %', SQLERRM;
END;
$$;