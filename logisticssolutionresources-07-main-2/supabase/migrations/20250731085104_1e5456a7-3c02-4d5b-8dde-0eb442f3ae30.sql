-- Let's test if there might be an issue with the organizations table or profile insertion
-- First, let's ensure the organizations table exists and has a default organization

-- Check if organizations table exists and create if needed
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    contact_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ensure there's a default organization
INSERT INTO public.organizations (name, slug, contact_email)
VALUES ('Default Transport Company', 'default-transport-company', 'admin@defaulttransport.com')
ON CONFLICT (slug) DO NOTHING;

-- Let's also make the trigger function more robust and add detailed logging
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    is_main_admin BOOLEAN;
    target_org_id UUID;
    default_org_id UUID;
    user_role_value TEXT;
BEGIN
    RAISE LOG 'handle_new_user triggered for user: %', NEW.id;
    
    -- Check if this is a main admin email
    is_main_admin := NEW.email IN (
        'transport@transentrix.com',
        'transport@logisticssolutionresources.com', 
        'admin@logisticssolutionresources.com'
    );
    
    RAISE LOG 'User % is main admin: %', NEW.email, is_main_admin;
    
    IF is_main_admin THEN
        -- Create organization for admin users
        INSERT INTO public.organizations (name, slug, contact_email)
        VALUES (
            COALESCE(NEW.raw_user_meta_data->>'company_name', 'Transport Company'),
            LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'company_name', 'transport-company'), ' ', '-')),
            NEW.email
        )
        RETURNING id INTO target_org_id;
        RAISE LOG 'Created new organization % for admin user', target_org_id;
    ELSE
        -- Try to get organization_id from metadata
        target_org_id := (NEW.raw_user_meta_data->>'organization_id')::UUID;
        RAISE LOG 'Organization from metadata: %', target_org_id;
        
        -- If no organization_id provided, get default organization
        IF target_org_id IS NULL THEN
            -- Get the default organization (we know it exists now)
            SELECT id INTO target_org_id 
            FROM public.organizations 
            WHERE slug = 'default-transport-company' 
            LIMIT 1;
            
            RAISE LOG 'Using default organization: %', target_org_id;
        END IF;
    END IF;
    
    -- Get the role from metadata, with proper validation
    user_role_value := COALESCE(NEW.raw_user_meta_data->>'role', 'parent');
    
    -- Validate the role exists in the enum
    IF user_role_value NOT IN ('admin', 'driver', 'mechanic', 'parent', 'council', 'compliance_officer') THEN
        user_role_value := 'parent';
    END IF;
    
    RAISE LOG 'Creating profile for user % with role % and organization %', NEW.id, user_role_value, target_org_id;
    
    -- Insert profile with organization assignment - EXPLICITLY USE PUBLIC.PROFILES
    INSERT INTO public.profiles (
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
        user_role_value::public.user_role,
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
    
    RAISE LOG 'Successfully created profile for user %', NEW.id;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the detailed error
        RAISE LOG 'Error in handle_new_user for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
        -- Don't re-raise the exception - let the user creation continue
        RETURN NEW;
END;
$$;

-- Test if the profiles table structure is correct
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;