-- =====================================================
-- TEST MECHANIC ACCESS TO ORGANIZATION DATA
-- =====================================================
-- This script will test if the mechanic can access their organization data

-- 1. TEST BASIC ACCESS TO MECHANIC ORGANIZATION REQUESTS
SELECT 
    'Basic access test' as test_type,
    COUNT(*) as total_requests,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_requests,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_requests
FROM public.mechanic_organization_requests
WHERE mechanic_id = (SELECT id FROM public.profiles WHERE email = 'laronelaing3@outlook.com');

-- 2. TEST THE EXACT FRONTEND QUERY
SELECT 
    'Frontend query test' as test_type,
    mor.id,
    mor.status,
    mor.mechanic_id,
    mor.organization_id,
    org.name as organization_name,
    org.slug as organization_slug
FROM public.mechanic_organization_requests mor
LEFT JOIN public.organizations org ON mor.organization_id = org.id
WHERE mor.mechanic_id = (SELECT id FROM public.profiles WHERE email = 'laronelaing3@outlook.com')
AND mor.status IN ('active', 'approved')
ORDER BY mor.created_at DESC;

-- 3. TEST ORGANIZATION ACCESS
SELECT 
    'Organization access test' as test_type,
    o.id,
    o.name,
    o.slug,
    o.created_at
FROM public.organizations o
WHERE o.id IN (
    SELECT mor.organization_id 
    FROM public.mechanic_organization_requests mor
    WHERE mor.mechanic_id = (SELECT id FROM public.profiles WHERE email = 'laronelaing3@outlook.com')
    AND mor.status IN ('active', 'approved')
)
ORDER BY o.name;

-- 4. TEST VEHICLE ACCESS (if vehicles exist)
SELECT 
    'Vehicle access test' as test_type,
    COUNT(*) as total_vehicles
FROM public.vehicles v
WHERE v.organization_id IN (
    SELECT mor.organization_id 
    FROM public.mechanic_organization_requests mor
    WHERE mor.mechanic_id = (SELECT id FROM public.profiles WHERE email = 'laronelaing3@outlook.com')
    AND mor.status IN ('active', 'approved')
);

-- 5. TEST WORK ORDER ACCESS (if work orders exist)
SELECT 
    'Work order access test' as test_type,
    COUNT(*) as total_work_orders
FROM public.defect_reports dr
WHERE dr.organization_id IN (
    SELECT mor.organization_id 
    FROM public.mechanic_organization_requests mor
    WHERE mor.mechanic_id = (SELECT id FROM public.profiles WHERE email = 'laronelaing3@outlook.com')
    AND mor.status IN ('active', 'approved')
);

-- 6. SIMULATE THE REACT QUERY CACHE KEY
SELECT 
    'React Query cache key test' as test_type,
    'active-mechanic-organizations' as cache_key,
    (SELECT id FROM public.profiles WHERE email = 'laronelaing3@outlook.com') as mechanic_id,
    COUNT(*) as result_count
FROM public.mechanic_organization_requests mor
LEFT JOIN public.organizations org ON mor.organization_id = org.id
WHERE mor.mechanic_id = (SELECT id FROM public.profiles WHERE email = 'laronelaing3@outlook.com')
AND mor.status IN ('active', 'approved');

-- =====================================================
-- TEST COMPLETE
-- =====================================================
-- This will show us if the mechanic can access their data
-- If any of these queries return 0 results, that's the issue
