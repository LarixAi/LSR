
-- Create time tracking tables for comprehensive driver time management

-- Driver shift patterns table
CREATE TABLE IF NOT EXISTS public.driver_shift_patterns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid NOT NULL REFERENCES public.profiles(id),
  organization_id uuid REFERENCES public.organizations(id),
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

-- Time entries for detailed tracking
CREATE TABLE IF NOT EXISTS public.time_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid NOT NULL REFERENCES public.profiles(id),
  organization_id uuid REFERENCES public.organizations(id),
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

-- Time off requests
CREATE TABLE IF NOT EXISTS public.time_off_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid NOT NULL REFERENCES public.profiles(id),
  organization_id uuid REFERENCES public.organizations(id),
  request_type text NOT NULL CHECK (request_type IN ('vacation', 'sick', 'personal', 'emergency', 'bereavement')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_days integer NOT NULL,
  reason text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  requested_at timestamp with time zone DEFAULT now(),
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_at timestamp with time zone,
  review_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Work hours compliance rules
CREATE TABLE IF NOT EXISTS public.compliance_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id),
  rule_name text NOT NULL,
  rule_type text NOT NULL CHECK (rule_type IN ('daily_max_hours', 'weekly_max_hours', 'mandatory_break', 'consecutive_days_limit', 'minimum_rest_period')),
  rule_value numeric NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Compliance violations tracking
CREATE TABLE IF NOT EXISTS public.time_compliance_violations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid NOT NULL REFERENCES public.profiles(id),
  organization_id uuid REFERENCES public.organizations(id),
  violation_date date NOT NULL,
  rule_id uuid REFERENCES public.compliance_rules(id),
  violation_type text NOT NULL,
  severity text DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description text NOT NULL,
  actual_value numeric,
  allowed_value numeric,
  status text DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'acknowledged')),
  resolved_by uuid REFERENCES public.profiles(id),
  resolved_at timestamp with time zone,
  resolution_notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies for time tracking tables
ALTER TABLE public.driver_shift_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_off_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_compliance_violations ENABLE ROW LEVEL SECURITY;

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

-- Policies for compliance_rules
CREATE POLICY "Organization members can view compliance rules" 
  ON public.compliance_rules 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.profiles p 
    JOIN public.user_organizations uo ON p.id = uo.user_id
    WHERE p.id = auth.uid() AND uo.organization_id = compliance_rules.organization_id
  ));

CREATE POLICY "Admins can manage compliance rules" 
  ON public.compliance_rules 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'council')
  ));

-- Policies for time_compliance_violations
CREATE POLICY "Users can view relevant compliance violations" 
  ON public.time_compliance_violations 
  FOR SELECT 
  USING (driver_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'council')
  ));

CREATE POLICY "Admins can manage compliance violations" 
  ON public.time_compliance_violations 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'council')
  ));

-- Insert default compliance rules
INSERT INTO public.compliance_rules (rule_name, rule_type, rule_value, description) VALUES
('Maximum Daily Hours', 'daily_max_hours', 10, 'Maximum working hours per day'),
('Maximum Weekly Hours', 'weekly_max_hours', 50, 'Maximum working hours per week'),
('Mandatory Break After Hours', 'mandatory_break', 6, 'Mandatory break required after 6 hours of work'),
('Maximum Consecutive Days', 'consecutive_days_limit', 6, 'Maximum consecutive working days'),
('Minimum Rest Period', 'minimum_rest_period', 8, 'Minimum rest hours between shifts');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_time_entries_driver_date ON public.time_entries(driver_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_dates ON public.time_off_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_driver_date ON public.time_compliance_violations(driver_id, violation_date);
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
