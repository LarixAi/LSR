-- Critical Security Fixes - Phase 1

-- 1. Secure role_permissions table by removing public access and adding proper RLS
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Drop any existing permissive policies on role_permissions
DROP POLICY IF EXISTS "Enable read access for all users" ON public.role_permissions;
DROP POLICY IF EXISTS "Public read access" ON public.role_permissions;

-- Create secure RLS policy for role_permissions - only admins can read
CREATE POLICY "Admin users can view role permissions" ON public.role_permissions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'council')
  )
);

-- Create security definer function for safe role checking (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.check_user_role(user_id uuid, required_role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.role_permissions rp ON p.role::text = rp.role
    WHERE p.id = user_id 
    AND rp.permission = required_role
  );
$$;

-- Create function to get user role safely
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role::text FROM public.profiles WHERE id = user_id LIMIT 1;
$$;

-- 2. Add RLS policies for dashboard_stats and documents_with_profiles views
-- Enable RLS on these views
ALTER VIEW public.dashboard_stats SET (security_invoker = true);
ALTER VIEW public.documents_with_profiles SET (security_invoker = true);

-- 3. Create secure role assignment function (admin-only)
CREATE OR REPLACE FUNCTION public.assign_user_role(
  target_user_id uuid,
  new_role text,
  assigned_by uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  assigner_role text;
BEGIN
  -- Check if the assigner is an admin
  SELECT role INTO assigner_role FROM public.profiles WHERE id = assigned_by;
  
  IF assigner_role NOT IN ('admin', 'super_admin', 'council') THEN
    RAISE EXCEPTION 'Only administrators can assign roles';
  END IF;
  
  -- Validate the new role exists
  IF NOT EXISTS (SELECT 1 FROM public.role_permissions WHERE role = new_role LIMIT 1) THEN
    RAISE EXCEPTION 'Invalid role specified: %', new_role;
  END IF;
  
  -- Update the user's role
  UPDATE public.profiles 
  SET 
    role = new_role::user_role,
    updated_at = now()
  WHERE id = target_user_id;
  
  -- Log the role change for audit trail
  INSERT INTO public.security_audit_logs (
    user_id, event_type, event_details, organization_id
  ) VALUES (
    target_user_id, 
    'role_assigned',
    jsonb_build_object(
      'new_role', new_role,
      'assigned_by', assigned_by,
      'timestamp', now()
    ),
    (SELECT organization_id FROM public.profiles WHERE id = target_user_id)
  );
  
  RETURN true;
END;
$$;

-- 4. Create function to prevent role escalation during signup
CREATE OR REPLACE FUNCTION public.secure_profile_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Force new users to 'driver' role unless assigned by admin
  IF TG_OP = 'INSERT' THEN
    -- Only allow admin role assignment through secure function
    IF NEW.role NOT IN ('driver') AND auth.role() != 'service_role' THEN
      -- Check if current user is admin and can assign roles
      IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin', 'council')
      ) THEN
        NEW.role = 'driver';
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply the secure profile creation trigger
DROP TRIGGER IF EXISTS secure_profile_creation_trigger ON public.profiles;
CREATE TRIGGER secure_profile_creation_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.secure_profile_creation();

-- 5. Add additional security logging
CREATE OR REPLACE FUNCTION public.log_privilege_escalation_attempt(
  attempted_role text,
  target_user_id uuid DEFAULT auth.uid()
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.security_audit_logs (
    user_id, event_type, event_details, organization_id
  ) VALUES (
    target_user_id,
    'privilege_escalation_attempt',
    jsonb_build_object(
      'attempted_role', attempted_role,
      'blocked_at', now(),
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent',
      'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for'
    ),
    (SELECT organization_id FROM public.profiles WHERE id = target_user_id)
  );
END;
$$;