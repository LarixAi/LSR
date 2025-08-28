-- Create the missing audit function first
CREATE OR REPLACE FUNCTION public.log_audit_trail(
  p_table_name text, 
  p_record_id uuid, 
  p_action text, 
  p_old_values jsonb DEFAULT NULL, 
  p_new_values jsonb DEFAULT NULL, 
  p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  audit_id UUID;
  user_org_id UUID;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO user_org_id
  FROM public.profiles WHERE id = auth.uid();
  
  INSERT INTO public.audit_logs (
    table_name,
    record_id,
    action,
    old_values,
    new_values,
    changed_by,
    organization_id,
    notes
  ) VALUES (
    p_table_name,
    p_record_id,
    p_action,
    p_old_values,
    p_new_values,
    auth.uid(),
    user_org_id,
    p_notes
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't let audit failures break the main operation
    RETURN NULL;
END;
$$;