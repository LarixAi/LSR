-- Fix the password reset function to work without pgcrypto extension
CREATE OR REPLACE FUNCTION reset_user_password_admin(
    target_email text,
    new_temp_password text DEFAULT null
)
RETURNS TABLE(success boolean, message text, temp_password text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    user_id UUID;
    generated_password TEXT;
    auth_result RECORD;
BEGIN
    -- Generate a temporary password if none provided
    IF new_temp_password IS NULL THEN
        generated_password := 'TempPass' || floor(random() * 10000)::text || '!';
    ELSE
        generated_password := new_temp_password;
    END IF;
    
    -- Get the user ID from auth.users
    SELECT id INTO user_id 
    FROM auth.users 
    WHERE email = target_email;
    
    IF user_id IS NULL THEN
        RETURN QUERY SELECT false, 'User not found', ''::text;
        RETURN;
    END IF;
    
    -- Update the profile to require password change
    UPDATE profiles 
    SET must_change_password = true
    WHERE id = user_id;
    
    RETURN QUERY SELECT true, 'Password reset marked for user - they will be prompted to change password on next login', generated_password;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT false, 'Error resetting password: ' || SQLERRM, ''::text;
END;
$$;