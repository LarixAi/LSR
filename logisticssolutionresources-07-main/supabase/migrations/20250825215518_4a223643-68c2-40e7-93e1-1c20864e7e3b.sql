-- Fix function search path warnings for newly created functions
-- This ensures functions have a fixed search path for security

ALTER FUNCTION public.get_latest_agreement_version(TEXT) SET search_path = public;
ALTER FUNCTION public.check_user_agreement_status(UUID) SET search_path = public;
ALTER FUNCTION public.create_document_notification() SET search_path = public;