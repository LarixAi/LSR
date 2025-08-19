-- =====================================================
-- FIX MULTI-ORGANIZATION DEFECT REPORTS SYSTEM
-- =====================================================

-- 1. FIRST, LET'S UNDERSTAND THE CURRENT STATE
SELECT 
    '=== CURRENT STATE ANALYSIS ===' as section,
    'Current State' as check_type,
    'User Profile' as type,
    p.email,
    p.organization_id,
    o.name as organization_name
FROM public.profiles p
LEFT JOIN public.organizations o ON p.organization_id = o.id
WHERE p.email = 'laronelaing3@outlook.com';

-- 2. CHECK IF USER HAS MECHANIC ORGANIZATION LINKS
SELECT 
    '=== MECHANIC ORGANIZATION LINKS ===' as section,
    'Mechanic Links' as check_type,
    COUNT(*) as total_links
FROM public.mechanic_organizations mo
JOIN public.profiles p ON mo.mechanic_id = p.id
WHERE p.email = 'laronelaing3@outlook.com';

-- 3. CREATE MECHANIC ORGANIZATION LINK IF MISSING
INSERT INTO public.mechanic_organizations (mechanic_id, organization_id)
SELECT 
    p.id as mechanic_id,
    p.organization_id
FROM public.profiles p
WHERE p.email = 'laronelaing3@outlook.com'
AND p.role = 'mechanic'
AND NOT EXISTS (
    SELECT 1 FROM public.mechanic_organizations mo 
    WHERE mo.mechanic_id = p.id AND mo.organization_id = p.organization_id
);

-- 4. VERIFY MECHANIC ORGANIZATION LINKS
SELECT 
    '=== VERIFIED MECHANIC LINKS ===' as section,
    'Verified Links' as check_type,
    mo.mechanic_id,
    mo.organization_id,
    p.email as mechanic_email,
    o.name as organization_name
FROM public.mechanic_organizations mo
JOIN public.profiles p ON mo.mechanic_id = p.id
JOIN public.organizations o ON mo.organization_id = o.id
WHERE p.email = 'laronelaing3@outlook.com';

-- 5. CHECK DEFECT REPORTS FOR USER'S ORGANIZATION
SELECT 
    '=== DEFECT REPORTS CHECK ===' as section,
    'Defect Reports' as check_type,
    COUNT(*) as total_defects,
    COUNT(CASE WHEN organization_id = (
        SELECT organization_id FROM public.profiles 
        WHERE email = 'laronelaing3@outlook.com'
    ) THEN 1 END) as user_org_defects
FROM public.defect_reports;

-- 6. CREATE ADDITIONAL TEST DEFECTS FOR USER'S ORGANIZATION
INSERT INTO public.defect_reports (
    defect_number,
    vehicle_id,
    reported_by,
    title,
    description,
    defect_type,
    severity,
    status,
    location,
    reported_date,
    estimated_cost,
    organization_id
) 
SELECT 
    'DEF-2024-TEST-' || LPAD(CAST(COALESCE((SELECT MAX(CAST(SUBSTRING(defect_number FROM 13) AS INTEGER)) FROM public.defect_reports WHERE defect_number LIKE 'DEF-2024-TEST-%'), 0) + 1 AS TEXT), 3, '0'),
    v.id,
    p.id,
    'Test Defect ' || LPAD(CAST(COALESCE((SELECT MAX(CAST(SUBSTRING(defect_number FROM 13) AS INTEGER)) FROM public.defect_reports WHERE defect_number LIKE 'DEF-2024-TEST-%'), 0) + 1 AS TEXT), 3, '0'),
    'This is a test defect created for multi-organization testing.',
    'mechanical',
    'medium',
    'reported',
    'Test location',
    NOW() - INTERVAL '1 hour',
    100.00,
    p.organization_id
FROM public.profiles p
CROSS JOIN public.vehicles v
WHERE p.email = 'laronelaing3@outlook.com'
AND v.organization_id = p.organization_id
AND NOT EXISTS (
    SELECT 1 FROM public.defect_reports dr 
    WHERE dr.defect_number = 'DEF-2024-TEST-001'
)
LIMIT 3;

-- 7. VERIFY DEFECT REPORTS AFTER CREATION
SELECT 
    '=== VERIFIED DEFECT REPORTS ===' as section,
    'Verified Defects' as check_type,
    dr.defect_number,
    dr.title,
    dr.status,
    dr.organization_id,
    dr.created_at
FROM public.defect_reports dr
WHERE dr.organization_id = (
    SELECT organization_id FROM public.profiles 
    WHERE email = 'laronelaing3@outlook.com'
)
ORDER BY dr.created_at DESC;

-- 8. TEST THE EXACT FRONTEND QUERY
SELECT 
    '=== FRONTEND QUERY TEST ===' as section,
    'Frontend Test' as check_type,
    COUNT(*) as total_results
FROM public.defect_reports dr
WHERE dr.organization_id = (
    SELECT organization_id FROM public.profiles 
    WHERE email = 'laronelaing3@outlook.com'
);

-- 9. CHECK RLS POLICIES ARE WORKING
SELECT 
    '=== RLS STATUS ===' as section,
    'RLS Status' as check_type,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'defect_reports';

-- 10. FINAL VERIFICATION
SELECT 
    '=== FINAL VERIFICATION ===' as section,
    'Final Check' as check_type,
    'User Organization ID' as type,
    p.organization_id as id,
    o.name as organization_name,
    (SELECT COUNT(*) FROM public.defect_reports dr WHERE dr.organization_id = p.organization_id) as defect_count
FROM public.profiles p
LEFT JOIN public.organizations o ON p.organization_id = o.id
WHERE p.email = 'laronelaing3@outlook.com';
