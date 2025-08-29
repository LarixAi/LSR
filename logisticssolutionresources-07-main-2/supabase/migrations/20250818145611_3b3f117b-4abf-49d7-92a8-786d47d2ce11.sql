-- FINAL SECURITY FIXES: Fix remaining functions and update triggers

-- Fix remaining functions that still need search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
        user_role_value::user_role,
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
$function$;

CREATE OR REPLACE FUNCTION public.get_user_organizations()
 RETURNS SETOF uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
    SELECT organization_id 
    FROM public.memberships 
    WHERE user_id = auth.uid() 
    AND status = 'active';
$function$;

CREATE OR REPLACE FUNCTION public.get_user_roles_in_organization(org_id uuid)
 RETURNS SETOF text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
    SELECT role 
    FROM public.memberships 
    WHERE user_id = auth.uid() 
    AND organization_id = org_id 
    AND status = 'active';
$function$;

CREATE OR REPLACE FUNCTION public.has_role_in_organization(org_id uuid, required_role text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
    SELECT EXISTS (
        SELECT 1 
        FROM public.memberships 
        WHERE user_id = auth.uid() 
        AND organization_id = org_id 
        AND role = required_role 
        AND status = 'active'
    );
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_in_any_organization()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
    SELECT EXISTS (
        SELECT 1 
        FROM public.memberships 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'super_admin', 'council') 
        AND status = 'active'
    );
$function$;

CREATE OR REPLACE FUNCTION public.get_user_primary_organization()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
    SELECT default_organization_id 
    FROM public.profiles 
    WHERE id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.get_available_organizations_for_mechanic(mechanic_uuid uuid)
 RETURNS TABLE(id uuid, name text, slug text, type text, is_active boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT o.id, o.name, o.slug, o.type, o.is_active
    FROM public.organizations o
    WHERE o.is_active = true
    AND o.id NOT IN (
        SELECT mor.organization_id 
        FROM public.mechanic_organization_requests mor
        WHERE mor.mechanic_id = mechanic_uuid
        AND mor.status IN ('pending', 'approved', 'active')
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_profile_exists(user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = user_id);
$function$;

CREATE OR REPLACE FUNCTION public.reset_user_password_admin(target_email text, new_temp_password text DEFAULT NULL::text)
 RETURNS TABLE(success boolean, message text, temp_password text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.repair_auth_users()
 RETURNS TABLE(profile_id uuid, email text, status text, message text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
    profile_record RECORD;
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
            SELECT 1 FROM auth.users au
            WHERE au.email = profile_record.email
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
$function$;

-- Fix all remaining trigger functions
CREATE OR REPLACE FUNCTION public.update_driver_invoices_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_vehicle_tires_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_driver_licenses_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_weekly_rest_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;