-- =====================================================
-- CHECK DEFECT_REPORTS CONSTRAINTS
-- =====================================================
-- This script will check the constraints and valid values for defect_reports

-- 1. CHECK DEFECT_REPORTS TABLE STRUCTURE
SELECT 
    'defect_reports structure' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'defect_reports'
ORDER BY ordinal_position;

-- 2. CHECK CHECK CONSTRAINTS ON DEFECT_REPORTS
SELECT 
    'check constraints' as check_type,
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_schema = 'public'
AND constraint_name LIKE '%defect%';

-- 3. CHECK IF THERE'S A SEQUENCE FOR DEFECT_NUMBER (FIXED QUERY)
SELECT 
    'defect_number sequence check' as check_type,
    sequence_name,
    start_value,
    increment_by
FROM information_schema.sequences 
WHERE sequence_schema = 'public' 
AND sequence_name LIKE '%defect%';

-- 4. CHECK EXISTING DEFECT REPORTS TO SEE VALID STATUS VALUES
SELECT 
    'existing defect reports status' as check_type,
    status,
    COUNT(*) as count
FROM public.defect_reports 
GROUP BY status
ORDER BY status;

-- 5. CHECK EXISTING DEFECT REPORTS TO SEE DEFECT_NUMBER FORMAT
SELECT 
    'existing defect reports' as check_type,
    defect_number,
    title,
    status,
    created_at
FROM public.defect_reports 
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- CHECK COMPLETE
-- =====================================================
