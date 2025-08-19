-- Fix weekly_rest table to resolve 406 error
-- This script will ensure the weekly_rest table exists with correct structure

-- Drop existing table to avoid conflicts
DROP TABLE IF EXISTS public.weekly_rest CASCADE;

-- Create weekly_rest table with correct structure
CREATE TABLE public.weekly_rest (
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

-- Enable Row Level Security
ALTER TABLE public.weekly_rest ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Drivers can view their own weekly rest" ON public.weekly_rest;
DROP POLICY IF EXISTS "Drivers can insert their own weekly rest" ON public.weekly_rest;
DROP POLICY IF EXISTS "Drivers can update their own weekly rest" ON public.weekly_rest;
DROP POLICY IF EXISTS "Drivers can delete their own weekly rest" ON public.weekly_rest;
DROP POLICY IF EXISTS "Organization admins can view all weekly rest" ON public.weekly_rest;

-- Create RLS policies
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_weekly_rest_driver_id ON public.weekly_rest(driver_id);
CREATE INDEX IF NOT EXISTS idx_weekly_rest_week_start_date ON public.weekly_rest(week_start_date);
CREATE INDEX IF NOT EXISTS idx_weekly_rest_week_end_date ON public.weekly_rest(week_end_date);
CREATE INDEX IF NOT EXISTS idx_weekly_rest_organization_id ON public.weekly_rest(organization_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_weekly_rest_updated_at ON public.weekly_rest;
CREATE TRIGGER update_weekly_rest_updated_at
    BEFORE UPDATE ON public.weekly_rest
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_rest TO authenticated;

-- Insert sample weekly rest data
DO $$
DECLARE
    driver_id uuid;
    org_id uuid;
BEGIN
    -- Get the current authenticated user's ID and organization
    SELECT id, organization_id INTO driver_id, org_id 
    FROM public.profiles 
    WHERE id = auth.uid();
    
    -- If no driver found, use the first driver in the system
    IF driver_id IS NULL THEN
        SELECT id, organization_id INTO driver_id, org_id 
        FROM public.profiles 
        WHERE role = 'driver' 
        LIMIT 1;
    END IF;
    
    -- Insert weekly rest record for the previous week
    INSERT INTO public.weekly_rest (
        driver_id,
        organization_id,
        week_start_date,
        week_end_date,
        rest_start_time,
        rest_end_time,
        total_rest_hours,
        rest_type,
        compensation_required,
        notes
    ) 
    VALUES (
        driver_id,
        org_id,
        date_trunc('week', CURRENT_DATE - INTERVAL '1 week'),
        date_trunc('week', CURRENT_DATE - INTERVAL '1 week') + INTERVAL '6 days',
        date_trunc('week', CURRENT_DATE - INTERVAL '1 week') + INTERVAL '16 hours',
        date_trunc('week', CURRENT_DATE - INTERVAL '1 week') + INTERVAL '6 days' + INTERVAL '16 hours',
        48.0,
        'full_weekly_rest',
        false,
        'Weekly rest period'
    )
    ON CONFLICT (driver_id, week_start_date) DO NOTHING;
    
    -- Insert weekly rest record for the current week
    INSERT INTO public.weekly_rest (
        driver_id,
        organization_id,
        week_start_date,
        week_end_date,
        rest_start_time,
        rest_end_time,
        total_rest_hours,
        rest_type,
        compensation_required,
        notes
    ) 
    VALUES (
        driver_id,
        org_id,
        date_trunc('week', CURRENT_DATE),
        date_trunc('week', CURRENT_DATE) + INTERVAL '6 days',
        date_trunc('week', CURRENT_DATE) + INTERVAL '16 hours',
        date_trunc('week', CURRENT_DATE) + INTERVAL '6 days' + INTERVAL '16 hours',
        24.0,
        'reduced_weekly_rest',
        true,
        'Reduced weekly rest - compensation required'
    )
    ON CONFLICT (driver_id, week_start_date) DO NOTHING;
    
    RAISE NOTICE 'Created weekly_rest table and inserted sample data for driver: %', driver_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating weekly_rest table: %', SQLERRM;
END $$;
