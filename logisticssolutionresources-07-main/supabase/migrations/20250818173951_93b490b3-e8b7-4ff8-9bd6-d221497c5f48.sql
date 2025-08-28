-- =============================================================================
-- PHASE 1: COMPREHENSIVE ADMIN BACKEND AUTHENTICATION FIX
-- Fix auth/profile mismatches and database integrity issues
-- =============================================================================

-- Step 1: Create helper function to safely find auth users by email
CREATE OR REPLACE FUNCTION public.find_auth_user_by_email(target_email TEXT)
RETURNS TABLE(auth_user_id UUID, user_email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    found_user RECORD;
BEGIN
    -- This function is a placeholder - the actual implementation will be in edge functions
    -- that have access to auth.admin.listUsers()
    RETURN;
END;
$$;

-- Step 2: Audit current auth/profile mismatches
CREATE OR REPLACE FUNCTION public.audit_auth_profile_sync()
RETURNS TABLE(
    profile_id UUID, 
    profile_email TEXT, 
    has_auth_user BOOLEAN, 
    sync_status TEXT,
    recommended_action TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.email,
        -- We can't directly check auth.users from SQL, so we'll mark this for edge function checking
        FALSE as has_auth_user,
        'needs_verification' as sync_status,
        CASE 
            WHEN p.email IS NULL OR p.email = '' THEN 'skip_invalid_email'
            WHEN p.role = 'admin' OR p.role = 'council' THEN 'priority_create_auth_user'
            ELSE 'create_auth_user'
        END as recommended_action
    FROM profiles p
    WHERE p.email IS NOT NULL AND p.email != ''
    ORDER BY 
        CASE 
            WHEN p.role = 'admin' OR p.role = 'council' THEN 1 
            ELSE 2 
        END,
        p.created_at;
END;
$$;

-- Step 3: Create function to handle duplicate email scenarios gracefully
CREATE OR REPLACE FUNCTION public.handle_duplicate_email_creation(
    target_email TEXT,
    target_profile_id UUID,
    temp_password TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    result JSONB;
BEGIN
    -- Mark profile for password change regardless
    UPDATE profiles 
    SET must_change_password = TRUE,
        updated_at = NOW()
    WHERE id = target_profile_id OR email = target_email;
    
    -- Return success status - actual auth user creation will be handled by edge functions
    result := jsonb_build_object(
        'success', TRUE,
        'message', 'Profile marked for password change',
        'profile_id', target_profile_id,
        'email', target_email,
        'action_needed', 'create_or_update_auth_user'
    );
    
    RETURN result;
END;
$$;

-- Step 4: Create comprehensive admin operation logging
CREATE TABLE IF NOT EXISTS public.admin_operation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL,
    target_user_id UUID,
    target_email TEXT,
    operation_type TEXT NOT NULL,
    operation_details JSONB DEFAULT '{}'::jsonb,
    success BOOLEAN NOT NULL,
    error_details TEXT,
    organization_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Enable RLS on admin operation logs
ALTER TABLE public.admin_operation_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can manage logs in their organization
CREATE POLICY "Admins can manage operation logs in their organization"
ON public.admin_operation_logs
FOR ALL
USING (
    organization_id = get_current_user_organization_id_safe() 
    AND is_current_user_admin_safe()
)
WITH CHECK (
    organization_id = get_current_user_organization_id_safe() 
    AND is_current_user_admin_safe()
);

-- Step 5: Create function to log admin operations
CREATE OR REPLACE FUNCTION public.log_admin_operation(
    p_admin_user_id UUID,
    p_target_user_id UUID,
    p_target_email TEXT,
    p_operation_type TEXT,
    p_operation_details JSONB,
    p_success BOOLEAN,
    p_error_details TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    log_id UUID;
    admin_org_id UUID;
BEGIN
    -- Get admin's organization
    SELECT organization_id INTO admin_org_id
    FROM profiles
    WHERE id = p_admin_user_id;
    
    -- Insert log entry
    INSERT INTO admin_operation_logs (
        admin_user_id,
        target_user_id,
        target_email,
        operation_type,
        operation_details,
        success,
        error_details,
        organization_id,
        ip_address,
        user_agent
    ) VALUES (
        p_admin_user_id,
        p_target_user_id,
        p_target_email,
        p_operation_type,
        p_operation_details,
        p_success,
        p_error_details,
        admin_org_id,
        p_ip_address,
        p_user_agent
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;

-- Step 6: Create enhanced password change function that works with existing users
CREATE OR REPLACE FUNCTION public.safe_password_change_request(
    p_target_user_id UUID,
    p_admin_user_id UUID,
    p_new_password TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    target_profile RECORD;
    admin_profile RECORD;
    result JSONB;
    operation_details JSONB;
BEGIN
    -- Verify admin permissions
    SELECT * INTO admin_profile
    FROM profiles
    WHERE id = p_admin_user_id;
    
    IF NOT FOUND OR admin_profile.role NOT IN ('admin', 'council', 'super_admin') THEN
        result := jsonb_build_object(
            'success', FALSE,
            'error', 'Insufficient permissions',
            'code', 'permission_denied'
        );
        
        -- Log failed operation
        PERFORM log_admin_operation(
            p_admin_user_id,
            p_target_user_id,
            NULL,
            'password_change_request',
            jsonb_build_object('reason', 'permission_denied'),
            FALSE,
            'Insufficient admin permissions'
        );
        
        RETURN result;
    END IF;
    
    -- Get target user profile
    SELECT * INTO target_profile
    FROM profiles
    WHERE id = p_target_user_id;
    
    IF NOT FOUND THEN
        result := jsonb_build_object(
            'success', FALSE,
            'error', 'Target user not found',
            'code', 'user_not_found'
        );
        
        PERFORM log_admin_operation(
            p_admin_user_id,
            p_target_user_id,
            NULL,
            'password_change_request',
            jsonb_build_object('reason', 'user_not_found'),
            FALSE,
            'Target user profile not found'
        );
        
        RETURN result;
    END IF;
    
    -- Check organization access
    IF admin_profile.organization_id != target_profile.organization_id THEN
        result := jsonb_build_object(
            'success', FALSE,
            'error', 'Cross-organization access denied',
            'code', 'organization_mismatch'
        );
        
        PERFORM log_admin_operation(
            p_admin_user_id,
            p_target_user_id,
            target_profile.email,
            'password_change_request',
            jsonb_build_object('reason', 'organization_mismatch'),
            FALSE,
            'Admin and target user in different organizations'
        );
        
        RETURN result;
    END IF;
    
    -- Mark profile for password change
    UPDATE profiles
    SET 
        must_change_password = TRUE,
        updated_at = NOW()
    WHERE id = p_target_user_id;
    
    -- Prepare operation details
    operation_details := jsonb_build_object(
        'target_user_id', p_target_user_id,
        'target_email', target_profile.email,
        'target_role', target_profile.role,
        'password_provided', p_new_password IS NOT NULL,
        'organization_id', target_profile.organization_id
    );
    
    -- Log successful operation
    PERFORM log_admin_operation(
        p_admin_user_id,
        p_target_user_id,
        target_profile.email,
        'password_change_request',
        operation_details,
        TRUE,
        NULL
    );
    
    result := jsonb_build_object(
        'success', TRUE,
        'message', 'Password change request prepared successfully',
        'target_user_id', p_target_user_id,
        'target_email', target_profile.email,
        'requires_edge_function', TRUE,
        'operation_details', operation_details
    );
    
    RETURN result;
END;
$$;

SELECT 'Phase 1: Database integrity functions created successfully' as status;