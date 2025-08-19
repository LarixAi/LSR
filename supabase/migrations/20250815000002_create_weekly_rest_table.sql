-- Create weekly_rest table for tracking driver weekly rest periods
CREATE TABLE IF NOT EXISTS public.weekly_rest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  rest_start_time TIMESTAMP WITH TIME ZONE,
  rest_end_time TIMESTAMP WITH TIME ZONE,
  total_rest_hours DECIMAL(5,2) NOT NULL CHECK (total_rest_hours >= 0),
  rest_type TEXT NOT NULL CHECK (rest_type IN ('full_weekly_rest', 'reduced_weekly_rest', 'compensated_rest')),
  compensation_required BOOLEAN DEFAULT false,
  compensation_date DATE,
  notes TEXT,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.weekly_rest ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for weekly_rest
CREATE POLICY "drivers_can_view_own_weekly_rest_records" ON public.weekly_rest
FOR SELECT USING (driver_id = auth.uid());

CREATE POLICY "drivers_can_insert_own_weekly_rest_records" ON public.weekly_rest
FOR INSERT WITH CHECK (driver_id = auth.uid());

CREATE POLICY "drivers_can_update_own_weekly_rest_records" ON public.weekly_rest
FOR UPDATE USING (driver_id = auth.uid());

CREATE POLICY "drivers_can_delete_own_weekly_rest_records" ON public.weekly_rest
FOR DELETE USING (driver_id = auth.uid());

CREATE POLICY "admins_can_manage_weekly_rest_records" ON public.weekly_rest
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'council')
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_weekly_rest_driver_id ON public.weekly_rest(driver_id);
CREATE INDEX IF NOT EXISTS idx_weekly_rest_week_start_date ON public.weekly_rest(week_start_date);
CREATE INDEX IF NOT EXISTS idx_weekly_rest_week_end_date ON public.weekly_rest(week_end_date);
CREATE INDEX IF NOT EXISTS idx_weekly_rest_organization_id ON public.weekly_rest(organization_id);
CREATE INDEX IF NOT EXISTS idx_weekly_rest_driver_week ON public.weekly_rest(driver_id, week_start_date, week_end_date);

-- Create unique constraint to prevent duplicate weekly rest records for the same driver and week
CREATE UNIQUE INDEX IF NOT EXISTS idx_weekly_rest_driver_week_unique 
ON public.weekly_rest(driver_id, week_start_date, week_end_date);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_weekly_rest_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_weekly_rest_updated_at
BEFORE UPDATE ON public.weekly_rest
FOR EACH ROW
EXECUTE FUNCTION update_weekly_rest_updated_at();

-- Create function to automatically record weekly rest periods
CREATE OR REPLACE FUNCTION auto_record_weekly_rest(
  p_driver_id UUID,
  p_week_start_date DATE
)
RETURNS TABLE(
  week_processed DATE,
  weekly_rest_created BOOLEAN,
  rest_type TEXT,
  total_rest_hours DECIMAL(5,2),
  compensation_required BOOLEAN
) AS $$
DECLARE
  v_week_end_date DATE;
  v_total_work_hours DECIMAL(5,2) := 0;
  v_total_rest_hours DECIMAL(5,2) := 0;
  v_rest_type TEXT := 'full_weekly_rest';
  v_compensation_required BOOLEAN := false;
  v_existing_rest_id UUID;
BEGIN
  -- Calculate week end date (Sunday)
  v_week_end_date := p_week_start_date + INTERVAL '6 days';
  
  -- Check if weekly rest already exists for this week
  SELECT id INTO v_existing_rest_id
  FROM public.weekly_rest
  WHERE driver_id = p_driver_id
    AND week_start_date = p_week_start_date
    AND week_end_date = v_week_end_date;
  
  IF v_existing_rest_id IS NOT NULL THEN
    -- Weekly rest already exists
    RETURN QUERY SELECT 
      p_week_start_date,
      false,
      'existing',
      0.0,
      false;
    RETURN;
  END IF;
  
  -- Calculate total work hours for the week
  SELECT COALESCE(SUM(total_hours), 0) INTO v_total_work_hours
  FROM public.time_entries
  WHERE driver_id = p_driver_id
    AND date >= p_week_start_date
    AND date <= v_week_end_date;
  
  -- Calculate total daily rest hours for the week
  SELECT COALESCE(SUM(duration_hours), 0) INTO v_total_rest_hours
  FROM public.daily_rest
  WHERE driver_id = p_driver_id
    AND rest_date >= p_week_start_date
    AND rest_date <= v_week_end_date;
  
  -- Determine rest type based on WTD regulations
  IF v_total_work_hours > 60 THEN
    -- If weekly work hours exceed 60, this might require reduced rest
    v_rest_type := 'reduced_weekly_rest';
    v_compensation_required := true;
  END IF;
  
  -- Default weekly rest hours (45 hours for full rest)
  IF v_total_rest_hours = 0 THEN
    v_total_rest_hours := 45.0;
  END IF;
  
  -- Insert weekly rest record
  INSERT INTO public.weekly_rest (
    driver_id,
    week_start_date,
    week_end_date,
    total_rest_hours,
    rest_type,
    compensation_required,
    notes,
    organization_id
  )
  SELECT 
    p_driver_id,
    p_week_start_date,
    v_week_end_date,
    v_total_rest_hours,
    v_rest_type,
    v_compensation_required,
    'Automatically recorded weekly rest period',
    organization_id
  FROM public.profiles
  WHERE id = p_driver_id;
  
  RETURN QUERY SELECT 
    p_week_start_date,
    true,
    v_rest_type,
    v_total_rest_hours,
    v_compensation_required;
