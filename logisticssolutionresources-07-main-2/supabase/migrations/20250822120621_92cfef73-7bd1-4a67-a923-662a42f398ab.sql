-- Fix child_id type mismatches between tables
-- Convert daily_attendance.child_id from bigint to UUID to match child_profiles.id

-- Step 1: Add a new UUID column to daily_attendance
ALTER TABLE public.daily_attendance 
ADD COLUMN IF NOT EXISTS child_profile_id UUID;

-- Step 2: Update the new column with proper UUID values
-- This assumes we can match based on some relationship or create a mapping
UPDATE public.daily_attendance da
SET child_profile_id = cp.id
FROM public.child_profiles cp
WHERE cp.id::text = da.child_id::text
OR (cp.first_name || ' ' || cp.last_name) = (
  SELECT first_name || ' ' || last_name 
  FROM child_profiles 
  WHERE id::text = da.child_id::text
  LIMIT 1
);

-- Step 3: Drop the old column and rename the new one
ALTER TABLE public.daily_attendance 
DROP COLUMN IF EXISTS child_id CASCADE;

ALTER TABLE public.daily_attendance 
RENAME COLUMN child_profile_id TO child_id;

-- Step 4: Add the foreign key constraint
ALTER TABLE public.daily_attendance 
ADD CONSTRAINT daily_attendance_child_id_fkey 
FOREIGN KEY (child_id) REFERENCES public.child_profiles(id) ON DELETE CASCADE;

-- Step 5: Ensure child_tracking also uses proper UUID type for child_id
-- (Previous migration may have already handled this, but let's be safe)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'child_tracking' 
    AND column_name = 'child_id' 
    AND data_type = 'bigint'
  ) THEN
    -- Add temporary UUID column
    ALTER TABLE public.child_tracking ADD COLUMN IF NOT EXISTS temp_child_id UUID;
    
    -- Update with proper UUIDs
    UPDATE public.child_tracking ct
    SET temp_child_id = cp.id
    FROM public.child_profiles cp
    WHERE cp.id::text = ct.child_id::text;
    
    -- Drop old column and rename
    ALTER TABLE public.child_tracking DROP COLUMN child_id CASCADE;
    ALTER TABLE public.child_tracking RENAME COLUMN temp_child_id TO child_id;
    
    -- Add foreign key
    ALTER TABLE public.child_tracking 
    ADD CONSTRAINT child_tracking_child_id_fkey 
    FOREIGN KEY (child_id) REFERENCES public.child_profiles(id) ON DELETE CASCADE;
  END IF;
END $$;