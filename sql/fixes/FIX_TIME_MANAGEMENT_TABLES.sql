-- Fix Time Management Tables - Complete Solution
-- This script will create all missing tables and ensure proper structure

-- 1. Create time_off_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.time_off_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  request_type text NOT NULL DEFAULT 'annual_leave' CHECK (request_type IN ('annual_leave', 'sick_leave', 'personal_leave', 'bereavement_leave', 'maternity_leave', 'paternity_leave', 'other')),
  reason text,
  total_days integer NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by uuid REFERENCES public.profiles(id),
  approved_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for time_off_requests
ALTER TABLE public.time_off_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for time_off_requests
DROP POLICY IF EXISTS "Drivers can view their own time off requests" ON public.time_off_requests;
DROP POLICY IF EXISTS "Drivers can insert their own time off requests" ON public.time_off_requests;
DROP POLICY IF EXISTS "Drivers can update their own time off requests" ON public.time_off_requests;
DROP POLICY IF EXISTS "Organization admins can view all time off requests" ON public.time_off_requests;

CREATE POLICY "Drivers can view their own time off requests"
ON public.time_off_requests FOR SELECT
USING (driver_id = auth.uid());

CREATE POLICY "Drivers can insert their own time off requests"
ON public.time_off_requests FOR INSERT
WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Drivers can update their own time off requests"
ON public.time_off_requests FOR UPDATE
USING (driver_id = auth.uid())
WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Organization admins can view all time off requests"
ON public.time_off_requests FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'council')
  )
);

-- Create indexes for time_off_requests
CREATE INDEX IF NOT EXISTS idx_time_off_requests_driver_id ON public.time_off_requests(driver_id);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_start_date ON public.time_off_requests(start_date);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_status ON public.time_off_requests(status);

-- 2. Ensure time_entries table has all required columns
DO $$
BEGIN
    -- Add entry_date column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'time_entries' AND column_name = 'entry_date') THEN
        ALTER TABLE public.time_entries ADD COLUMN entry_date date DEFAULT CURRENT_DATE;
        RAISE NOTICE 'Added entry_date column to time_entries';
    END IF;
    
    -- Add driving_hours column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'time_entries' AND column_name = 'driving_hours') THEN
        ALTER TABLE public.time_entries ADD COLUMN driving_hours numeric(4,2) DEFAULT 0;
        RAISE NOTICE 'Added driving_hours column to time_entries';
    END IF;
    
    -- Add break_hours column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'time_entries' AND column_name = 'break_hours') THEN
        ALTER TABLE public.time_entries ADD COLUMN break_hours numeric(4,2) DEFAULT 0;
        RAISE NOTICE 'Added break_hours column to time_entries';
    END IF;
    
    -- Add location_clock_in column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'time_entries' AND column_name = 'location_clock_in') THEN
        ALTER TABLE public.time_entries ADD COLUMN location_clock_in text;
        RAISE NOTICE 'Added location_clock_in column to time_entries';
    END IF;
    
    -- Add location_clock_out column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'time_entries' AND column_name = 'location_clock_out') THEN
        ALTER TABLE public.time_entries ADD COLUMN location_clock_out text;
        RAISE NOTICE 'Added location_clock_out column to time_entries';
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'time_entries' AND column_name = 'status') THEN
        ALTER TABLE public.time_entries ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'pending_approval', 'approved', 'rejected'));
        RAISE NOTICE 'Added status column to time_entries';
    END IF;
    
    -- Add entry_type column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'time_entries' AND column_name = 'entry_type') THEN
        ALTER TABLE public.time_entries ADD COLUMN entry_type text DEFAULT 'regular' CHECK (entry_type IN ('regular', 'overtime', 'holiday', 'sick', 'vacation'));
        RAISE NOTICE 'Added entry_type column to time_entries';
    END IF;
    
    -- Add notes column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'time_entries' AND column_name = 'notes') THEN
        ALTER TABLE public.time_entries ADD COLUMN notes text;
        RAISE NOTICE 'Added notes column to time_entries';
    END IF;
    
    -- Add approved_by column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'time_entries' AND column_name = 'approved_by') THEN
        ALTER TABLE public.time_entries ADD COLUMN approved_by uuid REFERENCES public.profiles(id);
        RAISE NOTICE 'Added approved_by column to time_entries';
    END IF;
    
    -- Add approved_at column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'time_entries' AND column_name = 'approved_at') THEN
        ALTER TABLE public.time_entries ADD COLUMN approved_at timestamp with time zone;
        RAISE NOTICE 'Added approved_at column to time_entries';
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'time_entries' AND column_name = 'updated_at') THEN
        ALTER TABLE public.time_entries ADD COLUMN updated_at timestamp with time zone DEFAULT now();
        RAISE NOTICE 'Added updated_at column to time_entries';
    END IF;
END $$;

-- 3. Ensure daily_rest table exists with proper structure
CREATE TABLE IF NOT EXISTS public.daily_rest (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  rest_date date NOT NULL,
  rest_type text DEFAULT 'daily_rest' CHECK (rest_type IN ('daily_rest', 'reduced_rest', 'compensated_rest')),
  duration_hours numeric(4,2) DEFAULT 24,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Ensure unique daily rest per driver per date
  UNIQUE(driver_id, rest_date)
);

-- Enable RLS for daily_rest
ALTER TABLE public.daily_rest ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for daily_rest
DROP POLICY IF EXISTS "Drivers can view their own daily rest" ON public.daily_rest;
DROP POLICY IF EXISTS "Drivers can insert their own daily rest" ON public.daily_rest;
DROP POLICY IF EXISTS "Drivers can update their own daily rest" ON public.daily_rest;
DROP POLICY IF EXISTS "Drivers can delete their own daily rest" ON public.daily_rest;
DROP POLICY IF EXISTS "Organization admins can view all daily rest" ON public.daily_rest;

