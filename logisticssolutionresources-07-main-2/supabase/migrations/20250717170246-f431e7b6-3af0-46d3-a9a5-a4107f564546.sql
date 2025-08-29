-- Fix search path security issue for log_vehicle_access function
-- Add immutable search_path to prevent search path injection attacks

CREATE OR REPLACE FUNCTION public.log_vehicle_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    -- Log vehicle access for security monitoring
    PERFORM public.log_audit_trail(
        'vehicles',
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
        'Vehicle ' || TG_OP || ' operation'
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Add comment explaining the security fix
COMMENT ON FUNCTION public.log_vehicle_access() IS 'Vehicle access logging trigger with secure search_path to prevent injection attacks';