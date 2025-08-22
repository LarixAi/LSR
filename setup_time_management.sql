-- Setup Time Management Tables
-- This script creates the time management tables for the LSR Transport Management System

-- Time entries for detailed tracking
CREATE TABLE IF NOT EXISTS public.time_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid NOT NULL,
  organization_id uuid,
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
  approved_by uuid,
  approved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Time off requests
CREATE TABLE IF NOT EXISTS public.time_off_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid NOT NULL,
  organization_id uuid,
  start_date date NOT NULL,
  end_date date NOT NULL,
  request_type text NOT NULL CHECK (request_type IN ('annual_leave', 'sick_leave', 'personal_leave', 'bereavement', 'other')),
  reason text NOT NULL,
  total_days integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes text,
  review_notes text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  requested_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Driver shift patterns table
CREATE TABLE IF NOT EXISTS public.driver_shift_patterns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid NOT NULL,
  organization_id uuid,
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

-- Enable RLS on all tables
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_off_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_shift_patterns ENABLE ROW LEVEL SECURITY;

-- Policies for time_entries
CREATE POLICY "Drivers can manage their own time entries" 
  ON public.time_entries 
  FOR ALL 
  USING (driver_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'council')
  ));

-- Policies for time_off_requests
CREATE POLICY "Drivers can manage their own time off requests" 
  ON public.time_off_requests 
  FOR ALL 
  USING (driver_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'council')
  ));

-- Policies for driver_shift_patterns
CREATE POLICY "Drivers can view their own shift patterns" 
  ON public.driver_shift_patterns 
  FOR SELECT 
  USING (driver_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'council')
  ));

CREATE POLICY "Admins can manage shift patterns" 
  ON public.driver_shift_patterns 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'council')
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_time_entries_driver_date ON public.time_entries(driver_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_time_entries_organization_date ON public.time_entries(organization_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_dates ON public.time_off_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_driver ON public.time_off_requests(driver_id, status);
CREATE INDEX IF NOT EXISTS idx_shift_patterns_driver ON public.driver_shift_patterns(driver_id, is_active);

-- Create function to calculate total hours automatically
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

-- Create triggers for updated_at
CREATE TRIGGER update_time_entries_updated_at
    BEFORE UPDATE ON public.time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_off_requests_updated_at
    BEFORE UPDATE ON public.time_off_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_driver_shift_patterns_updated_at
    BEFORE UPDATE ON public.driver_shift_patterns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO public.time_entries (driver_id, entry_date, clock_in_time, clock_out_time, total_hours, status, notes)
VALUES 
  ('00000000-0000-0000-0000-000000000001', CURRENT_DATE, '08:00:00', '17:00:00', 8.0, 'completed', 'Regular work day'),
  ('00000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '1 day', '08:30:00', '18:30:00', 9.0, 'completed', 'Overtime day'),
  ('00000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '2 days', '09:00:00', '17:00:00', 7.0, 'completed', 'Short day')
ON CONFLICT DO NOTHING;

-- Insert sample time off requests
INSERT INTO public.time_off_requests (driver_id, start_date, end_date, request_type, reason, status)
VALUES 
  ('00000000-0000-0000-0000-000000000001', CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '10 days', 'annual_leave', 'Family vacation', 'pending'),
  ('00000000-0000-0000-0000-000000000001', CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '14 days', 'sick_leave', 'Medical appointment', 'approved')
ON CONFLICT DO NOTHING;

