-- Fix function security issue by setting proper search_path
CREATE OR REPLACE FUNCTION public.log_sensitive_access(
  p_table_name text,
  p_action text,
  p_record_id uuid DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_org_id uuid;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO v_org_id 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  -- Log the access
  INSERT INTO public.sensitive_data_access_log (
    user_id, table_name, action, record_id, organization_id
  ) VALUES (
    auth.uid(), p_table_name, p_action, p_record_id, v_org_id
  );
END;
$$;