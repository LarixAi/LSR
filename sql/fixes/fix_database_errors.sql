-- Comprehensive Database Fix Script
-- This script will fix all common database issues for the parent dashboard

-- 1. Create organizations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'driver',
  phone TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Create vehicles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  vehicle_number TEXT NOT NULL,
  make TEXT,
  model TEXT,
  year INTEGER,
  license_plate TEXT,
  vehicle_type TEXT,
  status TEXT DEFAULT 'active',
  fuel_level INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Create routes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  name TEXT NOT NULL,
  start_location TEXT,
  end_location TEXT,
  distance NUMERIC,
  estimated_time INTEGER,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Create route_assignments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.route_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID REFERENCES public.routes(id),
  driver_id UUID REFERENCES public.profiles(id),
  vehicle_id UUID REFERENCES public.vehicles(id),
  assignment_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  status TEXT NOT NULL DEFAULT 'active',
  is_active BOOLEAN NOT NULL DEFAULT true,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Create triggers for updated_at columns
DO $$
BEGIN
    -- Organizations trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_organizations_updated_at') THEN
        CREATE TRIGGER trg_organizations_updated_at
        BEFORE UPDATE ON public.organizations
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    -- Profiles trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_profiles_updated_at') THEN
        CREATE TRIGGER trg_profiles_updated_at
        BEFORE UPDATE ON public.profiles
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    -- Vehicles trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_vehicles_updated_at') THEN
        CREATE TRIGGER trg_vehicles_updated_at
        BEFORE UPDATE ON public.vehicles
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    -- Routes trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_routes_updated_at') THEN
        CREATE TRIGGER trg_routes_updated_at
        BEFORE UPDATE ON public.routes
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    -- Route assignments trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_route_assignments_updated_at') THEN
        CREATE TRIGGER trg_route_assignments_updated_at
        BEFORE UPDATE ON public.route_assignments
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- 8. Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_assignments ENABLE ROW LEVEL SECURITY;

-- 9. Create basic RLS policies
-- Organizations policies
DROP POLICY IF EXISTS "Organizations are viewable by everyone" ON public.organizations;
CREATE POLICY "Organizations are viewable by everyone" ON public.organizations
FOR SELECT USING (true);

-- Profiles policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
FOR SELECT USING (true);

-- Vehicles policies
DROP POLICY IF EXISTS "Vehicles are viewable by everyone" ON public.vehicles;
CREATE POLICY "Vehicles are viewable by everyone" ON public.vehicles
FOR SELECT USING (true);

-- Routes policies
DROP POLICY IF EXISTS "Routes are viewable by everyone" ON public.routes;
CREATE POLICY "Routes are viewable by everyone" ON public.routes
FOR SELECT USING (true);

-- Route assignments policies
DROP POLICY IF EXISTS "Route assignments are viewable by everyone" ON public.route_assignments;
CREATE POLICY "Route assignments are viewable by everyone" ON public.route_assignments
FOR SELECT USING (true);

-- 10. Insert sample organization if none exists
INSERT INTO public.organizations (name, address, city, state, zip_code, phone, email)
SELECT 'Sample Transport Company', '123 Main St', 'Anytown', 'CA', '12345', '555-0123', 'info@sampletransport.com'
WHERE NOT EXISTS (SELECT 1 FROM public.organizations LIMIT 1);

-- 11. Insert sample drivers if none exist
INSERT INTO public.profiles (email, first_name, last_name, role, phone, organization_id)
SELECT 
  'john.driver@sampletransport.com',
  'John',
  'Driver',
  'driver',
  '555-0123',
  (SELECT id FROM organizations LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'john.driver@sampletransport.com');

INSERT INTO public.profiles (email, first_name, last_name, role, phone, organization_id)
SELECT 
  'sarah.wilson@sampletransport.com',
  'Sarah',
  'Wilson',
  'driver',
  '555-0456',
  (SELECT id FROM organizations LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'sarah.wilson@sampletransport.com');

-- 12. Insert sample vehicles if none exist
INSERT INTO public.vehicles (organization_id, vehicle_number, make, model, year, license_plate, vehicle_type, status, fuel_level)
SELECT 
  (SELECT id FROM organizations LIMIT 1),
  'BUS001',
  'Blue Bird',
  'Vision',
  2020,
  'ABC123',
  'school_bus',
  'active',
  85
