-- Fix Function Search Path Security Issue
-- Update create_system_notification function to have secure search path

-- First, let's see all variants of create_system_notification and fix them

-- Fix the main create_system_notification function variants
CREATE OR REPLACE FUNCTION public.create_system_notification(
    p_user_id uuid, 
    p_organization_id uuid, 
    p_title text, 
    p_body text, 
    p_type text DEFAULT 'info'::text, 
    p_priority text DEFAULT 'normal'::text, 
    p_linked_job_id uuid DEFAULT NULL::uuid, 
    p_linked_vehicle_id uuid DEFAULT NULL::uuid, 
    p_action_url text DEFAULT NULL::text, 
    p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.enhanced_notifications (
    user_id, organization_id, title, body, type, priority,
    linked_job_id, linked_vehicle_id, action_url, metadata
  ) VALUES (
    p_user_id, p_organization_id, p_title, p_body, p_type, p_priority,
    p_linked_job_id, p_linked_vehicle_id, p_action_url, p_metadata
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Fix the simpler variant
CREATE OR REPLACE FUNCTION public.create_system_notification(
    p_title text, 
    p_message text, 
    p_type text DEFAULT 'info'::text, 
    p_recipient_id uuid DEFAULT NULL::uuid
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    v_notification_id bigint;
BEGIN
    -- Insert the notification with fully qualified table name
    INSERT INTO public.system_notifications (title, message, type, recipient_id, created_at)
    VALUES (p_title, p_message, p_type, p_recipient_id, NOW())
    RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error or handle it appropriately
        RAISE;
END;
$$;

-- Fix the original simple variant
CREATE OR REPLACE FUNCTION public.create_system_notification(
    p_message text, 
    p_severity text DEFAULT 'info'::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
    -- Your existing function logic
    INSERT INTO public.system_notifications (message, severity, created_at)
    VALUES (p_message, p_severity, NOW());
END;
$$;

-- Also fix any other functions that might have mutable search paths
-- Update handle_new_user function to ensure it has secure search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    is_main_admin BOOLEAN;
    target_org_id UUID;
    default_org_id UUID;
BEGIN
    -- Check if this is a main admin email
    is_main_admin := NEW.email IN (
        'transport@transentrix.com',
        'transport@logisticssolutionresources.com', 
        'admin@logisticssolutionresources.com'
    );
    
    IF is_main_admin THEN
        -- Create organization for admin users
        INSERT INTO public.organizations (name, slug, contact_email)
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
            FROM public.organizations 
            WHERE slug = 'default-transport-company' 
            LIMIT 1;
            
            -- If no default organization exists, create one
            IF default_org_id IS NULL THEN
                INSERT INTO public.organizations (name, slug, contact_email)
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
    
    -- Insert profile with organization assignment
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
        CASE 
            WHEN is_main_admin THEN 'admin'::user_role
            ELSE COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'mechanic'::user_role)
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
END;
$$;