-- =====================================================
-- FINAL DEFECT REPORTS FIX
-- =====================================================

-- 1. CHECK CURRENT STATE
SELECT 
    '=== CURRENT STATE ===' as section,
    'Current Defect Reports' as check_type,
    COUNT(*) as total_defects,
    COUNT(CASE WHEN organization_id = (
        SELECT organization_id FROM public.profiles 
        WHERE email = 'laronelaing3@outlook.com'
    ) THEN 1 END) as user_org_defects
FROM public.defect_reports;

-- 2. SHOW EXISTING DEFECT REPORTS FOR USER'S ORGANIZATION
SELECT 
    '=== EXISTING DEFECT REPORTS ===' as section,
    'Existing Defects' as check_type,
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

-- 3. CHECK MECHANIC ORGANIZATION LINKS
SELECT 
    '=== MECHANIC ORGANIZATION LINKS ===' as section,
    'Mechanic Links' as check_type,
    COUNT(*) as total_links
FROM public.mechanic_organizations mo
JOIN public.profiles p ON mo.mechanic_id = p.id
WHERE p.email = 'laronelaing3@outlook.com';

-- 4. CREATE MECHANIC ORGANIZATION LINK IF MISSING
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

-- 5. VERIFY MECHANIC ORGANIZATION LINKS
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

-- 6. TEST THE EXACT FRONTEND QUERY
SELECT 
    '=== FRONTEND QUERY TEST ===' as section,
    'Frontend Query Test' as check_type,
    COUNT(*) as total_results
FROM public.defect_reports dr
WHERE dr.organization_id = (
    SELECT organization_id FROM public.profiles 
    WHERE email = 'laronelaing3@outlook.com'
);

-- 7. TEST WITH FULL FRONTEND QUERY (INCLUDING JOINS)
SELECT 
    '=== FULL FRONTEND QUERY TEST ===' as section,
    'Full Query Test' as check_type,
    dr.id,
    dr.defect_number,
    dr.title,
    dr.status,
    dr.organization_id,
    v.make,
    v.model,
    p.first_name,
    p.last_name
FROM public.defect_reports dr
LEFT JOIN public.vehicles v ON dr.vehicle_id = v.id
LEFT JOIN public.profiles p ON dr.reported_by = p.id
WHERE dr.organization_id = (
    SELECT organization_id FROM public.profiles 
    WHERE email = 'laronelaing3@outlook.com'
)
ORDER BY dr.created_at DESC;

-- 8. CHECK RLS STATUS
SELECT 
    '=== RLS STATUS ===' as section,
    'RLS Status' as check_type,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'defect_reports';

-- 9. FINAL VERIFICATION
SELECT 
    '=== FINAL VERIFICATION ===' as section,
    'Final Check' as check_type,
    'User Profile' as type,
    p.email,
    p.organization_id,
    o.name as organization_name,
    (SELECT COUNT(*) FROM public.defect_reports dr WHERE dr.organization_id = p.organization_id) as defect_count,
    (SELECT COUNT(*) FROM public.mechanic_organizations mo WHERE mo.mechanic_id = p.id) as mechanic_links
FROM public.profiles p
LEFT JOIN public.organizations o ON p.organization_id = o.id
WHERE p.email = 'laronelaing3@outlook.com';
