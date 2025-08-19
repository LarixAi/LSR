-- =====================================================
-- CHECK TABLE STRUCTURES
-- =====================================================
-- This script will check the actual table structures to fix column name issues

-- 1. CHECK VEHICLE_INSPECTIONS TABLE STRUCTURE
SELECT 
    'vehicle_inspections structure' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'vehicle_inspections'
ORDER BY ordinal_position;

-- 2. CHECK PROFILES TABLE STRUCTURE
SELECT 
    'profiles structure' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. CHECK VEHICLES TABLE STRUCTURE
SELECT 
    'vehicles structure' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'vehicles'
ORDER BY ordinal_position;

-- 4. CHECK DEFECT_REPORTS TABLE STRUCTURE
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

-- 5. CHECK PARTS_INVENTORY TABLE STRUCTURE
SELECT 
    'parts_inventory structure' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'parts_inventory'
ORDER BY ordinal_position;

-- =====================================================
-- CHECK COMPLETE
-- =====================================================
-- This will show us the actual table structures so we can fix the column names
