-- FINAL TIME ENTRIES FIX - Complete Solution
-- This script will completely recreate the time_entries table with the correct schema
-- and resolve the 406 error

-- 1. Drop the existing time_entries table completely
DROP TABLE IF EXISTS public.time_entries CASCADE;

-- 2. Create the time_entries table with the correct schema
CREATE TABLE public.time_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  clock_in_time time,
  clock_out_time time,
  break_start_time time,
  break_end_time time,
  total_hours numeric(4,2) DEFAULT 0,
  driving_hours numeric(4,2) DEFAULT 0,
  break_hours numeric(4,2) DEFAULT 0,
  location_clock_in text,
  location_clock_out text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  entry_type text DEFAULT 'regular' CHECK (entry_type IN ('regular', 'overtime', 'emergency', 'training')),
  notes text,
  approved_by uuid REFERENCES public.profiles(id),
  approved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. Enable Row Level Security
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
-- Policy for drivers to see their own time entries
CREATE POLICY "Drivers can view own time entries" ON public.time_entries
  FOR SELECT USING (driver_id = auth.uid());

-- Policy for drivers to insert their own time entries
CREATE POLICY "Drivers can insert own time entries" ON public.time_entries
  FOR INSERT WITH CHECK (driver_id = auth.uid());

-- Policy for drivers to update their own time entries
CREATE POLICY "Drivers can update own time entries" ON public.time_entries
  FOR UPDATE USING (driver_id = auth.uid());

-- Policy for admins to view all time entries
CREATE POLICY "Admins can view all time entries" ON public.time_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for admins to manage all time entries
CREATE POLICY "Admins can manage all time entries" ON public.time_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Create indexes for better performance
CREATE INDEX idx_time_entries_driver_id ON public.time_entries(driver_id);
CREATE INDEX idx_time_entries_entry_date ON public.time_entries(entry_date);
CREATE INDEX idx_time_entries_organization_id ON public.time_entries(organization_id);
CREATE INDEX idx_time_entries_status ON public.time_entries(status);
CREATE INDEX idx_time_entries_driver_date ON public.time_entries(driver_id, entry_date);

-- 6. Create trigger for updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_time_entries_updated_at 
    BEFORE UPDATE ON public.time_entries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.time_entries TO authenticated;

-- 8. Insert sample data for testing
DO $$
DECLARE
    current_driver_id uuid;
    current_org_id uuid;
BEGIN
    -- Get the current authenticated user's ID and organization
    SELECT id, organization_id INTO current_driver_id, current_org_id
    FROM public.profiles
    WHERE id = auth.uid();

    -- If no driver found, use the first driver in the system
    IF current_driver_id IS NULL THEN
        SELECT id, organization_id INTO current_driver_id, current_org_id
        FROM public.profiles
        WHERE role = 'driver'
        LIMIT 1;
    END IF;

    RAISE NOTICE 'Creating sample time entries for driver: %', current_driver_id;

    -- Insert sample time entries for the last 7 days
    INSERT INTO public.time_entries (
        driver_id,
        organization_id,
        entry_date,
        clock_in_time,
        clock_out_time,
        break_start_time,
        break_end_time,
        total_hours,
        driving_hours,
        break_hours,
        location_clock_in,
        location_clock_out,
        status
    )
    VALUES
        -- Today
        (current_driver_id, current_org_id, CURRENT_DATE, '08:00:00', '17:00:00', '12:00:00', '13:00:00', 8.0, 7.0, 1.0, 'London Depot', 'London Depot', 'completed'),
        
        -- Yesterday
        (current_driver_id, current_org_id, CURRENT_DATE - INTERVAL '1 day', '07:30:00', '16:30:00', '12:00:00', '12:30:00', 8.5, 7.5, 0.5, 'Manchester Depot', 'Manchester Depot', 'completed'),
        
        -- 2 days ago
        (current_driver_id, current_org_id, CURRENT_DATE - INTERVAL '2 days', '08:00:00', '18:00:00', '12:00:00', '13:00:00', 9.0, 8.0, 1.0, 'Birmingham Depot', 'Birmingham Depot', 'completed'),
        
        -- 3 days ago
        (current_driver_id, current_org_id, CURRENT_DATE - INTERVAL '3 days', '07:00:00', '15:00:00', '11:00:00', '11:30:00', 7.5, 6.5, 0.5, 'Leeds Depot', 'Leeds Depot', 'completed'),
        
        -- 4 days ago
        (current_driver_id, current_org_id, CURRENT_DATE - INTERVAL '4 days', '08:30:00', '17:30:00', '12:30:00', '13:30:00', 8.0, 7.0, 1.0, 'Liverpool Depot', 'Liverpool Depot', 'completed'),
        
        -- 5 days ago
        (current_driver_id, current_org_id, CURRENT_DATE - INTERVAL '5 days', '06:00:00', '14:00:00', '10:00:00', '10:30:00', 7.0, 6.0, 0.5, 'Newcastle Depot', 'Newcastle Depot', 'completed'),
        
        -- 6 days ago
        (current_driver_id, current_org_id, CURRENT_DATE - INTERVAL '6 days', '09:00:00', '18:00:00', '13:00:00', '14:00:00', 8.0, 7.0, 1.0, 'Sheffield Depot', 'Sheffield Depot', 'completed');

    RAISE NOTICE 'Sample time entries created successfully';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating sample time entries: %', SQLERRM;
END $$;

-- 9. Verify the setup
SELECT 
    'time_entries' as table_name,
    COUNT(*) as record_count
FROM public.time_entries;

-- 10. Show sample data
SELECT 
    entry_date,
    clock_in_time,
    clock_out_time,
    total_hours,
    driving_hours,
    break_hours,
    status
FROM public.time_entries
ORDER BY entry_date DESC
LIMIT 5;
