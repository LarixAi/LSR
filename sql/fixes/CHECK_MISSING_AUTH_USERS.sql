-- Check for users that exist in profiles but not in Auth
-- This will help identify which users need to be created in Auth

-- First, let's see all profiles
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    organization_id,
    created_at
FROM public.profiles 
ORDER BY created_at DESC;

-- Now let's check if we can get any Auth user info
-- Note: This will only work if you have admin access to Auth
-- The actual Auth user check needs to be done via the Admin API

-- Let's also check the organization structure
SELECT 
    o.id as org_id,
    o.name as org_name,
    COUNT(p.id) as member_count,
    STRING_AGG(p.role, ', ') as roles
FROM public.organizations o
LEFT JOIN public.profiles p ON o.id = p.organization_id
GROUP BY o.id, o.name
ORDER BY o.name;

-- Check for any orphaned profiles (no organization)
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    organization_id,
    created_at
FROM public.profiles 
WHERE organization_id IS NULL
ORDER BY created_at DESC;

