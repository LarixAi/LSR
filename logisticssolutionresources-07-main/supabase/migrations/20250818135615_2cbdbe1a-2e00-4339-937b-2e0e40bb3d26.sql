-- Create a function to repair authentication issues
CREATE OR REPLACE FUNCTION repair_auth_users()
RETURNS TABLE(profile_id uuid, email text, status text, message text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    profile_record RECORD;
    temp_password TEXT;
BEGIN
    -- Loop through profiles that might not have corresponding auth users
    FOR profile_record IN 
        SELECT p.id, p.email, p.first_name, p.last_name
        FROM profiles p
        WHERE p.email IS NOT NULL
        ORDER BY p.created_at DESC
    LOOP
        -- Check if auth user exists
        IF NOT EXISTS (
            SELECT 1 FROM auth.users 
            WHERE email = profile_record.email
        ) THEN
            -- Profile exists but no auth user - this indicates a problem
            RETURN QUERY SELECT 
                profile_record.id,
                profile_record.email,
                'missing_auth_user'::text,
                'Profile exists but no corresponding auth user found'::text;
        ELSE
            -- Both exist - this is good
            RETURN QUERY SELECT 
                profile_record.id,
                profile_record.email,
                'ok'::text,
                'Profile and auth user both exist'::text;
        END IF;
    END LOOP;
    
    RETURN;
END;
$$;