-- Fix search path security issue for update_tachograph_devices_updated_at function
CREATE OR REPLACE FUNCTION public.update_tachograph_devices_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;