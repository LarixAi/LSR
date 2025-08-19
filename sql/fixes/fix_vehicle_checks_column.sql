-- Fix vehicle_checks table column issue
-- This script adds the missing check_date column and ensures proper structure

-- First, let's check what columns currently exist in vehicle_checks
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'vehicle_checks'
ORDER BY column_name;

-- Add the missing check_date column if it doesn't exist
ALTER TABLE public.vehicle_checks ADD COLUMN IF NOT EXISTS check_date DATE DEFAULT CURRENT_DATE;

-- Also add any other missing columns that might be needed
ALTER TABLE public.vehicle_checks ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'passed'));

-- Update the check_date column for existing records if it's null
UPDATE public.vehicle_checks 
SET check_date = COALESCE(check_date, DATE(created_at))
WHERE check_date IS NULL;

-- Verify the table structure after fixes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'vehicle_checks'
ORDER BY column_name;

-- Check if there are any records in the table
SELECT COUNT(*) as total_records FROM public.vehicle_checks;

-- Show a sample record to verify structure
SELECT * FROM public.vehicle_checks LIMIT 1;
