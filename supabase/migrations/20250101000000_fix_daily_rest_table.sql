-- Fix daily_rest table and ensure proper foreign key relationships
-- This migration ensures the daily_rest table exists with correct structure

-- Drop existing table if it exists to avoid conflicts
DROP TABLE IF EXISTS public.daily_rest CASCADE;

-- Create daily_rest table with proper structure
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

-- Add foreign key constraints only if the referenced tables exist
DO $$ 
BEGIN
  -- Add foreign key to profiles table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    ALTER TABLE public.daily_rest 
    ADD CONSTRAINT daily_rest_driver_id_fkey 
    FOREIGN KEY (driver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
  
  -- Add foreign key to organizations table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizations') THEN
    ALTER TABLE public.daily_rest 
    ADD CONSTRAINT daily_rest_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.daily_rest ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Drivers can view their own daily rest" ON public.daily_rest;
DROP POLICY IF EXISTS "Drivers can insert their own daily rest" ON public.daily_rest;
DROP POLICY IF EXISTS "Drivers can update their own daily rest" ON public.daily_rest;
DROP POLICY IF EXISTS "Drivers can delete their own daily rest" ON public.daily_rest;
DROP POLICY IF EXISTS "Organization admins can view all daily rest" ON public.daily_rest;

-- Create basic RLS policies (simplified to avoid dependencies)
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

DROP TRIGGER IF EXISTS update_daily_rest_updated_at ON public.daily_rest;
CREATE TRIGGER update_daily_rest_updated_at
BEFORE UPDATE ON public.daily_rest
FOR EACH ROW
EXECUTE FUNCTION update_daily_rest_updated_at();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_rest TO authenticated;
