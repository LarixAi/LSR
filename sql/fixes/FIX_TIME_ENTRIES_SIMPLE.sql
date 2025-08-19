-- Simple Fix for time_entries table
-- Run this in Supabase SQL Editor

-- Drop existing table to avoid conflicts
DROP TABLE IF EXISTS public.time_entries CASCADE;

-- Create time_entries table
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

-- Enable RLS
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_time_entries_driver_id ON public.time_entries(driver_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_entry_date ON public.time_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_time_entries_organization_id ON public.time_entries(organization_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_status ON public.time_entries(status);

-- Create function for hour calculation
CREATE OR REPLACE FUNCTION calculate_time_entry_hours()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.clock_in_time IS NOT NULL AND NEW.clock_out_time IS NOT NULL THEN
    NEW.total_hours := EXTRACT(EPOCH FROM (NEW.clock_out_time - NEW.clock_in_time)) / 3600;
  END IF;
  
  IF NEW.break_start_time IS NOT NULL AND NEW.break_end_time IS NOT NULL THEN
    NEW.break_hours := EXTRACT(EPOCH FROM (NEW.break_end_time - NEW.break_start_time)) / 3600;
    NEW.total_hours := NEW.total_hours - NEW.break_hours;
  END IF;
  
  IF NEW.total_hours > 8 THEN
    NEW.overtime_hours := NEW.total_hours - 8;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_calculate_hours ON public.time_entries;
CREATE TRIGGER trigger_calculate_hours
  BEFORE INSERT OR UPDATE ON public.time_entries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_time_entry_hours();

-- Create updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_time_entries_updated_at ON public.time_entries;
CREATE TRIGGER update_time_entries_updated_at
    BEFORE UPDATE ON public.time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.time_entries TO authenticated;

-- Insert sample data (simplified)
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
  p.id,
  p.organization_id,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '8 hours',
  CURRENT_DATE + INTERVAL '16 hours',
  8.0,
  'completed',
  'regular'
FROM public.profiles p 
WHERE p.role = 'driver' 
LIMIT 1
ON CONFLICT DO NOTHING;
