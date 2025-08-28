-- Critical Security Fixes Migration (Final)

-- 1. Drop ALL existing profiles policies first
DROP POLICY IF EXISTS "profiles_own_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_access" ON public.profiles;
DROP POLICY IF EXISTS "Enable update access for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert access for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable delete access for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- 2. Create new secure policies
CREATE POLICY "profiles_own_read_access" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_own_insert" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_limited_update" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_admin_full_access" ON public.profiles
    FOR ALL USING (public.is_admin_user(auth.uid()));

-- 3. Create Security Definer Function for Safe Role Updates
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

-- 4. Enhanced Security Monitoring
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
    END IF;
END;
$$;

-- 5. Create trigger for privilege escalation detection
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