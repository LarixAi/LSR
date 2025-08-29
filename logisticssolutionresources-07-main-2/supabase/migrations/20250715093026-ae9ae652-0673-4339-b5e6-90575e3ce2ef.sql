-- COMPREHENSIVE FIX: All create_system_notification function variants
-- Fix the missing 3-argument variant that's causing the mutable search path error

-- Drop the problematic 3-argument variant and recreate with secure search path
DROP FUNCTION IF EXISTS public.create_system_notification(text, text, uuid);

-- Recreate the missing 3-argument variant with secure search path
CREATE OR REPLACE FUNCTION public.create_system_notification(
    p_message text, 
    p_severity text DEFAULT 'info'::text, 
    p_user_id uuid DEFAULT NULL::uuid
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
    INSERT INTO public.system_notifications (message, severity, user_id, created_at)
    VALUES (p_message, p_severity, p_user_id, NOW())
    RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error appropriately
        RAISE;
END;
$$;

-- Also ensure ALL other variants are properly fixed (redefine to be absolutely sure)
-- 2-argument variant (message, severity)
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
    INSERT INTO public.system_notifications (message, severity, created_at)
    VALUES (p_message, p_severity, NOW());
END;
$$;

-- 4-argument variant (title, message, type, recipient_id)
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
    INSERT INTO public.system_notifications (title, message, type, recipient_id, created_at)
    VALUES (p_title, p_message, p_type, p_recipient_id, NOW())
    RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;

-- 10-argument variant (enhanced notifications)
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