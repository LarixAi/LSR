-- Fix database schema issues causing TypeScript errors

-- Add missing columns to child_profiles table
ALTER TABLE public.child_profiles 
ADD COLUMN IF NOT EXISTS pickup_time TIME,
ADD COLUMN IF NOT EXISTS dropoff_time TIME,
ADD COLUMN IF NOT EXISTS route_id UUID REFERENCES public.routes(id) ON DELETE SET NULL;

-- Ensure child_tracking table has proper structure with UUID child_id
-- First check if we need to convert child_id from bigint to UUID
DO $$
BEGIN
  -- Check if child_tracking.child_id is bigint and convert if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'child_tracking' 
    AND column_name = 'child_id' 
    AND data_type = 'bigint'
  ) THEN
    -- Drop existing foreign key constraints if they exist
    ALTER TABLE public.child_tracking DROP CONSTRAINT IF EXISTS child_tracking_child_id_fkey;
    
    -- Add new UUID column
    ALTER TABLE public.child_tracking ADD COLUMN child_profile_id UUID;
    
    -- Update the new column with UUIDs from child_profiles
    UPDATE public.child_tracking 
    SET child_profile_id = cp.id 
    FROM public.child_profiles cp 
    WHERE cp.id::text = child_tracking.child_id::text;
    
    -- Drop old column and rename new one
    ALTER TABLE public.child_tracking DROP COLUMN child_id;
    ALTER TABLE public.child_tracking RENAME COLUMN child_profile_id TO child_id;
    
    -- Add foreign key constraint
    ALTER TABLE public.child_tracking 
    ADD CONSTRAINT child_tracking_child_id_fkey 
    FOREIGN KEY (child_id) REFERENCES public.child_profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Ensure daily_attendance uses proper child_id type
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'daily_attendance' 
    AND column_name = 'child_id' 
    AND data_type = 'bigint'
  ) THEN
    -- Similar conversion for daily_attendance
    ALTER TABLE public.daily_attendance DROP CONSTRAINT IF EXISTS daily_attendance_child_id_fkey;
    ALTER TABLE public.daily_attendance ADD COLUMN child_profile_id UUID;
    
    UPDATE public.daily_attendance 
    SET child_profile_id = cp.id 
    FROM public.child_profiles cp 
    WHERE cp.id::text = daily_attendance.child_id::text;
    
    ALTER TABLE public.daily_attendance DROP COLUMN child_id;
    ALTER TABLE public.daily_attendance RENAME COLUMN child_profile_id TO child_id;
    
    ALTER TABLE public.daily_attendance 
    ADD CONSTRAINT daily_attendance_child_id_fkey 
    FOREIGN KEY (child_id) REFERENCES public.child_profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create routes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  start_time TIME,
  end_time TIME,
  is_active BOOLEAN DEFAULT true,
  route_type TEXT DEFAULT 'school_transport',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on routes table
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for routes
CREATE POLICY "routes_organization_access" ON public.routes 
FOR ALL USING (organization_id = get_current_user_organization_id_safe());

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_child_profiles_organization_id ON public.child_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_child_profiles_parent_id ON public.child_profiles(parent_id);
CREATE INDEX IF NOT EXISTS idx_child_tracking_child_id ON public.child_tracking(child_id);
CREATE INDEX IF NOT EXISTS idx_child_tracking_timestamp ON public.child_tracking(timestamp);
CREATE INDEX IF NOT EXISTS idx_daily_attendance_child_id ON public.daily_attendance(child_id);
CREATE INDEX IF NOT EXISTS idx_daily_attendance_date ON public.daily_attendance(attendance_date);