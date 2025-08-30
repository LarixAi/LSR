-- Fix Missing Tables - Complete Solution
-- This script creates all missing tables that are causing 400 errors

-- 1. Create time_entries table
CREATE TABLE IF NOT EXISTS public.time_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  clock_in_time time,
  clock_out_time time,
  break_start_time time,
  break_end_time time,
  total_hours numeric(4,2) DEFAULT 0,
  overtime_hours numeric(4,2) DEFAULT 0,
  break_hours numeric(4,2) DEFAULT 0,
  driving_hours numeric(4,2) DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'pending_approval', 'approved', 'rejected')),
  entry_type text DEFAULT 'regular' CHECK (entry_type IN ('regular', 'overtime', 'holiday', 'sick', 'vacation')),
  notes text,
  location_clock_in text,
  location_clock_out text,
  approved_by uuid REFERENCES public.profiles(id),
  approved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Create time_off_requests table
CREATE TABLE IF NOT EXISTS public.time_off_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  request_type text NOT NULL DEFAULT 'annual_leave' CHECK (request_type IN ('annual_leave', 'sick_leave', 'personal_leave', 'bereavement_leave', 'maternity_leave', 'paternity_leave', 'other')),
  reason text,
  total_days integer NOT NULL DEFAULT 1,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by uuid REFERENCES public.profiles(id),
  approved_at timestamp with time zone,
  notes text,
  review_notes text,
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_at timestamp with time zone,
  requested_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. Create driver_shift_patterns table
CREATE TABLE IF NOT EXISTS public.driver_shift_patterns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  pattern_name text NOT NULL,
  monday_start time,
  monday_end time,
  tuesday_start time,
  tuesday_end time,
  wednesday_start time,
  wednesday_end time,
  thursday_start time,
  thursday_end time,
  friday_start time,
  friday_end time,
  saturday_start time,
  saturday_end time,
  sunday_start time,
  sunday_end time,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_off_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_shift_patterns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for time_entries
DROP POLICY IF EXISTS "Drivers can manage their own time entries" ON public.time_entries;
CREATE POLICY "Drivers can manage their own time entries" 
  ON public.time_entries 
  FOR ALL 
  USING (driver_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'council')
  ));

-- Create RLS policies for time_off_requests
DROP POLICY IF EXISTS "Drivers can manage their own time off requests" ON public.time_off_requests;
CREATE POLICY "Drivers can manage their own time off requests" 
  ON public.time_off_requests 
  FOR ALL 
  USING (driver_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'council')
  ));

-- Create RLS policies for driver_shift_patterns
DROP POLICY IF EXISTS "Drivers can view their own shift patterns" ON public.driver_shift_patterns;
CREATE POLICY "Drivers can view their own shift patterns" 
  ON public.driver_shift_patterns 
  FOR SELECT 
  USING (driver_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'council')
  ));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_time_entries_driver_id ON public.time_entries(driver_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_entry_date ON public.time_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_time_entries_status ON public.time_entries(status);

CREATE INDEX IF NOT EXISTS idx_time_off_requests_driver_id ON public.time_off_requests(driver_id);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_start_date ON public.time_off_requests(start_date);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_status ON public.time_off_requests(status);

CREATE INDEX IF NOT EXISTS idx_driver_shift_patterns_driver_id ON public.driver_shift_patterns(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_shift_patterns_is_active ON public.driver_shift_patterns(is_active);

-- Insert sample data for testing
INSERT INTO public.time_entries (driver_id, organization_id, entry_date, clock_in_time, clock_out_time, total_hours, status)
SELECT 
  p.id,
  p.organization_id,
  CURRENT_DATE - INTERVAL '1 day',
  '08:00:00'::time,
  '17:00:00'::time,
  8.0,
  'completed'
FROM public.profiles p
WHERE p.role = 'driver'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Verify tables were created
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('time_entries', 'time_off_requests', 'driver_shift_patterns')
ORDER BY table_name;
