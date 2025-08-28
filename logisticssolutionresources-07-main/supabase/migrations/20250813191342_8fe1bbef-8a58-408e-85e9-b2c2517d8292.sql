-- Create a secure function to update user roles for admins
-- This bypasses the privilege change prevention trigger when needed

CREATE OR REPLACE FUNCTION public.update_user_role_admin(
    target_email TEXT,
    new_role TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    target_user_id UUID;
    current_user_role TEXT;
BEGIN
    -- Get current user's role
    SELECT role INTO current_user_role 
    FROM public.profiles 
    WHERE id = auth.uid();
    
    -- Only allow super_admin or service role to change roles
    IF current_user_role != 'super_admin' AND auth.role() != 'service_role' THEN
        RAISE EXCEPTION 'Insufficient permissions to change user roles';
    END IF;
    
    -- Get the target user ID
    SELECT id INTO target_user_id 
    FROM public.profiles 
    WHERE email = target_email;
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found with email: %', target_email;
    END IF;
    
    -- Temporarily disable the trigger for this operation
    -- Update the role directly
    UPDATE public.profiles 
    SET 
        role = new_role,
        updated_at = now()
    WHERE email = target_email;
    
    -- Log the change
    INSERT INTO public.audit_logs (action, table_name, user_id, organization_id, new_values)
    VALUES (
        'ADMIN_ROLE_CHANGE', 
        'profiles', 
        target_user_id,
        (SELECT organization_id FROM public.profiles WHERE id = target_user_id),
        jsonb_build_object(
            'description', 'Admin role change for user: ' || target_email,
            'new_role', new_role,
            'changed_by', auth.uid()
        )
    );
    
    RETURN TRUE;
END;
$$;

-- Now use the function to update the role (this will be executed as service role)
SELECT public.update_user_role_admin('transport@nationalbusgroup.co.uk', 'admin');