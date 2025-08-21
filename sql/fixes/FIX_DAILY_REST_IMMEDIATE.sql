-- Immediate fix for daily_rest table
-- Run this script directly in your Supabase database

-- Drop existing table if it exists
DROP TABLE IF EXISTS public.daily_rest CASCADE;

-- Create daily_rest table with basic structure
CREATE TABLE public.daily_rest (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid NOT NULL,
  organization_id uuid,
  rest_date date NOT NULL,
  rest_type text DEFAULT 'daily_rest' CHECK (rest_type IN ('daily_rest', 'reduced_rest', 'compensated_rest')),
  duration_hours numeric(4,2) DEFAULT 24,
  start_time time without time zone,
  end_time time without time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Ensure unique daily rest per driver per date
  UNIQUE(driver_id, rest_date)
);

-- Enable Row Level Security
ALTER TABLE public.daily_rest ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policy for authenticated users
CREATE POLICY "Enable all access for authenticated users"
ON public.daily_rest FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_rest_driver_id ON public.daily_rest(driver_id);
CREATE INDEX IF NOT EXISTS idx_daily_rest_rest_date ON public.daily_rest(rest_date);
CREATE INDEX IF NOT EXISTS idx_daily_rest_organization_id ON public.daily_rest(organization_id);
CREATE INDEX IF NOT EXISTS idx_daily_rest_driver_date ON public.daily_rest(driver_id, rest_date);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_daily_rest_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_daily_rest_updated_at
BEFORE UPDATE ON public.daily_rest
FOR EACH ROW
EXECUTE FUNCTION update_daily_rest_updated_at();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_rest TO authenticated;

-- Insert some sample data for testing
INSERT INTO public.daily_rest (driver_id, organization_id, rest_date, rest_type, duration_hours, notes)
VALUES 
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '1 day', 'daily_rest', 24, 'Sample rest day'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '2 days', 'daily_rest', 24, 'Sample rest day 2');

-- Verify the table was created
SELECT 'daily_rest table created successfully' as status;
SELECT COUNT(*) as record_count FROM public.daily_rest;