CREATE POLICY "Drivers can view their own daily rest"
ON public.daily_rest FOR SELECT
USING (driver_id = auth.uid());

CREATE POLICY "Drivers can insert their own daily rest"
ON public.daily_rest FOR INSERT
WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Drivers can update their own daily rest"
ON public.daily_rest FOR UPDATE
USING (driver_id = auth.uid())
WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Drivers can delete their own daily rest"
ON public.daily_rest FOR DELETE
USING (driver_id = auth.uid());

CREATE POLICY "Organization admins can view all daily rest"
ON public.daily_rest FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'council')
  )
);

-- Create indexes for daily_rest
CREATE INDEX IF NOT EXISTS idx_daily_rest_driver_id ON public.daily_rest(driver_id);
CREATE INDEX IF NOT EXISTS idx_daily_rest_rest_date ON public.daily_rest(rest_date);
CREATE INDEX IF NOT EXISTS idx_daily_rest_organization_id ON public.daily_rest(organization_id);

-- 4. Ensure weekly_rest table exists with proper structure
CREATE TABLE IF NOT EXISTS public.weekly_rest (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  week_start_date date NOT NULL,
  week_end_date date NOT NULL,
  rest_start_time timestamp with time zone,
  rest_end_time timestamp with time zone,
  total_rest_hours numeric(4,2) DEFAULT 0,
  rest_type text DEFAULT 'full_weekly_rest' CHECK (rest_type IN ('full_weekly_rest', 'reduced_weekly_rest', 'compensated_rest')),
  compensation_required boolean DEFAULT false,
  compensation_date date,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  -- Ensure unique weekly rest per driver per week
  UNIQUE(driver_id, week_start_date)
);

-- Enable RLS for weekly_rest
ALTER TABLE public.weekly_rest ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for weekly_rest
DROP POLICY IF EXISTS "Drivers can view their own weekly rest" ON public.weekly_rest;
DROP POLICY IF EXISTS "Drivers can insert their own weekly rest" ON public.weekly_rest;
DROP POLICY IF EXISTS "Drivers can update their own weekly rest" ON public.weekly_rest;
DROP POLICY IF EXISTS "Drivers can delete their own weekly rest" ON public.weekly_rest;
DROP POLICY IF EXISTS "Organization admins can view all weekly rest" ON public.weekly_rest;

CREATE POLICY "Drivers can view their own weekly rest"
ON public.weekly_rest FOR SELECT
USING (driver_id = auth.uid());

CREATE POLICY "Drivers can insert their own weekly rest"
ON public.weekly_rest FOR INSERT
WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Drivers can update their own weekly rest"
ON public.weekly_rest FOR UPDATE
USING (driver_id = auth.uid())
WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Drivers can delete their own weekly rest"
ON public.weekly_rest FOR DELETE
USING (driver_id = auth.uid());

CREATE POLICY "Organization admins can view all weekly rest"
ON public.weekly_rest FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'council')
  )
);

-- Create indexes for weekly_rest
CREATE INDEX IF NOT EXISTS idx_weekly_rest_driver_id ON public.weekly_rest(driver_id);
CREATE INDEX IF NOT EXISTS idx_weekly_rest_week_start_date ON public.weekly_rest(week_start_date);
CREATE INDEX IF NOT EXISTS idx_weekly_rest_week_end_date ON public.weekly_rest(week_end_date);
CREATE INDEX IF NOT EXISTS idx_weekly_rest_organization_id ON public.weekly_rest(organization_id);

-- 5. Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
DROP TRIGGER IF EXISTS update_time_entries_updated_at ON public.time_entries;
CREATE TRIGGER update_time_entries_updated_at
    BEFORE UPDATE ON public.time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_daily_rest_updated_at ON public.daily_rest;
CREATE TRIGGER update_daily_rest_updated_at
    BEFORE UPDATE ON public.daily_rest
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_weekly_rest_updated_at ON public.weekly_rest;
CREATE TRIGGER update_weekly_rest_updated_at
    BEFORE UPDATE ON public.weekly_rest
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_time_off_requests_updated_at ON public.time_off_requests;
CREATE TRIGGER update_time_off_requests_updated_at
    BEFORE UPDATE ON public.time_off_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.time_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_rest TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_rest TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.time_off_requests TO authenticated;

-- 7. Clear all existing data to start fresh
DO $$
DECLARE
    current_driver_id uuid;
BEGIN
    -- Get the current authenticated user's ID
    SELECT id INTO current_driver_id
    FROM public.profiles
    WHERE id = auth.uid();

    -- If no driver found, use the first driver in the system
    IF current_driver_id IS NULL THEN
        SELECT id INTO current_driver_id
        FROM public.profiles
        WHERE role = 'driver'
        LIMIT 1;
    END IF;

    RAISE NOTICE 'Clearing all time management data for driver: %', current_driver_id;

    -- Delete all existing data
    DELETE FROM public.time_entries WHERE driver_id = current_driver_id;
    DELETE FROM public.daily_rest WHERE driver_id = current_driver_id;
    DELETE FROM public.weekly_rest WHERE driver_id = current_driver_id;
    DELETE FROM public.time_off_requests WHERE driver_id = current_driver_id;

    RAISE NOTICE 'All time management data cleared successfully';
END $$;

-- 8. Verify the setup
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
