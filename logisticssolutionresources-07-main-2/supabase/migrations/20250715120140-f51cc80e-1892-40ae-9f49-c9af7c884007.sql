-- Fix the handle_new_user function to properly reference the user_role enum
-- by using the fully qualified type name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    is_main_admin BOOLEAN;
    target_org_id UUID;
    default_org_id UUID;
    user_role_value TEXT;
BEGIN
    -- Check if this is a main admin email
    is_main_admin := NEW.email IN (
        'transport@transentrix.com',
        'transport@logisticssolutionresources.com', 
        'admin@logisticssolutionresources.com'
    );
    
    IF is_main_admin THEN
        -- Create organization for admin users
        INSERT INTO organizations (name, slug, contact_email)
        VALUES (
            COALESCE(NEW.raw_user_meta_data->>'company_name', 'Transport Company'),
            LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'company_name', 'transport-company'), ' ', '-')),
            NEW.email
        )
        RETURNING id INTO target_org_id;
    ELSE
        -- Try to get organization_id from metadata
        target_org_id := (NEW.raw_user_meta_data->>'organization_id')::UUID;
        
        -- If no organization_id provided, get or create a default organization
        IF target_org_id IS NULL THEN
            -- Try to find an existing default organization
            SELECT id INTO default_org_id 
            FROM organizations 
            WHERE slug = 'default-transport-company' 
            LIMIT 1;
            
            -- If no default organization exists, create one
            IF default_org_id IS NULL THEN
                INSERT INTO organizations (name, slug, contact_email)
                VALUES (
                    'Default Transport Company',
                    'default-transport-company',
                    'admin@defaulttransport.com'
                )
                RETURNING id INTO default_org_id;
            END IF;
            
            target_org_id := default_org_id;
        END IF;
    END IF;
    
    -- Get the role from metadata, with proper validation
    user_role_value := COALESCE(NEW.raw_user_meta_data->>'role', 'parent');
    
    -- Validate the role exists in the enum
    IF user_role_value NOT IN ('admin', 'driver', 'mechanic', 'parent', 'council', 'compliance_officer') THEN
        user_role_value := 'parent';
    END IF;
    
    -- Insert profile with organization assignment
    -- Use explicit type casting with the public schema reference
    INSERT INTO profiles (
        id,
        email,
        first_name,
        last_name,
        role,
        employment_status,
        onboarding_status,
        is_active,
        organization_id
    ) VALUES (
        NEW.id,
        NEW.email,
        CASE 
            WHEN is_main_admin THEN 'Transport'
            ELSE COALESCE(NEW.raw_user_meta_data->>'first_name', '')
        END,
        CASE 
            WHEN is_main_admin THEN 'Admin'
            ELSE COALESCE(NEW.raw_user_meta_data->>'last_name', '')
        END,
        CASE 
            WHEN is_main_admin THEN 'admin'::public.user_role
            ELSE user_role_value::public.user_role
        END,
        CASE 
            WHEN is_main_admin THEN 'active'
            ELSE 'applicant'
        END,
        CASE 
            WHEN is_main_admin THEN 'completed'
            ELSE 'pending'
        END,
        true,
        target_org_id
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error and re-raise it
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RAISE;
END;
$$;