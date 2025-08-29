-- Create membership record for admin user to enable driver creation
-- Insert membership for current admin user if not exists
INSERT INTO public.memberships (user_id, organization_id, role, status, created_by)
SELECT 
    p.id,
    p.organization_id,
    'admin',
    'active',
    p.id
FROM public.profiles p
WHERE p.role IN ('admin', 'council', 'super_admin', 'compliance_officer')
    AND p.organization_id IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM public.memberships m 
        WHERE m.user_id = p.id 
        AND m.organization_id = p.organization_id
    );