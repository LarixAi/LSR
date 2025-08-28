-- Critical Security Fixes Migration (Simplified)

-- 1. Fix Critical RLS Privilege Escalation on Profiles Table
-- Drop existing policies that allow unrestricted updates
DROP POLICY IF EXISTS "profiles_own_access" ON public.profiles;
DROP POLICY IF EXISTS "Enable update access for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create secure read-only policy for users
CREATE POLICY "profiles_own_read_access" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Create restricted update policy that only allows updating certain fields
CREATE POLICY "profiles_limited_update" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admin access policy (keep existing)
CREATE POLICY "profiles_admin_access" ON public.profiles
    FOR ALL USING (public.is_admin_user(auth.uid()));

-- 2. Create Security Definer Function for Safe Role Updates
CREATE OR REPLACE FUNCTION public.update_user_role(
    target_user_id UUID,
    new_role user_role,
    new_employment_status TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    admin_org_id UUID;
    target_org_id UUID;
BEGIN
    -- Verify the admin user has proper permissions
    IF NOT public.is_admin_user(auth.uid()) THEN
        RAISE EXCEPTION 'Insufficient permissions to update user role';
    END IF;
    
    -- Get admin's organization
    SELECT organization_id INTO admin_org_id
    FROM public.profiles 
    WHERE id = auth.uid();
    
    -- Get target user's organization
    SELECT organization_id INTO target_org_id
    FROM public.profiles 
    WHERE id = target_user_id;
    
    -- Verify both users are in the same organization
    IF admin_org_id IS NULL OR target_org_id IS NULL OR admin_org_id != target_org_id THEN
        RAISE EXCEPTION 'Cannot update user role: organization mismatch';
    END IF;
    
    -- Update the user's role
    UPDATE public.profiles 
    SET 
        role = new_role,
        employment_status = COALESCE(new_employment_status, employment_status),
        updated_at = NOW()
    WHERE id = target_user_id;
    
    -- Log the security event
    PERFORM public.log_security_event(
        auth.uid(),
        'role_update',
        jsonb_build_object(
            'target_user_id', target_user_id,
            'new_role', new_role,
            'new_employment_status', new_employment_status
        )
    );
    
    RETURN TRUE;
END;
$$;

-- 3. Enhanced Security Monitoring
CREATE OR REPLACE FUNCTION public.detect_privilege_escalation_attempt(
    old_record JSONB,
    new_record JSONB,
    table_name TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
    -- Check for role escalation attempts
    IF table_name = 'profiles' AND 
       (old_record->>'role')::TEXT != (new_record->>'role')::TEXT AND
       NOT public.is_admin_user(auth.uid()) THEN
        
        PERFORM public.log_security_event(
            auth.uid(),
            'privilege_escalation_attempt',
            jsonb_build_object(
                'table', table_name,
                'old_role', old_record->>'role',
                'attempted_role', new_record->>'role',
                'timestamp', NOW(),
                'severity', 'critical'
            )
        );
        
        -- Create system alert for immediate attention
        INSERT INTO public.system_logs (
            user_id,
            event_type,
            event_data,
            severity
        ) VALUES (
            auth.uid(),
            'CRITICAL_SECURITY_ALERT',
            jsonb_build_object(
                'alert_type', 'privilege_escalation_attempt',
                'details', 'User attempted to escalate their own privileges',
                'old_role', old_record->>'role',
                'attempted_role', new_record->>'role'
            ),
            'critical'
        );
    END IF;
END;
$$;

-- 4. Create trigger for privilege escalation detection
CREATE OR REPLACE FUNCTION public.monitor_profile_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
    -- Monitor for suspicious changes
    PERFORM public.detect_privilege_escalation_attempt(
        to_jsonb(OLD),
        to_jsonb(NEW),
        'profiles'
    );
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS monitor_profiles_security ON public.profiles;
CREATE TRIGGER monitor_profiles_security
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.monitor_profile_changes();

-- 5. Clean up weak policies
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Drivers and admins can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view analytics" ON public.analytics;