WHERE NOT EXISTS (SELECT 1 FROM public.vehicles WHERE vehicle_number = 'BUS001');

INSERT INTO public.vehicles (organization_id, vehicle_number, make, model, year, license_plate, vehicle_type, status, fuel_level)
SELECT 
  (SELECT id FROM organizations LIMIT 1),
  'VAN002',
  'Ford',
  'Transit',
  2021,
  'XYZ789',
  'passenger_van',
  'active',
  90
WHERE NOT EXISTS (SELECT 1 FROM public.vehicles WHERE vehicle_number = 'VAN002');

-- 13. Insert sample routes if none exist
INSERT INTO public.routes (organization_id, name, start_location, end_location, distance, estimated_time, status)
SELECT 
  (SELECT id FROM organizations LIMIT 1),
  'Morning School Run',
  'City Center Bus Depot',
  'Lincoln Elementary School',
  8.5,
  45,
  'active'
WHERE NOT EXISTS (SELECT 1 FROM public.routes WHERE name = 'Morning School Run');

INSERT INTO public.routes (organization_id, name, start_location, end_location, distance, estimated_time, status)
SELECT 
  (SELECT id FROM organizations LIMIT 1),
  'Afternoon Return Route',
  'Lincoln Elementary School',
  'Suburban Area Drop-off',
  7.2,
  40,
  'active'
WHERE NOT EXISTS (SELECT 1 FROM public.routes WHERE name = 'Afternoon Return Route');

-- 14. Insert sample route assignments for today
INSERT INTO public.route_assignments (route_id, driver_id, vehicle_id, assignment_date, start_time, end_time, status, is_active, organization_id)
SELECT 
  (SELECT id FROM routes WHERE name = 'Morning School Run' LIMIT 1),
  (SELECT id FROM profiles WHERE email = 'john.driver@sampletransport.com' LIMIT 1),
  (SELECT id FROM vehicles WHERE vehicle_number = 'BUS001' LIMIT 1),
  CURRENT_DATE,
  '07:30:00',
  '08:30:00',
  'active',
  true,
  (SELECT id FROM organizations LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM route_assignments 
  WHERE route_id = (SELECT id FROM routes WHERE name = 'Morning School Run' LIMIT 1)
  AND assignment_date = CURRENT_DATE
);

INSERT INTO public.route_assignments (route_id, driver_id, vehicle_id, assignment_date, start_time, end_time, status, is_active, organization_id)
SELECT 
  (SELECT id FROM routes WHERE name = 'Afternoon Return Route' LIMIT 1),
  (SELECT id FROM profiles WHERE email = 'sarah.wilson@sampletransport.com' LIMIT 1),
  (SELECT id FROM vehicles WHERE vehicle_number = 'VAN002' LIMIT 1),
  CURRENT_DATE,
  '15:00:00',
  '16:00:00',
  'active',
  true,
  (SELECT id FROM organizations LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM route_assignments 
  WHERE route_id = (SELECT id FROM routes WHERE name = 'Afternoon Return Route' LIMIT 1)
  AND assignment_date = CURRENT_DATE
);

-- 15. Display the results
SELECT 'Database fix completed successfully!' as status;

SELECT 'Sample data summary:' as info;
SELECT 'Organizations:' as table_name, COUNT(*) as count FROM organizations
UNION ALL
SELECT 'Profiles:' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'Vehicles:' as table_name, COUNT(*) as count FROM vehicles
UNION ALL
SELECT 'Routes:' as table_name, COUNT(*) as count FROM routes
UNION ALL
SELECT 'Route Assignments:' as table_name, COUNT(*) as count FROM route_assignments;

SELECT 'Today''s route assignments:' as info;
SELECT 
  ra.id,
  r.name as route_name,
  CONCAT(p.first_name, ' ', p.last_name) as driver_name,
  v.vehicle_number,
  ra.start_time,
  ra.end_time,
  ra.status
FROM route_assignments ra
JOIN routes r ON ra.route_id = r.id
JOIN profiles p ON ra.driver_id = p.id
JOIN vehicles v ON ra.vehicle_id = v.id
WHERE ra.assignment_date = CURRENT_DATE;
