-- Fix linter warning: set immutable search_path on trigger function
ALTER FUNCTION public.set_tachograph_issue_org()
  SET search_path = public;