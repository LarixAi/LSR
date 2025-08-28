-- Secure the dashboard_stats view by replacing it with organization-filtered real data
-- This fixes the vulnerability where the view exposed business intelligence without proper access controls

-- Drop the existing insecure view that returns static data
DROP VIEW IF EXISTS public.dashboard_stats;

-- Create a secure dashboard_stats view that calculates real metrics filtered by organization
-- This view will only show data for the user's organization, preventing data leakage
CREATE VIEW public.dashboard_stats AS
SELECT 
    -- Count active vehicles in user's organization
    COALESCE((
        SELECT COUNT(*)::bigint 
        FROM public.vehicles v 
        JOIN public.profiles p ON p.organization_id = v.organization_id
        WHERE p.id = auth.uid() 
        AND v.status = 'active'
    ), 0) AS active_vehicles,
    
    -- Count active drivers in user's organization  
    COALESCE((
        SELECT COUNT(*)::bigint 
        FROM public.profiles p1 
        JOIN public.profiles p2 ON p1.organization_id = p2.organization_id
        WHERE p2.id = auth.uid() 
        AND p1.role = 'driver' 
        AND p1.is_active = true
    ), 0) AS active_drivers,
    
    -- Count active routes in user's organization
    COALESCE((
        SELECT COUNT(*)::bigint 
        FROM public.routes r
        JOIN public.profiles p ON p.organization_id = r.organization_id  
        WHERE p.id = auth.uid() 
        AND r.is_active = true
    ), 0) AS active_routes,
    
    -- Count active jobs in user's organization
    COALESCE((
        SELECT COUNT(*)::integer 
        FROM public.jobs j
        JOIN public.profiles p ON p.organization_id = j.organization_id
        WHERE p.id = auth.uid() 
        AND j.status = 'active'
    ), 0) AS active_jobs,
    
    -- Count maintenance alerts in user's organization
    COALESCE((
        SELECT COUNT(*)::integer 
        FROM public.compliance_alerts ca
        JOIN public.profiles p ON p.organization_id = ca.organization_id
        WHERE p.id = auth.uid() 
        AND ca.status = 'active' 
        AND ca.alert_type = 'maintenance'
    ), 0) AS maintenance_alerts,
    
    -- Count compliance issues in user's organization
    COALESCE((
        SELECT COUNT(*)::integer 
        FROM public.compliance_violations cv
        JOIN public.profiles p ON p.organization_id = cv.organization_id
        WHERE p.id = auth.uid() 
        AND cv.status = 'open'
    ), 0) AS compliance_issues,
    
    -- Count unread notifications for the user (user-specific, not organization-wide)
    COALESCE((
        SELECT COUNT(*)::integer 
        FROM public.notifications n
        WHERE n.user_id = auth.uid() 
        AND n.read_at IS NULL
    ), 0) AS unread_notifications;

-- Grant appropriate permissions to the view
-- Only authenticated users can access this view, and they'll only see their organization's data
GRANT SELECT ON public.dashboard_stats TO authenticated;
GRANT SELECT ON public.dashboard_stats TO service_role;

-- Create a security definer function for super admins to view system-wide stats
-- This provides a secure way for system administrators to monitor overall system health
CREATE OR REPLACE FUNCTION public.get_system_dashboard_stats()
RETURNS TABLE(
    total_organizations bigint,
    total_active_vehicles bigint,
    total_active_drivers bigint,
    total_active_routes bigint,
    total_active_jobs integer,
    total_maintenance_alerts integer,
    total_compliance_issues integer
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
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
            ) THEN (SELECT COUNT(*)::bigint FROM public.routes WHERE is_active = true)
            ELSE 0::bigint
        END,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND role = 'super_admin'
            ) THEN (SELECT COUNT(*)::integer FROM public.jobs WHERE status = 'active')
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

-- Log the security fix
INSERT INTO public.audit_logs (action, table_name, user_id, organization_id, new_values)
VALUES (
  'SECURITY_FIX', 
  'dashboard_stats', 
  auth.uid(),
  (SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1),
  '{"description": "Replaced insecure dashboard_stats view with organization-filtered secure view to prevent business intelligence theft", "vulnerability": "PUBLIC_DASHBOARD_STATS", "change_type": "view_replacement"}'::jsonb
);