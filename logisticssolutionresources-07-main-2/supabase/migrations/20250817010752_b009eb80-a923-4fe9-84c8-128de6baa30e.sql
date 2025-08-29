-- Fix all database functions to have secure search_path settings
-- This addresses the 11 security warnings from the linter

-- Fix function search_path security issues
ALTER FUNCTION public.get_mechanic_organization_preferences(uuid, uuid) SET search_path TO 'public';
ALTER FUNCTION public.get_mechanic_organizations(uuid) SET search_path TO 'public';
ALTER FUNCTION public.get_current_mechanic_organization() SET search_path TO 'public';
ALTER FUNCTION public.switch_mechanic_organization(uuid) SET search_path TO 'public';
ALTER FUNCTION public.update_mechanic_organization_preferences(uuid, jsonb, jsonb, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.auto_record_weekly_rest(uuid, date) SET search_path TO 'public';
ALTER FUNCTION public.auto_record_rest_days(uuid, date, date) SET search_path TO 'public';
ALTER FUNCTION public.analyze_weekly_rest_compliance(uuid, date) SET search_path TO 'public';
ALTER FUNCTION public.generate_vehicle_check_reference(text, date) SET search_path TO 'public';
ALTER FUNCTION public.calculate_vehicle_check_result(uuid) SET search_path TO 'public';
ALTER FUNCTION public.expire_trials() SET search_path TO 'public';
ALTER FUNCTION public.update_daily_usage() SET search_path TO 'public';

-- Ensure all trigger functions have proper search_path
ALTER FUNCTION public.generate_movement_number() SET search_path TO 'public';
ALTER FUNCTION public.generate_order_number() SET search_path TO 'public';
ALTER FUNCTION public.update_part_quantity() SET search_path TO 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path TO 'public';
ALTER FUNCTION public.calculate_time_entry_hours() SET search_path TO 'public';
ALTER FUNCTION public.update_driver_invoices_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_vehicle_tires_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_tire_inventory_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_driver_licenses_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_weekly_rest_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_compliance_alerts_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.check_driver_limit() SET search_path TO 'public';
ALTER FUNCTION public.update_schedules_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_mechanic_sessions_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_mechanic_org_prefs_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_profiles_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_mechanics_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_maintenance_requests_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_daily_rest_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_compliance_violations_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_driver_points_history_updated_at() SET search_path TO 'public';

-- Log the security fix
INSERT INTO public.security_audit_log (event_type, description, metadata)
VALUES (
  'FUNCTION_SECURITY_FIX',
  'Fixed search_path security issues for all database functions',
  jsonb_build_object(
    'action', 'fix_function_search_path',
    'functions_fixed', 32,
    'security_level', 'HARDENED'
  )
);