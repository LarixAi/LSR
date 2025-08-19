-- =====================================================
-- CHECK DEFECT_REPORTS TABLE STRUCTURE
-- =====================================================
-- This script will check the actual structure of the defect_reports table

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

-- 2. CHECK IF THERE'S A SEQUENCE FOR DEFECT_NUMBER
SELECT 
    'defect_number sequence check' as check_type,
    sequence_name,
    last_value,
    increment_by
FROM information_schema.sequences 
WHERE sequence_schema = 'public' 
AND sequence_name LIKE '%defect%';

-- 3. CHECK EXISTING DEFECT REPORTS TO SEE DEFECT_NUMBER FORMAT
SELECT 
    'existing defect reports' as check_type,
    defect_number,
    title,
    created_at
FROM public.defect_reports 
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- CHECK COMPLETE
-- =====================================================
