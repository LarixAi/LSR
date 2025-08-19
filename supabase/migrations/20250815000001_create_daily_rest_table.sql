-- Create daily_rest table for tracking driver rest periods
CREATE TABLE IF NOT EXISTS public.daily_rest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rest_date DATE NOT NULL,
  rest_type TEXT NOT NULL CHECK (rest_type IN ('daily_rest', 'weekly_rest', 'reduced_rest')),
  duration_hours DECIMAL(4,2) NOT NULL CHECK (duration_hours > 0),
  start_time TIME,
  end_time TIME,
  notes TEXT,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.daily_rest ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for daily_rest
CREATE POLICY "drivers_can_view_own_rest_records" ON public.daily_rest
FOR SELECT USING (driver_id = auth.uid());

CREATE POLICY "drivers_can_insert_own_rest_records" ON public.daily_rest
FOR INSERT WITH CHECK (driver_id = auth.uid());

CREATE POLICY "drivers_can_update_own_rest_records" ON public.daily_rest
FOR UPDATE USING (driver_id = auth.uid());

CREATE POLICY "drivers_can_delete_own_rest_records" ON public.daily_rest
FOR DELETE USING (driver_id = auth.uid());

CREATE POLICY "admins_can_manage_rest_records" ON public.daily_rest
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'council')
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_rest_driver_id ON public.daily_rest(driver_id);
CREATE INDEX IF NOT EXISTS idx_daily_rest_rest_date ON public.daily_rest(rest_date);
CREATE INDEX IF NOT EXISTS idx_daily_rest_organization_id ON public.daily_rest(organization_id);
CREATE INDEX IF NOT EXISTS idx_daily_rest_driver_date ON public.daily_rest(driver_id, rest_date);

-- Create unique constraint to prevent duplicate rest records for the same driver and date
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_rest_driver_date_unique 
ON public.daily_rest(driver_id, rest_date);

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

-- Create function to automatically record rest days for days without work
CREATE OR REPLACE FUNCTION auto_record_rest_days(
  p_driver_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE(
  days_processed INTEGER,
  rest_days_created INTEGER,
  worked_days INTEGER,
  existing_rest_days INTEGER
) AS $$
DECLARE
  v_worked_days INTEGER;
  v_existing_rest_days INTEGER;
  v_rest_days_created INTEGER := 0;
  v_current_date DATE;
BEGIN
  -- Count worked days in the period
  SELECT COUNT(DISTINCT date) INTO v_worked_days
  FROM public.time_entries
  WHERE driver_id = p_driver_id
    AND date >= p_start_date
    AND date <= p_end_date;

  -- Count existing rest days in the period
  SELECT COUNT(*) INTO v_existing_rest_days
  FROM public.daily_rest
  WHERE driver_id = p_driver_id
    AND rest_date >= p_start_date
    AND rest_date <= p_end_date;

  -- Loop through each day in the range
  v_current_date := p_start_date;
  WHILE v_current_date <= p_end_date LOOP
    -- Check if this day has no work and no existing rest record
    IF NOT EXISTS (
      SELECT 1 FROM public.time_entries 
      WHERE driver_id = p_driver_id AND date = v_current_date
    ) AND NOT EXISTS (
      SELECT 1 FROM public.daily_rest 
      WHERE driver_id = p_driver_id AND rest_date = v_current_date
    ) THEN
      -- Insert rest record for this day
      INSERT INTO public.daily_rest (
        driver_id,
        rest_date,
        rest_type,
        duration_hours,
        notes,
        organization_id
      )
      SELECT 
        p_driver_id,
        v_current_date,
        'daily_rest',
        24.0,
        'Automatically recorded rest day - no work activity',
        organization_id
      FROM public.profiles
      WHERE id = p_driver_id;
      
      v_rest_days_created := v_rest_days_created + 1;
    END IF;
    
    v_current_date := v_current_date + INTERVAL '1 day';
  END LOOP;

  RETURN QUERY SELECT 
    (p_end_date - p_start_date + 1)::INTEGER as days_processed,
    v_rest_days_created,
    v_worked_days,
    v_existing_rest_days;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_rest TO authenticated;
