
-- Fix organization creation RLS policies
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;

-- Allow authenticated users to create organizations during signup/setup
CREATE POLICY "Allow organization creation during setup"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Update the organization creation function to handle RLS properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_admin_email BOOLEAN := FALSE;
    user_role TEXT := 'parent';
    requires_password_change BOOLEAN := FALSE;
    target_org_id UUID;
BEGIN
    -- Check if this is a pre-approved admin email
    IF NEW.email IN (
        'transport@transentrix.com',
        'transport@logisticssolutionresources.com',
        'admin@logisticssolutionresources.com'
    ) THEN
        is_admin_email := TRUE;
        user_role := 'admin';
        
        -- Create organization for admin users
        INSERT INTO public.organizations (name, slug, contact_email)
        VALUES (
            COALESCE(NEW.raw_user_meta_data->>'company_name', 'Transport Company'),
            LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'company_name', 'transport-company'), ' ', '-')),
            NEW.email
        )
        RETURNING id INTO target_org_id;
    ELSE
        user_role := COALESCE((NEW.raw_user_meta_data->>'role'), 'parent');
        target_org_id := (NEW.raw_user_meta_data->>'organization_id')::UUID;
        
        -- If role is driver and created by admin, require password change
        IF user_role = 'driver' AND (NEW.raw_user_meta_data->>'created_by_admin')::boolean = TRUE THEN
            requires_password_change := TRUE;
        END IF;
    END IF;
    
    -- Insert profile with organization assignment
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
        password_changed_at,
        organization_id
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
        END,
        target_org_id
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;
