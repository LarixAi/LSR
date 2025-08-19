-- Fix Security Definer View issue
-- Drop and recreate dashboard_stats view with SECURITY INVOKER
DROP VIEW IF EXISTS public.dashboard_stats;

CREATE VIEW public.dashboard_stats 
WITH (security_invoker = true) AS
SELECT 
    (0)::bigint AS active_vehicles,
    (0)::bigint AS active_drivers,
    (0)::bigint AS active_routes,
    0 AS active_jobs,
    0 AS maintenance_alerts,
    0 AS compliance_issues,
    0 AS unread_notifications;