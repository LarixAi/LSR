-- SECURITY HARDENING: Additional Protection Layers
-- Add security monitoring, rate limiting, and audit improvements

-- 1. Enhanced Rate Limiting with Organization Context
CREATE OR REPLACE FUNCTION public.check_organization_rate_limit(
  operation_type text,
  max_attempts integer DEFAULT 10,
  window_minutes integer DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  attempt_count integer;
  user_org_id uuid;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO user_org_id
  FROM profiles
  WHERE id = auth.uid();
  
  -- Count recent attempts for this organization
  SELECT COUNT(*) INTO attempt_count
  FROM admin_operation_logs
  WHERE organization_id = user_org_id
  AND operation_type = operation_type
  AND created_at > now() - (window_minutes || ' minutes')::interval;
  
  RETURN attempt_count < max_attempts;
END;
$$;

-- 2. Security Alert Function for Suspicious Activity
CREATE OR REPLACE FUNCTION public.create_security_alert(
  alert_type text,
  severity text DEFAULT 'medium',
  details jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  alert_id uuid;
  user_org_id uuid;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO user_org_id
  FROM profiles
  WHERE id = auth.uid();
  
  -- Create security alert
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
      'alert_type', alert_type,
      'severity', severity,
      'details', details,
      'timestamp', extract(epoch from now()),
      'user_ip', current_setting('request.headers', true)::jsonb->>'x-forwarded-for',
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
    ),
    true,
    user_org_id
  ) RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$$;

-- 3. Cross-Organization Access Detection
CREATE OR REPLACE FUNCTION public.detect_cross_org_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_org_id uuid;
  target_org_id uuid;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO user_org_id
  FROM profiles
  WHERE id = auth.uid();
  
  -- Check if trying to access different organization's data
  IF TG_TABLE_NAME = 'child_profiles' THEN
    target_org_id := NEW.organization_id;
  ELSIF TG_TABLE_NAME = 'vehicles' THEN
    target_org_id := NEW.organization_id;
  ELSIF TG_TABLE_NAME = 'defect_reports' THEN
    target_org_id := NEW.organization_id;
  END IF;
  
  -- Alert if cross-organization access attempt
  IF user_org_id IS NOT NULL AND target_org_id IS NOT NULL AND user_org_id != target_org_id THEN
    PERFORM public.create_security_alert(
      'cross_organization_access_attempt',
      'high',
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'user_org', user_org_id,
        'target_org', target_org_id,
        'operation', TG_OP
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- 4. Enhanced Input Sanitization Function
CREATE OR REPLACE FUNCTION public.sanitize_user_input(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Remove potential SQL injection patterns
  input_text := regexp_replace(input_text, E'[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]', '', 'g');
  
  -- Remove script tags and common XSS patterns
  input_text := regexp_replace(input_text, '<script[^>]*>.*?</script>', '', 'gi');
  input_text := regexp_replace(input_text, 'javascript:', '', 'gi');
  input_text := regexp_replace(input_text, 'on\w+\s*=', '', 'gi');
  
  -- Limit length to prevent DoS
  IF length(input_text) > 10000 THEN
    input_text := substring(input_text from 1 for 10000);
  END IF;
  
  RETURN input_text;
END;
$$;

-- 5. Session Security Enhancement
CREATE OR REPLACE FUNCTION public.validate_session_security()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_profile RECORD;
  suspicious_activity boolean := false;
BEGIN
  -- Get user profile
  SELECT * INTO user_profile
  FROM profiles
  WHERE id = auth.uid();
  
  -- Check if user exists and is active
  IF user_profile IS NULL OR NOT user_profile.is_active THEN
    RETURN false;
  END IF;
  
  -- Check for suspicious activity patterns
  SELECT EXISTS (
    SELECT 1 FROM admin_operation_logs
    WHERE admin_user_id = auth.uid()
    AND operation_type = 'security_alert'
    AND created_at > now() - interval '1 hour'
    LIMIT 5
  ) INTO suspicious_activity;
  
  -- Log security validation
  INSERT INTO admin_operation_logs (
    admin_user_id,
    operation_type,
    operation_details,
    success,
    organization_id
  ) VALUES (
    auth.uid(),
    'session_validation',
    jsonb_build_object(
      'suspicious_activity', suspicious_activity,
      'timestamp', extract(epoch from now())
    ),
    true,
    user_profile.organization_id
  );
  
  RETURN NOT suspicious_activity;
END;
$$;

-- 6. Password Security Enhancement
CREATE OR REPLACE FUNCTION public.enhanced_password_validation(password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  score integer := 0;
  issues text[] := ARRAY[]::text[];
  strength text;
BEGIN
  -- Length check
  IF LENGTH(password) < 12 THEN
    issues := array_append(issues, 'Password must be at least 12 characters long');
  ELSE
    score := score + 1;
  END IF;
  
  -- Complexity checks
  IF password !~ '[A-Z]' THEN
    issues := array_append(issues, 'Must contain uppercase letter');
  ELSE
    score := score + 1;
  END IF;
  
  IF password !~ '[a-z]' THEN
    issues := array_append(issues, 'Must contain lowercase letter');
  ELSE
    score := score + 1;
  END IF;
  
  IF password !~ '[0-9]' THEN
    issues := array_append(issues, 'Must contain number');
  ELSE
    score := score + 1;
  END IF;
  
  IF password !~ '[^A-Za-z0-9]' THEN
    issues := array_append(issues, 'Must contain special character');
  ELSE
    score := score + 1;
  END IF;
  
  -- Common pattern checks
  IF password ~* '(password|123|abc|qwerty)' THEN
    issues := array_append(issues, 'Contains common patterns');
    score := score - 1;
  END IF;
  
  -- Determine strength
  IF score >= 5 THEN
    strength := 'strong';
  ELSIF score >= 3 THEN
    strength := 'medium';
  ELSE
    strength := 'weak';
  END IF;
  
  RETURN jsonb_build_object(
    'valid', array_length(issues, 1) IS NULL,
    'score', score,
    'strength', strength,
    'issues', issues
  );
END;
$$;