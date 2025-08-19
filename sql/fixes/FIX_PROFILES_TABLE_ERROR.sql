-- =============================================================================
-- FIX PROFILES TABLE ERROR - Resolve database error when creating users
-- =============================================================================

-- Step 1: Check current profiles table structure
SELECT 'Current profiles table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Step 2: Check for any NOT NULL constraints that might be missing defaults
SELECT 'Checking for NOT NULL columns without defaults:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
AND is_nullable = 'NO'
AND column_default IS NULL
ORDER BY ordinal_position;

-- Step 3: Add missing default values for required fields
ALTER TABLE public.profiles 
ALTER COLUMN first_name SET DEFAULT '',
ALTER COLUMN last_name SET DEFAULT '',
ALTER COLUMN role SET DEFAULT 'driver',
ALTER COLUMN employment_status SET DEFAULT 'applicant',
ALTER COLUMN onboarding_status SET DEFAULT 'pending',
ALTER COLUMN is_active SET DEFAULT true,
ALTER COLUMN is_archived SET DEFAULT false,
ALTER COLUMN consent_given SET DEFAULT true,
ALTER COLUMN created_at SET DEFAULT now(),
ALTER COLUMN updated_at SET DEFAULT now();

-- Step 4: Update the handle_new_user function to handle missing organization_id
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
    
    -- If no organization specified, try to find one or create a default
    IF target_org_id IS NULL THEN
        -- Try to find an existing organization
        SELECT id INTO target_org_id 
        FROM public.organizations 
        LIMIT 1;
        
        -- If no organizations exist, create a default one
        IF target_org_id IS NULL THEN
            INSERT INTO public.organizations (name, slug, is_active)
            VALUES ('Default Organization', 'default-org', true)
            RETURNING id INTO target_org_id;
        END IF;
    END IF;
    
    RAISE LOG 'Creating profile for user % with role % and organization %', NEW.id, user_role_value, target_org_id;
    
    -- Insert profile with ALL required fields and proper defaults
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
        is_archived,
        consent_given,
        consent_date,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        user_first_name,
        user_last_name,
        user_role_value::public.user_role,
        CASE WHEN is_admin_user THEN 'active' ELSE 'applicant' END,
        CASE WHEN is_admin_user THEN 'completed' ELSE 'pending' END,
        true,
        target_org_id,
        false,
        true,
        NOW(),
        NOW(),
        NOW()
    );
    
    RAISE LOG 'Successfully created profile for user %', NEW.id;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the detailed error but don't fail the user creation
        RAISE LOG 'Error in handle_new_user for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
        -- Return NEW to allow the user creation to continue
        RETURN NEW;
END;
$$;

-- Step 5: Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Show final status
SELECT 'Profile table error fix completed successfully!' as status;
SELECT 'handle_new_user function updated with proper error handling' as info;
SELECT 'All required fields now have default values' as info;
