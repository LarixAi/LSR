
-- Create vehicles table
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_number TEXT NOT NULL UNIQUE,
  license_plate TEXT NOT NULL UNIQUE,
  make TEXT,
  model TEXT,
  year INTEGER,
  capacity INTEGER NOT NULL DEFAULT 1,
  fuel_type TEXT,
  mileage INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  organization_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create driver_assignments table
CREATE TABLE public.driver_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  unassigned_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vehicle_checks table
CREATE TABLE public.vehicle_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  check_date DATE NOT NULL DEFAULT CURRENT_DATE,
  overall_condition TEXT NOT NULL DEFAULT 'good',
  issues_reported TEXT[],
  requires_maintenance BOOLEAN NOT NULL DEFAULT false,
  maintenance_priority TEXT,
  compliance_status TEXT DEFAULT 'compliant',
  compliance_score INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create time_entries table
CREATE TABLE public.time_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  clock_in_time TIME,
  clock_out_time TIME,
  break_start_time TIME,
  break_end_time TIME,
  location_clock_in TEXT,
  location_clock_out TEXT,
  total_hours NUMERIC(4,2) NOT NULL DEFAULT 0,
  overtime_hours NUMERIC(4,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  entry_type TEXT NOT NULL DEFAULT 'regular',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create time_off_requests table
CREATE TABLE public.time_off_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  request_type TEXT DEFAULT 'vacation',
  total_days INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.profiles(id),
  review_notes TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create compliance_violations table
CREATE TABLE public.compliance_violations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  violation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  violation_type TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'low',
  status TEXT NOT NULL DEFAULT 'active',
  resolved_by UUID REFERENCES public.profiles(id),
  resolved_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for vehicles
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view vehicles" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Admins can manage vehicles" ON public.vehicles FOR ALL USING (public.is_admin_user(auth.uid()));

-- Add RLS policies for driver_assignments
ALTER TABLE public.driver_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view driver assignments" ON public.driver_assignments FOR SELECT USING (true);
CREATE POLICY "Admins can manage driver assignments" ON public.driver_assignments FOR ALL USING (public.is_admin_user(auth.uid()));

-- Add RLS policies for vehicle_checks
ALTER TABLE public.vehicle_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view vehicle checks" ON public.vehicle_checks FOR SELECT USING (true);
CREATE POLICY "Drivers can manage their own checks" ON public.vehicle_checks FOR ALL USING (auth.uid() = driver_id OR public.is_admin_user(auth.uid()));

-- Add RLS policies for time_entries
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers can view their own time entries" ON public.time_entries FOR SELECT USING (auth.uid() = driver_id OR public.is_admin_user(auth.uid()));
CREATE POLICY "Drivers can manage their own time entries" ON public.time_entries FOR ALL USING (auth.uid() = driver_id OR public.is_admin_user(auth.uid()));

-- Add RLS policies for time_off_requests
ALTER TABLE public.time_off_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers can view their own time off requests" ON public.time_off_requests FOR SELECT USING (auth.uid() = driver_id OR public.is_admin_user(auth.uid()));
CREATE POLICY "Drivers can manage their own time off requests" ON public.time_off_requests FOR ALL USING (auth.uid() = driver_id OR public.is_admin_user(auth.uid()));

-- Add RLS policies for compliance_violations
ALTER TABLE public.compliance_violations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers can view their own violations" ON public.compliance_violations FOR SELECT USING (auth.uid() = driver_id OR public.is_admin_user(auth.uid()));
CREATE POLICY "Admins can manage compliance violations" ON public.compliance_violations FOR ALL USING (public.is_admin_user(auth.uid()));

-- Add updated_at triggers
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_driver_assignments_updated_at BEFORE UPDATE ON public.driver_assignments FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_vehicle_checks_updated_at BEFORE UPDATE ON public.vehicle_checks FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON public.time_entries FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_time_off_requests_updated_at BEFORE UPDATE ON public.time_off_requests FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_compliance_violations_updated_at BEFORE UPDATE ON public.compliance_violations FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
