-- Fix the audit function call in the trigger
CREATE OR REPLACE FUNCTION public.audit_profiles_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit_trail('profiles'::text, NEW.id, 'INSERT'::text, NULL, to_jsonb(NEW), 'Profile created'::text);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_audit_trail('profiles'::text, NEW.id, 'UPDATE'::text, to_jsonb(OLD), to_jsonb(NEW), 'Profile updated'::text);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_audit_trail('profiles'::text, OLD.id, 'DELETE'::text, to_jsonb(OLD), NULL, 'Profile deleted'::text);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Now fix admin user employment status
UPDATE public.profiles 
SET employment_status = 'active' 
WHERE role = 'admin' AND employment_status = 'applicant';