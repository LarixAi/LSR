
-- Add missing columns to the profiles table that are referenced in the driver creation form
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS termination_date DATE,
ADD COLUMN IF NOT EXISTS cdl_number TEXT,
ADD COLUMN IF NOT EXISTS medical_card_expiry DATE;

-- Update the trigger function to handle the new columns
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    is_admin_email BOOLEAN := FALSE;
    user_role TEXT := 'parent';
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
        medical_card_expiry
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
        END
    );
    
    -- Log the user creation securely
    PERFORM public.log_security_event(
        NEW.id,
        'user_created',
        jsonb_build_object(
            'email', NEW.email,
            'role', user_role,
            'is_admin', is_admin_email
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
$function$;
