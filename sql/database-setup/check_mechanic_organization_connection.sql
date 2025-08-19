-- =====================================================
-- CHECK MECHANIC ORGANIZATION CONNECTION
-- =====================================================
-- This script will check if the mechanic can see the National Bus Group organization

-- 1. CHECK IF THE MECHANIC EXISTS
SELECT 
    'Mechanic check' as check_type,
    id,
    email,
    role,
    organization_id
FROM public.profiles 
WHERE email = 'laronelaing3@outlook.com';

-- 2. CHECK IF NATIONAL BUS GROUP ORGANIZATION EXISTS
SELECT 
    'Organization check' as check_type,
    id,
    name,
    slug,
    type,
    created_at
FROM public.organizations 
WHERE id = 'd1ad845e-8989-4563-9691-dc1b3c86c4ce';

-- 3. CHECK MECHANIC ORGANIZATION REQUESTS
SELECT 
    'Mechanic requests check' as check_type,
    mor.id,
    mor.mechanic_id,
    mor.organization_id,
    mor.request_type,
    mor.status,
    mor.requested_by,
    mor.approved_by,
    mor.approved_at,
    mechanic.email as mechanic_email,
    org.name as organization_name
FROM public.mechanic_organization_requests mor
LEFT JOIN public.profiles mechanic ON mor.mechanic_id = mechanic.id
LEFT JOIN public.organizations org ON mor.organization_id = org.id
WHERE mechanic.email = 'laronelaing3@outlook.com'
ORDER BY mor.created_at DESC;

-- 4. CHECK IF THERE'S A CONNECTION BETWEEN MECHANIC AND NATIONAL BUS GROUP
SELECT 
    'Connection check' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM public.mechanic_organization_requests 
            WHERE mechanic_id = (SELECT id FROM public.profiles WHERE email = 'laronelaing3@outlook.com')
            AND organization_id = 'd1ad845e-8989-4563-9691-dc1b3c86c4ce'
            AND status IN ('active', 'approved')
        ) THEN 'CONNECTION EXISTS'
        ELSE 'NO CONNECTION FOUND'
    END as connection_status;

-- 5. SIMULATE THE FRONTEND QUERY (active organizations)
SELECT 
    'Frontend query simulation' as check_type,
    mor.id,
    mor.mechanic_id,
    mor.organization_id,
    mor.status,
    org.id as org_id,
    org.name as org_name,
    org.slug as org_slug,
    org.created_at as org_created_at
FROM public.mechanic_organization_requests mor
LEFT JOIN public.organizations org ON mor.organization_id = org.id
WHERE mor.mechanic_id = (SELECT id FROM public.profiles WHERE email = 'laronelaing3@outlook.com')
AND mor.status IN ('active', 'approved')
ORDER BY mor.created_at DESC;

-- =====================================================
-- CHECK COMPLETE
-- =====================================================
