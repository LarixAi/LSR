-- Create profiles table based on the existing type definition
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'driver',
  avatar_url TEXT,
  employment_status TEXT,
  onboarding_status TEXT,
  hire_date DATE,
  employee_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  termination_date DATE,
  cdl_number TEXT,
  medical_card_expiry DATE,
  must_change_password BOOLEAN DEFAULT false,
  password_changed_at TIMESTAMP WITH TIME ZONE,
  organization_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vehicles table
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID,
  vehicle_number TEXT NOT NULL,
  make TEXT,
  model TEXT,
  license_plate TEXT,
  status TEXT DEFAULT 'active',
  year INTEGER,
  vehicle_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create routes table
CREATE TABLE public.routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID,
  name TEXT,
  start_location TEXT,
  end_location TEXT,
  distance NUMERIC,
  estimated_time INTEGER,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID,
  title TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  priority TEXT DEFAULT 'medium',
  assigned_to UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create route_assignments table
CREATE TABLE public.route_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID REFERENCES public.routes(id),
  driver_id UUID,
  vehicle_id UUID REFERENCES public.vehicles(id),
  assignment_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  organization_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create job_assignments table
CREATE TABLE public.job_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id),
  driver_id UUID,
  vehicle_id UUID REFERENCES public.vehicles(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'in_progress', 'completed', 'cancelled')),
  accepted_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  organization_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_pickups table
CREATE TABLE public.student_pickups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id INTEGER NOT NULL,
  route_id UUID REFERENCES public.routes(id),
  driver_id UUID,
  pickup_time TIME NOT NULL,
  pickup_location TEXT NOT NULL,
  dropoff_time TIME,
  dropoff_location TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'picked_up', 'dropped_off', 'absent', 'cancelled')),
  pickup_confirmed_by UUID,
  dropoff_confirmed_by UUID,
  parent_notified_pickup BOOLEAN NOT NULL DEFAULT false,
  parent_notified_dropoff BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  organization_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create driver_locations table
CREATE TABLE public.driver_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  accuracy_meters NUMERIC,
  altitude_meters NUMERIC,
  speed_kmh NUMERIC,
  heading_degrees NUMERIC,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  route_id UUID REFERENCES public.routes(id),
  vehicle_id UUID REFERENCES public.vehicles(id),
  organization_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_pickups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (these can be refined later based on your specific needs)
-- For now, allowing all authenticated users to access data within their organization
CREATE POLICY "Enable read access for authenticated users" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.vehicles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.vehicles FOR UPDATE USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.routes FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.routes FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.routes FOR UPDATE USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.jobs FOR UPDATE USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.route_assignments FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.route_assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.route_assignments FOR UPDATE USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.job_assignments FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.job_assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.job_assignments FOR UPDATE USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.student_pickups FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.student_pickups FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.student_pickups FOR UPDATE USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.driver_locations FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.driver_locations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.driver_locations FOR UPDATE USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at column
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at
    BEFORE UPDATE ON public.vehicles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_routes_updated_at
    BEFORE UPDATE ON public.routes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_route_assignments_updated_at
    BEFORE UPDATE ON public.route_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_assignments_updated_at
    BEFORE UPDATE ON public.job_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_pickups_updated_at
    BEFORE UPDATE ON public.student_pickups
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();