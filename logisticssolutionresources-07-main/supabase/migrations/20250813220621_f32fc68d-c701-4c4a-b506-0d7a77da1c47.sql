-- Fix Security Definer View vulnerabilities
-- Drop existing problematic views
DROP VIEW IF EXISTS public.dashboard_stats;
DROP VIEW IF EXISTS public.documents_with_profiles;

-- Recreate dashboard_stats view with security_invoker = true
CREATE VIEW public.dashboard_stats
WITH (security_invoker = true)
AS
SELECT 
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'driver' AND is_active = true AND organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )) AS active_drivers,
    
    (SELECT COUNT(*) FROM public.vehicles WHERE status = 'active' AND organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )) AS active_vehicles,
    
    (SELECT COUNT(*) FROM public.routes WHERE status = 'active' AND organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )) AS active_routes,
    
    (SELECT COUNT(*) FROM public.jobs WHERE status IN ('pending', 'in_progress') AND organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )) AS active_jobs,
    
    (SELECT COUNT(*) FROM public.compliance_violations WHERE status = 'open' AND organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )) AS compliance_issues,
    
    (SELECT COUNT(*) FROM public.vehicle_maintenance WHERE status IN ('pending', 'overdue') AND organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )) AS maintenance_alerts,
    
    0 AS unread_notifications;

-- Recreate documents_with_profiles view with security_invoker = true
CREATE VIEW public.documents_with_profiles
WITH (security_invoker = true)
AS
SELECT 
    d.id,
    d.name,
    d.type,
    d.file_path,
    d.file_size,
    d.category,
    d.status,
    d.expiry_date,
    d.uploaded_at,
    d.upload_date,
    d.organization_id,
    d.related_entity_type,
    d.related_entity_id,
    CASE 
        WHEN d.related_entity_type = 'driver' AND d.related_entity_id IS NOT NULL THEN
            jsonb_build_object(
                'id', p.id,
                'first_name', p.first_name,
                'last_name', p.last_name,
                'email', p.email,
                'role', p.role
            )
        ELSE NULL
    END AS profiles
FROM public.documents d
LEFT JOIN public.profiles p ON (d.related_entity_type = 'driver' AND d.related_entity_id = p.id)
WHERE d.organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
);