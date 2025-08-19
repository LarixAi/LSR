-- =====================================================
-- DEBUG MECHANIC ORGANIZATIONS QUERY
-- =====================================================
-- This script will help us understand why the mechanic isn't seeing their organizations

-- 1. CHECK THE MECHANIC USER
SELECT 
    'Mechanic user check' as check_type,
    id,
    email,
    role,
    organization_id,
    created_at
FROM public.profiles 
WHERE email = 'laronelaing3@outlook.com';

-- 2. CHECK ALL MECHANIC ORGANIZATION REQUESTS FOR THIS USER
SELECT 
    'All requests for mechanic' as check_type,
    mor.id,
    mor.mechanic_id,
    mor.organization_id,
    mor.request_type,
    mor.status,
    mor.requested_by,
    mor.approved_by,
    mor.approved_at,
    mor.created_at,
    -- Mechanic details
    mechanic.email as mechanic_email,
    mechanic.role as mechanic_role,
    -- Organization details
    org.name as organization_name,
    org.slug as organization_slug,
    -- Requester details
    requester.email as requester_email,
    requester.role as requester_role
FROM public.mechanic_organization_requests mor
LEFT JOIN public.profiles mechanic ON mor.mechanic_id = mechanic.id
LEFT JOIN public.organizations org ON mor.organization_id = org.id
LEFT JOIN public.profiles requester ON mor.requested_by = requester.id
WHERE mechanic.email = 'laronelaing3@outlook.com'
ORDER BY mor.created_at DESC;

-- 3. SIMULATE THE FRONTEND QUERY (active organizations)
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

-- 4. CHECK IF THE FUNCTION EXISTS
SELECT 
    'Function check' as check_type,
    'get_available_organizations_for_mechanic' as function_name,
    EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'get_available_organizations_for_mechanic'
        AND routine_schema = 'public'
    ) as function_exists;

-- 5. TEST THE FUNCTION
DO $$
DECLARE
    mechanic_uuid UUID;
    result_count INTEGER;
BEGIN
    -- Get the mechanic's UUID
    SELECT id INTO mechanic_uuid FROM public.profiles WHERE email = 'laronelaing3@outlook.com';
    
    -- Test the function
    SELECT COUNT(*) INTO result_count
    FROM get_available_organizations_for_mechanic(mechanic_uuid);
    
    RAISE NOTICE 'Function test: Found % available organizations for mechanic %', result_count, mechanic_uuid;
END $$;

-- 6. CHECK RLS POLICIES
SELECT 
    'RLS policies check' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'mechanic_organization_requests'
ORDER BY policyname;

-- 7. CHECK IF THE MECHANIC CAN ACCESS THE DATA (RLS test)
DO $$
DECLARE
    mechanic_uuid UUID;
    request_count INTEGER;
BEGIN
    -- Get the mechanic's UUID
    SELECT id INTO mechanic_uuid FROM public.profiles WHERE email = 'laronelaing3@outlook.com';
    
    -- Simulate what the mechanic should see
    SELECT COUNT(*) INTO request_count
    FROM public.mechanic_organization_requests
    WHERE mechanic_id = mechanic_uuid
    AND status IN ('active', 'approved');
    
    RAISE NOTICE 'RLS test: Mechanic % can see % active/approved requests', mechanic_uuid, request_count;
END $$;

-- 8. CHECK ORGANIZATION DATA
SELECT 
    'Organization data check' as check_type,
    id,
    name,
    slug,
    created_at
FROM public.organizations
ORDER BY name;

-- =====================================================
-- DEBUG COMPLETE
-- =====================================================
-- This will help us identify why the frontend isn't showing the organizations
