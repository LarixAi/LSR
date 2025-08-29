-- Fix remaining functions with mutable search_path security issues

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- Fix handle_updated_at function  
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- Fix handle_notification_delivery function
CREATE OR REPLACE FUNCTION public.handle_notification_delivery()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Update notification delivery status
    IF TG_OP = 'UPDATE' AND OLD.delivered_at IS NULL AND NEW.delivered_at IS NOT NULL THEN
        -- Mark as delivered
        NEW.status = 'delivered';
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Fix get_unread_notification_count function
CREATE OR REPLACE FUNCTION public.get_unread_notification_count(user_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    unread_count integer;
BEGIN
    SELECT COUNT(*)::integer INTO unread_count
    FROM notification_messages
    WHERE recipient_id = user_uuid
    AND read_at IS NULL;
    
    RETURN COALESCE(unread_count, 0);
END;
$function$;