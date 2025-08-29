-- Add missing columns that are referenced in the TypeScript code
ALTER TABLE public.child_profiles 
ADD COLUMN IF NOT EXISTS pickup_time TIME,
ADD COLUMN IF NOT EXISTS dropoff_time TIME,
ADD COLUMN IF NOT EXISTS school_name TEXT;