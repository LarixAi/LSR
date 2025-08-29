-- Security Fixes Phase 3b: Fix Remaining Function Search Path Issues

-- Find and fix remaining functions with mutable search paths
-- These functions need to have SET search_path added

-- 1. Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER 
 SET search_path TO 'public'
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

-- 2. Fix other critical functions that might have mutable search paths
CREATE OR REPLACE FUNCTION public.log_security_event(event_type text, event_details jsonb DEFAULT '{}'::jsonb, severity text DEFAULT 'info'::text, user_id uuid DEFAULT auth.uid(), ip_address inet DEFAULT NULL::inet)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  log_id uuid;
  user_org_id uuid;
BEGIN
  -- Get user organization
  SELECT organization_id INTO user_org_id
  FROM profiles
  WHERE id = user_id;
  
  -- Insert security log
  INSERT INTO admin_operation_logs (
    admin_user_id,
    operation_type,
    operation_details,
    success,
    organization_id,
    ip_address
  ) VALUES (
    user_id,
    'security_event',
    jsonb_build_object(
      'event_type', event_type,
      'details', event_details,
      'severity', severity,
      'timestamp', extract(epoch from now())
    ),
    true,
    user_org_id,
    ip_address
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;

-- 3. Fix check_auth_rate_limit function
CREATE OR REPLACE FUNCTION public.check_auth_rate_limit(user_identifier text, max_attempts integer DEFAULT 5, window_minutes integer DEFAULT 15)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  attempt_count integer;
BEGIN
  -- Count recent attempts
  SELECT COUNT(*) INTO attempt_count
  FROM admin_operation_logs
  WHERE operation_details->>'user_identifier' = user_identifier
  AND operation_type IN ('password_reset_request', 'login_attempt')
  AND created_at > now() - (window_minutes || ' minutes')::interval;
  
  RETURN attempt_count < max_attempts;
END;
$function$;

-- 4. Fix validate_password_complexity function
CREATE OR REPLACE FUNCTION public.validate_password_complexity(password text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Password must be at least 12 characters
  IF LENGTH(password) < 12 THEN
    RETURN false;
  END IF;
  
  -- Must contain uppercase letter
  IF password !~ '[A-Z]' THEN
    RETURN false;
  END IF;
  
  -- Must contain lowercase letter  
  IF password !~ '[a-z]' THEN
    RETURN false;
  END IF;
  
  -- Must contain number
  IF password !~ '[0-9]' THEN
    RETURN false;
  END IF;
  
  -- Must contain special character
  IF password !~ '[^A-Za-z0-9]' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$function$;