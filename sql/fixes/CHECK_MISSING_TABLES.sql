-- Check Missing Tables for Time Management System
-- This script will identify what tables exist and what's missing

-- Check if all required tables exist
SELECT 
    'time_entries' as table_name,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'time_entries'
    ) as exists
UNION ALL
SELECT 
    'daily_rest' as table_name,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'daily_rest'
    ) as exists
UNION ALL
SELECT 
    'weekly_rest' as table_name,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'weekly_rest'
    ) as exists
UNION ALL
SELECT 
    'time_off_requests' as table_name,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'time_off_requests'
    ) as exists;

-- Check table structures
DO $$
BEGIN
    -- Check time_entries table structure
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'time_entries') THEN
        RAISE NOTICE 'time_entries table exists';
        
        -- Check for required columns
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'time_entries' AND column_name = 'entry_date') THEN
            RAISE NOTICE 'time_entries has entry_date column';
        ELSE
            RAISE NOTICE 'time_entries MISSING entry_date column';
        END IF;
        
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'time_entries' AND column_name = 'driving_hours') THEN
            RAISE NOTICE 'time_entries has driving_hours column';
        ELSE
            RAISE NOTICE 'time_entries MISSING driving_hours column';
        END IF;
        
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'time_entries' AND column_name = 'break_hours') THEN
            RAISE NOTICE 'time_entries has break_hours column';
        ELSE
            RAISE NOTICE 'time_entries MISSING break_hours column';
        END IF;
    ELSE
        RAISE NOTICE 'time_entries table MISSING';
    END IF;
    
    -- Check daily_rest table structure
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'daily_rest') THEN
        RAISE NOTICE 'daily_rest table exists';
    ELSE
        RAISE NOTICE 'daily_rest table MISSING';
    END IF;
    
    -- Check weekly_rest table structure
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'weekly_rest') THEN
        RAISE NOTICE 'weekly_rest table exists';
    ELSE
        RAISE NOTICE 'weekly_rest table MISSING';
    END IF;
    
    -- Check time_off_requests table structure
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'time_off_requests') THEN
        RAISE NOTICE 'time_off_requests table exists';
    ELSE
        RAISE NOTICE 'time_off_requests table MISSING';
    END IF;
END $$;

-- Check current data counts
SELECT 
    'time_entries' as table_name,
    COUNT(*) as record_count
FROM public.time_entries
UNION ALL
SELECT 
    'daily_rest' as table_name,
    COUNT(*) as record_count
FROM public.daily_rest
UNION ALL
SELECT 
    'weekly_rest' as table_name,
    COUNT(*) as record_count
FROM public.weekly_rest
UNION ALL
SELECT 
    'time_off_requests' as table_name,
    COUNT(*) as record_count
FROM public.time_off_requests;
