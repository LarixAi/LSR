-- SECURITY LINTER REMEDIATION: Add immutable search_path to new functions

-- 1) Recreate log_child_data_access with SET search_path
CREATE OR REPLACE FUNCTION public.log_child_data_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only log if we have a valid auth context
  IF auth.uid() IS NOT NULL THEN
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
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 2) Recreate validate_organization_access with SET search_path
CREATE OR REPLACE FUNCTION public.validate_organization_access(target_org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_org_id uuid;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO user_org_id
  FROM profiles
  WHERE id = auth.uid();
  
  -- Check if user belongs to target organization
  IF user_org_id IS NULL OR target_org_id IS NULL OR user_org_id != target_org_id THEN
    -- Log potential security violation only if we have valid data
    IF auth.uid() IS NOT NULL THEN
      PERFORM create_security_alert(
        'cross_organization_access_attempt',
        'high',
        jsonb_build_object(
          'user_org', user_org_id,
          'target_org', target_org_id,
          'user_id', auth.uid()
        )
      );
    END IF;
    
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;