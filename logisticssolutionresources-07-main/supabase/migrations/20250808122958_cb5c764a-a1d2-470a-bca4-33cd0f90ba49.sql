-- Fix search_path security vulnerability in database functions

-- Update update_dbs_checks_updated_at function with secure search_path
CREATE OR REPLACE FUNCTION public.update_dbs_checks_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- Update log_dbs_status_change function with secure search_path  
CREATE OR REPLACE FUNCTION public.log_dbs_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.dbs_status_history (dbs_check_id, status, changed_by, notes)
        VALUES (NEW.id, NEW.status, auth.uid(), 'Status changed from ' || OLD.status || ' to ' || NEW.status);
    END IF;
    RETURN NEW;
END;
$function$;