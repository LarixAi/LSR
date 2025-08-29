-- Fix: Set explicit search_path for SECURITY DEFINER functions per linter guidance

-- 1) log_security_event_enhanced
CREATE OR REPLACE FUNCTION public.log_security_event_enhanced(
  p_user_id uuid,
  p_event_type text,
  p_event_details jsonb,
  p_ip_address text,
  p_user_agent text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_org_id uuid;
BEGIN
  IF p_user_id IS NOT NULL THEN
    SELECT organization_id INTO v_org_id FROM public.profiles WHERE id = p_user_id LIMIT 1;
  END IF;

  INSERT INTO public.security_audit_logs (
    user_id, organization_id, event_type, event_details, ip_address, user_agent
  ) VALUES (
    p_user_id, v_org_id, p_event_type, COALESCE(p_event_details, '{}'::jsonb), p_ip_address, p_user_agent
  );
END;
$$;

REVOKE ALL ON FUNCTION public.log_security_event_enhanced(uuid, text, jsonb, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_security_event_enhanced(uuid, text, jsonb, text, text) TO anon, authenticated;

-- 2) log_security_event
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_details jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  PERFORM public.log_security_event_enhanced(auth.uid(), p_event_type, p_details, NULL, NULL);
END;
$$;

REVOKE ALL ON FUNCTION public.log_security_event(text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_security_event(text, jsonb) TO authenticated;

-- 3) validate_password_complexity (not security definer, but set search_path for consistency)
CREATE OR REPLACE FUNCTION public.validate_password_complexity(password text)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path TO public
AS $$
DECLARE
  errs text[] := ARRAY[]::text[];
BEGIN
  IF password IS NULL OR length(password) < 8 THEN
    errs := array_append(errs, 'Password must be at least 8 characters');
  END IF;
  IF password IS NULL OR password !~ '[A-Z]' THEN
    errs := array_append(errs, 'At least one uppercase letter required');
  END IF;
  IF password IS NULL OR password !~ '[a-z]' THEN
    errs := array_append(errs, 'At least one lowercase letter required');
  END IF;
  IF password IS NULL OR password !~ '[0-9]' THEN
    errs := array_append(errs, 'At least one number required');
  END IF;
  IF password IS NULL OR password !~ '[^A-Za-z0-9]' THEN
    errs := array_append(errs, 'At least one symbol required');
  END IF;

  RETURN jsonb_build_object(
    'valid', COALESCE(array_length(errs, 1), 0) = 0,
    'errors', errs
  );
END;
$$;

REVOKE ALL ON FUNCTION public.validate_password_complexity(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_password_complexity(text) TO anon, authenticated;

-- 4) check_suspicious_login_activity (not security definer, but set search_path for consistency)
CREATE OR REPLACE FUNCTION public.check_suspicious_login_activity(
  p_user_id uuid,
  p_context jsonb DEFAULT '{}'::jsonb
) RETURNS boolean
LANGUAGE plpgsql
SET search_path TO public
AS $$
BEGIN
  RETURN false;
END;
$$;

REVOKE ALL ON FUNCTION public.check_suspicious_login_activity(uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_suspicious_login_activity(uuid, jsonb) TO anon, authenticated;