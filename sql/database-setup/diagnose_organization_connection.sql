-- =====================================================
-- DIAGNOSE ORGANIZATION CONNECTION ISSUE
-- =====================================================
-- This script will help us understand what's happening with the organization connection
-- between laronelaing3@outlook.com and transport@nationalbusgroup.co.uk

-- 1. CHECK IF BOTH USERS EXIST
SELECT 
    'User check' as check_type,
    id,
    email,
    first_name,
    last_name,
    role,
    organization_id,
    created_at
FROM public.profiles 
WHERE email IN ('laronelaing3@outlook.com', 'transport@nationalbusgroup.co.uk')
ORDER BY email;

-- 2. CHECK THEIR ORGANIZATIONS
SELECT 
    'Organization check' as check_type,
    p.email,
    p.organization_id,
    o.name as organization_name,
    o.slug as organization_slug
FROM public.profiles p
LEFT JOIN public.organizations o ON p.organization_id = o.id
WHERE p.email IN ('laronelaing3@outlook.com', 'transport@nationalbusgroup.co.uk')
ORDER BY p.email;

-- 3. CHECK MECHANIC ORGANIZATION REQUESTS BETWEEN THESE USERS
SELECT 
    'Mechanic requests check' as check_type,
    mor.id,
    mor.mechanic_id,
    mor.organization_id,
    mor.request_type,
    mor.status,
    mor.message,
    mor.response_message,
    mor.created_at,
    mor.approved_at,
    -- Mechanic details
    mechanic.email as mechanic_email,
    mechanic.first_name as mechanic_first_name,
    mechanic.last_name as mechanic_last_name,
    -- Organization details
    org.name as organization_name,
    -- Requester details
    requester.email as requester_email,
    requester.first_name as requester_first_name,
    requester.last_name as requester_last_name
FROM public.mechanic_organization_requests mor
LEFT JOIN public.profiles mechanic ON mor.mechanic_id = mechanic.id
LEFT JOIN public.organizations org ON mor.organization_id = org.id
LEFT JOIN public.profiles requester ON mor.requested_by = requester.id
WHERE (mechanic.email IN ('laronelaing3@outlook.com', 'transport@nationalbusgroup.co.uk')
   OR requester.email IN ('laronelaing3@outlook.com', 'transport@nationalbusgroup.co.uk'))
ORDER BY mor.created_at DESC;

-- 4. CHECK IF MECHANIC_ORGANIZATION_REQUESTS TABLE EXISTS
SELECT 
    'Table existence check' as check_type,
    'mechanic_organization_requests' as table_name,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'mechanic_organization_requests'
    ) as table_exists;

-- 5. CHECK ALL ORGANIZATION REQUESTS FOR CONTEXT
SELECT 
    'All requests context' as check_type,
    COUNT(*) as total_requests,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_requests,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_requests,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_requests,
    COUNT(CASE WHEN status = 'terminated' THEN 1 END) as terminated_requests
FROM public.mechanic_organization_requests;

-- 6. CHECK USER ROLES AND ORGANIZATIONS
SELECT 
    'User roles and organizations' as check_type,
    p.email,
    p.role,
    p.organization_id,
    o.name as organization_name,
    CASE 
        WHEN p.role = 'mechanic' THEN 'Can request to join organizations'
        WHEN p.role = 'admin' THEN 'Can approve mechanic requests'
        ELSE 'Other role'
    END as capabilities
FROM public.profiles p
LEFT JOIN public.organizations o ON p.organization_id = o.id
WHERE p.email IN ('laronelaing3@outlook.com', 'transport@nationalbusgroup.co.uk')
ORDER BY p.email;

-- 7. CHECK FOR ANY ACTIVE CONNECTIONS
SELECT 
    'Active connections check' as check_type,
    mor.id,
    mor.status,
    mor.request_type,
    mechanic.email as mechanic_email,
    org.name as organization_name,
    requester.email as requester_email,
    mor.created_at,
    mor.approved_at
FROM public.mechanic_organization_requests mor
LEFT JOIN public.profiles mechanic ON mor.mechanic_id = mechanic.id
LEFT JOIN public.organizations org ON mor.organization_id = org.id
LEFT JOIN public.profiles requester ON mor.requested_by = requester.id
WHERE mor.status IN ('active', 'approved')
AND (mechanic.email IN ('laronelaing3@outlook.com', 'transport@nationalbusgroup.co.uk')
   OR requester.email IN ('laronelaing3@outlook.com', 'transport@nationalbusgroup.co.uk'))
ORDER BY mor.created_at DESC;

-- 8. CHECK FOR PENDING REQUESTS
SELECT 
    'Pending requests check' as check_type,
    mor.id,
    mor.status,
    mor.request_type,
    mechanic.email as mechanic_email,
    org.name as organization_name,
    requester.email as requester_email,
    mor.message,
    mor.created_at
FROM public.mechanic_organization_requests mor
LEFT JOIN public.profiles mechanic ON mor.mechanic_id = mechanic.id
LEFT JOIN public.organizations org ON mor.organization_id = org.id
LEFT JOIN public.profiles requester ON mor.requested_by = requester.id
WHERE mor.status = 'pending'
AND (mechanic.email IN ('laronelaing3@outlook.com', 'transport@nationalbusgroup.co.uk')
   OR requester.email IN ('laronelaing3@outlook.com', 'transport@nationalbusgroup.co.uk'))
ORDER BY mor.created_at DESC;

-- =====================================================
-- DIAGNOSIS COMPLETE
-- =====================================================
-- This will show us exactly what's happening with the organization connection
-- between these two specific users
