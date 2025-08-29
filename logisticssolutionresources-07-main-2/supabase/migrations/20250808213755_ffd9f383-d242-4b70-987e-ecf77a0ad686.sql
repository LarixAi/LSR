-- Phase 0: Backend primitives to unblock auth and security logging
-- 1) Simplify and (re)create handle_new_user to match current profiles schema
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_role text;
  v_org_id uuid := NULL;
BEGIN
  -- Determine role from metadata or default to 'driver' (matches current profiles default)
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'driver');

  -- Insert minimal profile aligned with existing columns
  INSERT INTO public.profiles (id, user_id, email, first_name, last_name, role, organization_id)
  VALUES (
    NEW.id,
    NEW.id, -- keep user_id in sync with auth uid for policies using user_id
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    v_role,
    v_org_id
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 2) Attach trigger to auth.users so profiles are auto-created on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3) Security audit logs table
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  organization_id uuid,
  event_type text NOT NULL,
  event_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS and add conservative policies (view only by owner or admins)
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'security_audit_logs' AND policyname = 'Users can view own audit logs'
  ) THEN
    CREATE POLICY "Users can view own audit logs"
    ON public.security_audit_logs
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'security_audit_logs' AND policyname = 'Admins can view all audit logs'
  ) THEN
    CREATE POLICY "Admins can view all audit logs"
    ON public.security_audit_logs
    FOR SELECT
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin','council')
    ));
  END IF;
END $$;

-- 4) RPC: Enhanced security logger (callable by anon + authenticated)
CREATE OR REPLACE FUNCTION public.log_security_event_enhanced(
  p_user_id uuid,
  p_event_type text,
  p_event_details jsonb,
  p_ip_address text,
  p_user_agent text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- 5) RPC: Simple security logger wrapper using auth.uid()
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_details jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.log_security_event_enhanced(auth.uid(), p_event_type, p_details, NULL, NULL);
END;
$$;

REVOKE ALL ON FUNCTION public.log_security_event(text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_security_event(text, jsonb) TO authenticated;

-- 6) RPC: Password complexity validator
CREATE OR REPLACE FUNCTION public.validate_password_complexity(password text)
RETURNS jsonb
LANGUAGE plpgsql
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

-- 7) RPC: Suspicious login activity check (stub returning false to avoid 404s)
CREATE OR REPLACE FUNCTION public.check_suspicious_login_activity(
  p_user_id uuid,
  p_context jsonb DEFAULT '{}'::jsonb
) RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN false; -- minimal implementation; can be enhanced later
END;
$$;

REVOKE ALL ON FUNCTION public.check_suspicious_login_activity(uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_suspicious_login_activity(uuid, jsonb) TO anon, authenticated;