-- Just update the handle_new_user function to fix new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    is_admin_user BOOLEAN;
    target_org_id UUID;
    user_role_value TEXT;
    user_first_name TEXT;
    user_last_name TEXT;
BEGIN
    -- Extract user details from metadata
    user_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1));
    user_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
    
    -- Check for admin emails that should get special treatment
    is_admin_user := NEW.email IN (
        'laronelaing19@outlook.com',
        'transport@transentrix.com',
        'transport@logisticssolutionresources.com', 
        'admin@logisticssolutionresources.com',
        'transport@nationalbusgroup.co.uk',
        'transportbusgroup@gmail.com'
    );
    
    -- Get role from metadata with proper defaults based on user type
    user_role_value := COALESCE(NEW.raw_user_meta_data->>'role', 
        CASE WHEN is_admin_user THEN 'admin' ELSE 'driver' END
    );
    
    -- Validate the role exists in the enum
    IF user_role_value NOT IN ('admin', 'driver', 'mechanic', 'parent', 'council', 'compliance_officer') THEN
        user_role_value := 'driver';
    END IF;
    
    -- Get organization ID from metadata or find/create appropriate organization
    target_org_id := (NEW.raw_user_meta_data->>'organization_id')::UUID;
    
    IF target_org_id IS NULL THEN
        IF is_admin_user THEN
            -- Create organization for admin users
            INSERT INTO public.organizations (name, slug, contact_email, created_at)
            VALUES (
                COALESCE(NEW.raw_user_meta_data->>'company_name', 'Transport Solutions'),
                LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'company_name', 'transport-solutions'), ' ', '-')),
                NEW.email,
                now()
            )
            RETURNING id INTO target_org_id;
        ELSE
            -- For regular users, find an existing organization or assign to default
            SELECT id INTO target_org_id 
            FROM public.organizations 
            WHERE slug = 'transport-solutions' 
            LIMIT 1;
            
            -- If no organization exists, create a default one
            IF target_org_id IS NULL THEN
                INSERT INTO public.organizations (name, slug, contact_email, created_at)
                VALUES (
                    'Transport Solutions',
                    'transport-solutions',
                    'admin@transportsolutions.com',
                    now()
                )
                RETURNING id INTO target_org_id;
            END IF;
        END IF;
    END IF;
    
    -- Insert profile with proper user-friendly defaults
    INSERT INTO public.profiles (
        id,
        email,
        first_name,
        last_name,
        role,
        employment_status,
        onboarding_status,
        is_active,
        organization_id,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        CASE 
            WHEN user_first_name = '' THEN split_part(NEW.email, '@', 1)
            ELSE user_first_name
        END,
        user_last_name,
        user_role_value::user_role,
        'active',  -- All new users get active status instead of applicant
        'in_progress',  -- Better default than pending
        true,
        target_org_id,
        now(),
        now()
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error and re-raise it
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RAISE;
END;
$$;