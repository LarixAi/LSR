-- CRITICAL SECURITY FIXES: RLS Policy Corrections
-- Fix overly permissive policies that expose data across organizations

-- 1. Organizations Table Security Fix
DROP POLICY IF EXISTS "Organizations are viewable by everyone" ON public.organizations;
DROP POLICY IF EXISTS "Users can view all organizations" ON public.organizations;

CREATE POLICY "Users can view their own organization" 
ON public.organizations 
FOR SELECT 
USING (id = get_current_user_organization_id_safe());

CREATE POLICY "Admins can manage their own organization" 
ON public.organizations 
FOR ALL 
USING (
  id = get_current_user_organization_id_safe() 
  AND is_current_user_admin_safe()
)
WITH CHECK (
  id = get_current_user_organization_id_safe() 
  AND is_current_user_admin_safe()
);

-- 2. Support Tickets Security Fix  
DROP POLICY IF EXISTS "Users can view all support tickets" ON public.support_tickets;

CREATE POLICY "Users can view organization support tickets" 
ON public.support_tickets 
FOR SELECT 
USING (organization_id = get_current_user_organization_id_safe());

CREATE POLICY "Users can create support tickets for their organization" 
ON public.support_tickets 
FOR INSERT 
WITH CHECK (organization_id = get_current_user_organization_id_safe());

CREATE POLICY "Users can update their organization's support tickets" 
ON public.support_tickets 
FOR UPDATE 
USING (organization_id = get_current_user_organization_id_safe());

-- 3. Analog Tachograph Charts Security Fix
DROP POLICY IF EXISTS "Users can manage organization's analog charts" ON public.analog_tachograph_charts;

CREATE POLICY "Organization users can view their analog charts" 
ON public.analog_tachograph_charts 
FOR SELECT 
USING (
  organization_id = get_current_user_organization_id_safe()
  AND (driver_id = auth.uid() OR is_current_user_admin_safe())
);

CREATE POLICY "Organization admins can manage analog charts" 
ON public.analog_tachograph_charts 
FOR ALL 
USING (
  organization_id = get_current_user_organization_id_safe() 
  AND is_current_user_admin_safe()
)
WITH CHECK (
  organization_id = get_current_user_organization_id_safe() 
  AND is_current_user_admin_safe()
);

-- 4. Vehicle Check Sessions Security Fix
CREATE POLICY "Drivers can access their own vehicle checks" 
ON public.vehicle_check_sessions 
FOR ALL 
USING (
  driver_id = auth.uid() 
  AND organization_id = get_current_user_organization_id_safe()
)
WITH CHECK (
  driver_id = auth.uid() 
  AND organization_id = get_current_user_organization_id_safe()
);

CREATE POLICY "Organization admins can view all vehicle checks" 
ON public.vehicle_check_sessions 
FOR SELECT 
USING (
  organization_id = get_current_user_organization_id_safe() 
  AND is_current_user_admin_safe()
);

-- 5. Schools Table Security Fix (if exists)
DROP POLICY IF EXISTS "Anyone can view schools" ON public.schools;

CREATE POLICY "Organization users can view schools they serve" 
ON public.schools 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp 
    WHERE cp.school_id = schools.id 
    AND cp.organization_id = get_current_user_organization_id_safe()
  )
  OR is_current_user_admin_safe()
);

-- 6. Customer Profiles Security Enhancement
CREATE POLICY "Organization users manage their customers" 
ON public.customer_profiles 
FOR ALL 
USING (organization_id = get_current_user_organization_id_safe())
WITH CHECK (organization_id = get_current_user_organization_id_safe());

-- 7. Vehicles Table Security Fix
CREATE POLICY "Organization users can view their vehicles" 
ON public.vehicles 
FOR SELECT 
USING (organization_id = get_current_user_organization_id_safe());

CREATE POLICY "Organization admins can manage their vehicles" 
ON public.vehicles 
FOR ALL 
USING (
  organization_id = get_current_user_organization_id_safe() 
  AND is_current_user_admin_safe()
)
WITH CHECK (
  organization_id = get_current_user_organization_id_safe() 
  AND is_current_user_admin_safe()
);

-- 8. Security Audit Log for Policy Changes
INSERT INTO public.admin_operation_logs (
  admin_user_id,
  operation_type,
  operation_details,
  success,
  organization_id
) VALUES (
  auth.uid(),
  'security_policy_update',
  '{"action": "rls_policy_security_fixes", "tables_affected": ["organizations", "support_tickets", "analog_tachograph_charts", "vehicle_check_sessions", "schools", "customer_profiles", "vehicles"], "security_level": "critical"}'::jsonb,
  true,
  get_current_user_organization_id_safe()
);

-- 9. Rate Limiting Function for Authentication
CREATE OR REPLACE FUNCTION public.check_auth_rate_limit(user_identifier text, max_attempts integer DEFAULT 5, window_minutes integer DEFAULT 15)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  attempt_count integer;
BEGIN
  -- Count recent attempts
  SELECT COUNT(*) INTO attempt_count
  FROM admin_operation_logs
  WHERE operation_details->>'user_identifier' = user_identifier
  AND operation_type IN ('password_reset_request', 'login_attempt')
  AND created_at > now() - (window_minutes || ' minutes')::interval;
  
  RETURN attempt_count < max_attempts;
END;
$$;

-- 10. Enhanced Security Event Logging Function  
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type text,
  event_details jsonb DEFAULT '{}'::jsonb,
  severity text DEFAULT 'info',
  user_id uuid DEFAULT auth.uid(),
  ip_address inet DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  log_id uuid;
  user_org_id uuid;
BEGIN
  -- Get user organization
  SELECT organization_id INTO user_org_id
  FROM profiles
  WHERE id = user_id;
  
  -- Insert security log
  INSERT INTO admin_operation_logs (
    admin_user_id,
    operation_type,
    operation_details,
    success,
    organization_id,
    ip_address
  ) VALUES (
    user_id,
    'security_event',
    jsonb_build_object(
      'event_type', event_type,
      'details', event_details,
      'severity', severity,
      'timestamp', extract(epoch from now())
    ),
    true,
    user_org_id,
    ip_address
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;