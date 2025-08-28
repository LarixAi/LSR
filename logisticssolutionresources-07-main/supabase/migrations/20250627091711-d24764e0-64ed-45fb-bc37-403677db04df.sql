
-- Create routes table
CREATE TABLE public.routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_location TEXT NOT NULL,
  end_location TEXT NOT NULL,
  stops JSONB DEFAULT '[]'::jsonb,
  distance_km DECIMAL(10,2),
  estimated_duration_minutes INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  job_type TEXT NOT NULL DEFAULT 'transport',
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  assigned_driver_id UUID REFERENCES public.profiles(id),
  assigned_vehicle_id UUID REFERENCES public.vehicles(id),
  route_id UUID REFERENCES public.routes(id),
  start_date DATE,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  payment_amount DECIMAL(10,2),
  payment_status TEXT DEFAULT 'pending',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create license_categories table
CREATE TABLE public.license_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create driver_licenses table
CREATE TABLE public.driver_licenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.profiles(id),
  license_category_id UUID NOT NULL REFERENCES public.license_categories(id),
  license_number TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  issuing_authority TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(driver_id, license_category_id)
);

-- Create incidents table
CREATE TABLE public.incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'low',
  status TEXT NOT NULL DEFAULT 'open',
  incident_date DATE,
  incident_time TIME,
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  location_address TEXT,
  people_involved TEXT[],
  witnesses TEXT[],
  vehicle_id UUID REFERENCES public.vehicles(id),
  driver_id UUID REFERENCES public.profiles(id),
  reported_by UUID NOT NULL REFERENCES public.profiles(id),
  attachments JSONB DEFAULT '[]'::jsonb,
  additional_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert some default license categories
INSERT INTO public.license_categories (name, code, description) VALUES
('Code 8 License', 'C8', 'Light Motor Vehicle License'),
('Code 10 License', 'C10', 'Mini Bus License'),
('Code 11 License', 'C11', 'Heavy Motor Vehicle License'),
('Code 14 License', 'C14', 'Bus License'),
('PrDP License', 'PrDP', 'Professional Driving Permit');

-- Enable RLS on all tables
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for routes
CREATE POLICY "Users can view routes" ON public.routes FOR SELECT USING (true);
CREATE POLICY "Admins can manage routes" ON public.routes FOR ALL USING (public.is_admin_user(auth.uid()));

-- Create RLS policies for jobs
CREATE POLICY "Users can view jobs" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Admins can manage jobs" ON public.jobs FOR ALL USING (public.is_admin_user(auth.uid()));
CREATE POLICY "Drivers can view their jobs" ON public.jobs FOR SELECT USING (assigned_driver_id = auth.uid());

-- Create RLS policies for license categories
CREATE POLICY "Users can view license categories" ON public.license_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage license categories" ON public.license_categories FOR ALL USING (public.is_admin_user(auth.uid()));

-- Create RLS policies for driver licenses
CREATE POLICY "Users can view driver licenses" ON public.driver_licenses FOR SELECT USING (true);
CREATE POLICY "Admins can manage driver licenses" ON public.driver_licenses FOR ALL USING (public.is_admin_user(auth.uid()));
CREATE POLICY "Drivers can view their licenses" ON public.driver_licenses FOR SELECT USING (driver_id = auth.uid());

-- Create RLS policies for incidents
CREATE POLICY "Users can view incidents" ON public.incidents FOR SELECT USING (true);
CREATE POLICY "Admins can manage incidents" ON public.incidents FOR ALL USING (public.is_admin_user(auth.uid()));
CREATE POLICY "Users can create incidents" ON public.incidents FOR INSERT WITH CHECK (reported_by = auth.uid());

-- Create updated_at triggers
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON public.routes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_driver_licenses_updated_at BEFORE UPDATE ON public.driver_licenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
