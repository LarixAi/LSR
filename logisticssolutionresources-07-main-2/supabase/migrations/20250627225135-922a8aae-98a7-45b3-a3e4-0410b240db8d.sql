
-- Add a column to track if user needs to change password on first login
ALTER TABLE public.profiles 
ADD COLUMN must_change_password BOOLEAN DEFAULT FALSE;

-- Add a column to track when password was last changed
ALTER TABLE public.profiles 
ADD COLUMN password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create a function to check if password change is required
CREATE OR REPLACE FUNCTION public.check_password_change_required(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
    IF user_uuid IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN (
        SELECT COALESCE(must_change_password, FALSE)
        FROM public.profiles 
        WHERE id = user_uuid 
        LIMIT 1
    );
END;
$$;

-- Update the handle_new_user function to set must_change_password for admin-created drivers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_admin_email BOOLEAN := FALSE;
    user_role TEXT := 'parent';
    requires_password_change BOOLEAN := FALSE;
BEGIN
    -- Check if this is a pre-approved admin email
    IF NEW.email IN (
        'transport@transentrix.com',
        'transport@logisticssolutionresources.com',
        'admin@logisticssolutionresources.com'
    ) THEN
        is_admin_email := TRUE;
        user_role := 'admin';
    ELSE
        user_role := COALESCE((NEW.raw_user_meta_data->>'role'), 'parent');
        -- If role is driver and created by admin, require password change
        IF user_role = 'driver' AND (NEW.raw_user_meta_data->>'created_by_admin')::boolean = TRUE THEN
            requires_password_change := TRUE;
        END IF;
    END IF;
    
    -- Insert profile with secure defaults
    INSERT INTO public.profiles (
        id,
        email,
        first_name,
        last_name,
        phone,
        address,
        city,
        state,
        zip_code,
        role,
        employment_status,
        onboarding_status,
        cdl_number,
        medical_card_expiry,
        must_change_password,
        password_changed_at
    ) VALUES (
        NEW.id,
        NEW.email,
        CASE 
            WHEN is_admin_email THEN 'Transport'
            ELSE COALESCE(NEW.raw_user_meta_data->>'first_name', '')
        END,
        CASE 
            WHEN is_admin_email THEN 'Admin'
            ELSE COALESCE(NEW.raw_user_meta_data->>'last_name', '')
        END,
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'address',
        NEW.raw_user_meta_data->>'city',
        NEW.raw_user_meta_data->>'state',
        NEW.raw_user_meta_data->>'zip_code',
        user_role,
        CASE 
            WHEN is_admin_email THEN 'active'
            ELSE 'applicant'
        END,
        CASE 
            WHEN is_admin_email THEN 'completed'
            ELSE 'pending'
        END,
        NEW.raw_user_meta_data->>'cdl_number',
        CASE 
            WHEN NEW.raw_user_meta_data->>'medical_card_expiry' IS NOT NULL 
            THEN (NEW.raw_user_meta_data->>'medical_card_expiry')::DATE
            ELSE NULL
        END,
        requires_password_change,
        CASE 
            WHEN requires_password_change THEN NULL
            ELSE NOW()
        END
    );
    
    -- Log the user creation securely
    PERFORM public.log_security_event(
        NEW.id,
        'user_created',
        jsonb_build_object(
            'email', NEW.email,
            'role', user_role,
            'is_admin', is_admin_email,
            'requires_password_change', requires_password_change
        )
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't prevent user creation
        PERFORM public.log_security_event(
            NEW.id,
            'user_creation_error',
            jsonb_build_object('error', SQLERRM)
        );
        RAISE;
END;
$$;
