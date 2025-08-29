-- Fix security warnings from the dashboard_stats view
-- 1. Remove SECURITY DEFINER behavior from the view
-- 2. Fix function search path issues

-- Drop and recreate the view without SECURITY DEFINER behavior
DROP VIEW IF EXISTS public.dashboard_stats;

-- Create a standard view that relies on RLS policies of underlying tables for security
-- This is safer than using SECURITY DEFINER which could bypass security checks
CREATE VIEW public.dashboard_stats AS
SELECT 
    -- Count active vehicles in user's organization (relies on vehicles table RLS)
    COALESCE((
        SELECT COUNT(*)::bigint 
        FROM public.vehicles
        WHERE status = 'active'
    ), 0) AS active_vehicles,
    
    -- Count active drivers in user's organization (relies on profiles table RLS) 
    COALESCE((
        SELECT COUNT(*)::bigint 
        FROM public.profiles
        WHERE role = 'driver' 
        AND is_active = true
    ), 0) AS active_drivers,
    
    -- Count routes in user's organization (relies on routes table RLS)
    COALESCE((
        SELECT COUNT(*)::bigint 
        FROM public.routes
        WHERE (status = 'active' OR status IS NULL)
    ), 0) AS active_routes,
    
    -- Count active/pending jobs in user's organization (relies on jobs table RLS)
    COALESCE((
        SELECT COUNT(*)::integer 
        FROM public.jobs
        WHERE status IN ('active', 'pending', 'in_progress')
    ), 0) AS active_jobs,
    
    -- Count maintenance alerts in user's organization (relies on compliance_alerts table RLS)
    COALESCE((
        SELECT COUNT(*)::integer 
        FROM public.compliance_alerts
        WHERE status = 'active' 
        AND alert_type = 'maintenance'
    ), 0) AS maintenance_alerts,
    
    -- Count compliance issues in user's organization (relies on compliance_violations table RLS)
    COALESCE((
        SELECT COUNT(*)::integer 
        FROM public.compliance_violations
        WHERE status = 'open'
    ), 0) AS compliance_issues,
    
    -- Count unread notifications for the user (relies on notifications table RLS)
    COALESCE((
        SELECT COUNT(*)::integer 
        FROM public.notifications
        WHERE read_at IS NULL
    ), 0) AS unread_notifications;

-- Fix the function search path issue
DROP FUNCTION IF EXISTS public.get_system_dashboard_stats();

CREATE OR REPLACE FUNCTION public.get_system_dashboard_stats()
RETURNS TABLE(
    total_organizations bigint,
    total_active_vehicles bigint,
    total_active_drivers bigint,
    total_routes bigint,
    total_active_jobs integer,
    total_maintenance_alerts integer,
    total_compliance_issues integer
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = 'public'  -- Fix: Set explicit search path
AS $$
    -- Only super admins can access system-wide statistics
    SELECT 
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND role = 'super_admin'
            ) THEN (SELECT COUNT(*)::bigint FROM public.organizations WHERE is_active = true)
            ELSE 0::bigint
        END,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND role = 'super_admin'
            ) THEN (SELECT COUNT(*)::bigint FROM public.vehicles WHERE status = 'active')
            ELSE 0::bigint
        END,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND role = 'super_admin'
            ) THEN (SELECT COUNT(*)::bigint FROM public.profiles WHERE role = 'driver' AND is_active = true)
            ELSE 0::bigint
        END,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND role = 'super_admin'
            ) THEN (SELECT COUNT(*)::bigint FROM public.routes)
            ELSE 0::bigint
        END,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND role = 'super_admin'
            ) THEN (SELECT COUNT(*)::integer FROM public.jobs WHERE status IN ('active', 'pending', 'in_progress'))
            ELSE 0
        END,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND role = 'super_admin'
            ) THEN (SELECT COUNT(*)::integer FROM public.compliance_alerts WHERE status = 'active' AND alert_type = 'maintenance')
            ELSE 0
        END,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND role = 'super_admin'
            ) THEN (SELECT COUNT(*)::integer FROM public.compliance_violations WHERE status = 'open')
            ELSE 0
        END;
$$;

-- Grant permissions
GRANT SELECT ON public.dashboard_stats TO authenticated;
GRANT SELECT ON public.dashboard_stats TO service_role;

-- Log the security linter fix
INSERT INTO public.audit_logs (action, table_name, user_id, organization_id, new_values)
VALUES (
  'SECURITY_LINTER_FIX', 
  'dashboard_stats', 
  auth.uid(),
  (SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1),
  '{"description": "Fixed security linter warnings for dashboard_stats view", "fixes": ["removed_security_definer_view", "fixed_function_search_path"]}'::jsonb
);