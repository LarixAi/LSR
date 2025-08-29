-- Fix security warnings for function search paths

-- Fix the mobile auth trigger function
CREATE OR REPLACE FUNCTION public.update_mobile_sessions_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;