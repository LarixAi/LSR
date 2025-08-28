
-- Fix the existing policy conflict by dropping and recreating
DROP POLICY IF EXISTS "Admins can manage mechanics" ON public.mechanics;
DROP POLICY IF EXISTS "Users can view mechanics" ON public.mechanics;

-- Ensure RLS is enabled
ALTER TABLE public.mechanics ENABLE ROW LEVEL SECURITY;

-- Add comprehensive RLS policies for mechanics table with organization isolation
CREATE POLICY "Admins can manage mechanics in their organization" ON public.mechanics
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'council')
    AND organization_id = (
      SELECT organization_id FROM public.profiles 
      WHERE id = mechanics.profile_id
    )
  )
);

CREATE POLICY "Users can view mechanics in their organization" ON public.mechanics
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p1, public.profiles p2
    WHERE p1.id = auth.uid() 
    AND p2.id = mechanics.profile_id
    AND p1.organization_id = p2.organization_id
  )
);

-- Fix organization_id inconsistency in vehicle assignments
UPDATE public.driver_assignments 
SET organization_id = (
  SELECT organization_id_new 
  FROM public.vehicles 
  WHERE vehicles.id = driver_assignments.vehicle_id
)
WHERE organization_id IS NULL 
AND EXISTS (
  SELECT 1 FROM public.vehicles 
  WHERE vehicles.id = driver_assignments.vehicle_id
);

-- Add enhanced security audit logging function
CREATE OR REPLACE FUNCTION public.log_security_event_enhanced(
  p_user_id uuid,
  p_event_type text,
  p_event_details jsonb DEFAULT NULL::jsonb,
  p_ip_address inet DEFAULT NULL::inet,
  p_user_agent text DEFAULT NULL::text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.security_audit_logs (
    user_id, 
    event_type, 
    event_details, 
    ip_address, 
    user_agent
  )
  VALUES (
    p_user_id, 
    p_event_type, 
    COALESCE(p_event_details, '{}'::jsonb), 
    p_ip_address, 
    p_user_agent
  );
EXCEPTION
  WHEN others THEN
    -- Don't let logging failures break the application
    NULL;
END;
$function$;

-- Add function to check suspicious login patterns
CREATE OR REPLACE FUNCTION public.check_suspicious_login_activity(
  p_user_id uuid,
  p_ip_address inet DEFAULT NULL::inet
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  failed_attempts INTEGER;
  recent_attempts INTEGER;
BEGIN
  -- Check failed login attempts in last 15 minutes
  SELECT COUNT(*) INTO failed_attempts
  FROM public.security_audit_logs
  WHERE user_id = p_user_id
    AND event_type = 'login_failed'
    AND created_at > NOW() - INTERVAL '15 minutes';
    
  -- Check total login attempts from IP in last 5 minutes
  SELECT COUNT(*) INTO recent_attempts
  FROM public.security_audit_logs
  WHERE ip_address = p_ip_address
    AND event_type IN ('login_success', 'login_failed')
    AND created_at > NOW() - INTERVAL '5 minutes';
    
  -- Return true if suspicious activity detected
  RETURN failed_attempts >= 5 OR recent_attempts >= 20;
END;
$function$;