END;
$$ LANGUAGE plpgsql;

-- Create function to analyze weekly rest compliance
CREATE OR REPLACE FUNCTION analyze_weekly_rest_compliance(
  p_driver_id UUID,
  p_week_start_date DATE
)
RETURNS TABLE(
  week_start_date DATE,
  week_end_date DATE,
  total_work_hours DECIMAL(5,2),
  total_rest_hours DECIMAL(5,2),
  weekly_rest_hours DECIMAL(5,2),
  rest_compliance BOOLEAN,
  rest_type TEXT,
  compensation_required BOOLEAN,
  violations TEXT[],
  warnings TEXT[]
) AS $$
DECLARE
  v_week_end_date DATE;
  v_total_work_hours DECIMAL(5,2) := 0;
  v_total_rest_hours DECIMAL(5,2) := 0;
  v_weekly_rest_hours DECIMAL(5,2) := 0;
  v_rest_type TEXT;
  v_compensation_required BOOLEAN;
  v_rest_compliance BOOLEAN := false;
  v_violations TEXT[] := '{}';
  v_warnings TEXT[] := '{}';
BEGIN
  -- Calculate week end date
  v_week_end_date := p_week_start_date + INTERVAL '6 days';
  
  -- Get total work hours for the week
  SELECT COALESCE(SUM(total_hours), 0) INTO v_total_work_hours
  FROM public.time_entries
  WHERE driver_id = p_driver_id
    AND date >= p_week_start_date
    AND date <= v_week_end_date;
  
  -- Get total daily rest hours for the week
  SELECT COALESCE(SUM(duration_hours), 0) INTO v_total_rest_hours
  FROM public.daily_rest
  WHERE driver_id = p_driver_id
    AND rest_date >= p_week_start_date
    AND rest_date <= v_week_end_date;
  
  -- Get weekly rest record
  SELECT total_rest_hours, rest_type, compensation_required
  INTO v_weekly_rest_hours, v_rest_type, v_compensation_required
  FROM public.weekly_rest
  WHERE driver_id = p_driver_id
    AND week_start_date = p_week_start_date
    AND week_end_date = v_week_end_date;
  
  -- Analyze compliance
  IF v_weekly_rest_hours >= 45 THEN
    v_rest_compliance := true;
    v_rest_type := 'full_weekly_rest';
  ELSIF v_weekly_rest_hours >= 24 THEN
    v_rest_compliance := true;
    v_rest_type := 'reduced_weekly_rest';
    v_compensation_required := true;
  ELSE
    v_rest_compliance := false;
    v_rest_type := 'missing';
  END IF;
  
  -- Check for violations
  IF v_total_work_hours > 60 THEN
    v_violations := array_append(v_violations, 'Weekly working time exceeds 60 hours');
  END IF;
  
  IF v_weekly_rest_hours < 24 THEN
    v_violations := array_append(v_violations, 'Weekly rest period below minimum requirement');
  END IF;
  
  -- Check for warnings
  IF v_total_work_hours > 55 AND v_total_work_hours <= 60 THEN
    v_warnings := array_append(v_warnings, 'Weekly working time approaching limit');
  END IF;
  
  IF v_compensation_required AND v_weekly_rest_hours < 45 THEN
    v_warnings := array_append(v_warnings, 'Compensation required for reduced weekly rest');
  END IF;
  
  RETURN QUERY SELECT 
    p_week_start_date,
    v_week_end_date,
    v_total_work_hours,
    v_total_rest_hours,
    COALESCE(v_weekly_rest_hours, 0),
    v_rest_compliance,
    COALESCE(v_rest_type, 'missing'),
    COALESCE(v_compensation_required, false),
    v_violations,
    v_warnings;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_rest TO authenticated;
GRANT EXECUTE ON FUNCTION auto_record_weekly_rest(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION analyze_weekly_rest_compliance(UUID, DATE) TO authenticated;
