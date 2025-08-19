-- Fix time_entries table issues
-- This script will ensure the time_entries table exists with the correct schema

-- Drop existing time_entries table if it exists (to avoid conflicts)
DROP TABLE IF EXISTS public.time_entries CASCADE;

-- Create time_entries table with correct schema
CREATE TABLE public.time_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  clock_in_time timestamp with time zone,
  clock_out_time timestamp with time zone,
  break_start_time timestamp with time zone,
  break_end_time timestamp with time zone,
  total_hours numeric(4,2) DEFAULT 0,
  overtime_hours numeric(4,2) DEFAULT 0,
  break_hours numeric(4,2) DEFAULT 0,
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

-- Enable Row Level Security
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for time_entries
CREATE POLICY "Drivers can view their own time entries" 
ON public.time_entries FOR SELECT 
USING (driver_id = auth.uid());

CREATE POLICY "Drivers can insert their own time entries" 
ON public.time_entries FOR INSERT 
WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Drivers can update their own time entries" 
ON public.time_entries FOR UPDATE 
USING (driver_id = auth.uid())
WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Organization admins can view all time entries" 
ON public.time_entries FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'council')
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_time_entries_driver_id ON public.time_entries(driver_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_entry_date ON public.time_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_time_entries_organization_id ON public.time_entries(organization_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_status ON public.time_entries(status);

-- Create function to calculate time entry hours
CREATE OR REPLACE FUNCTION calculate_time_entry_hours()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate total hours if both clock in and out times are set
  IF NEW.clock_in_time IS NOT NULL AND NEW.clock_out_time IS NOT NULL THEN
    NEW.total_hours := EXTRACT(EPOCH FROM (NEW.clock_out_time - NEW.clock_in_time)) / 3600;
  END IF;
  
  -- Calculate break hours if both break start and end times are set
  IF NEW.break_start_time IS NOT NULL AND NEW.break_end_time IS NOT NULL THEN
    NEW.break_hours := EXTRACT(EPOCH FROM (NEW.break_end_time - NEW.break_start_time)) / 3600;
    -- Subtract break time from total hours
    NEW.total_hours := NEW.total_hours - NEW.break_hours;
  END IF;
  
  -- Calculate overtime hours (anything over 8 hours per day)
  IF NEW.total_hours > 8 THEN
    NEW.overtime_hours := NEW.total_hours - 8;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic hour calculation
DROP TRIGGER IF EXISTS trigger_calculate_hours ON public.time_entries;
CREATE TRIGGER trigger_calculate_hours
  BEFORE INSERT OR UPDATE ON public.time_entries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_time_entry_hours();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_time_entries_updated_at ON public.time_entries;
CREATE TRIGGER update_time_entries_updated_at
    BEFORE UPDATE ON public.time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.time_entries TO authenticated;

-- Insert some sample data for testing (optional)
INSERT INTO public.time_entries (
  driver_id, 
  organization_id, 
  entry_date, 
  clock_in_time, 
  clock_out_time, 
  total_hours, 
  status, 
  entry_type
) 
SELECT 
  p.id as driver_id,
  p.organization_id,
  CURRENT_DATE - INTERVAL '1 day' * generate_series(0, 7) as entry_date,
  (CURRENT_DATE - INTERVAL '1 day' * generate_series(0, 7)) + INTERVAL '8 hours' as clock_in_time,
  (CURRENT_DATE - INTERVAL '1 day' * generate_series(0, 7)) + INTERVAL '16 hours' as clock_out_time,
  8.0 as total_hours,
  'completed' as status,
  'regular' as entry_type
FROM public.profiles p 
WHERE p.role = 'driver' 
LIMIT 1
ON CONFLICT DO NOTHING;
