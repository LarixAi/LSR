-- Simplified Rail Replacement Services Migration
-- This migration only adds new columns to routes and creates rail replacement tables

-- 1. Enhance the existing routes table for school routes (only add new columns)
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS route_type TEXT DEFAULT 'school' CHECK (route_type IN ('school', 'medical', 'charter', 'corporate', 'rail_replacement'));
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'planned', 'completed'));
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS assigned_vehicle_id UUID REFERENCES public.vehicles(id);
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS assigned_driver_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS stops JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 0;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS current_passengers INTEGER DEFAULT 0;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS estimated_revenue NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS contact_person TEXT;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS school_name TEXT;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS grade_levels TEXT[];
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS pickup_times TIME[];
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS dropoff_times TIME[];
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS days_of_week INTEGER[] DEFAULT '{1,2,3,4,5}'; -- Monday=1, Sunday=7

-- 2. Create rail_replacement_services table
CREATE TABLE IF NOT EXISTS public.rail_replacement_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_name TEXT NOT NULL,
  affected_line TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('active', 'planned', 'completed', 'cancelled')),
  vehicles_assigned INTEGER DEFAULT 0,
  passengers_affected INTEGER DEFAULT 0,
  pickup_points TEXT[] DEFAULT '{}',
  dropoff_points TEXT[] DEFAULT '{}',
  frequency TEXT,
  estimated_cost NUMERIC(10,2) DEFAULT 0,
  contact_person TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  notes TEXT,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create rail_replacement_vehicles table for vehicle assignments
CREATE TABLE IF NOT EXISTS public.rail_replacement_vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.rail_replacement_services(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id),
  driver_id UUID REFERENCES public.profiles(id),
  assigned_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_service', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create rail_replacement_schedules table for detailed scheduling
CREATE TABLE IF NOT EXISTS public.rail_replacement_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.rail_replacement_services(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  frequency_minutes INTEGER DEFAULT 10,
  vehicle_count INTEGER DEFAULT 1,
  expected_passengers INTEGER DEFAULT 0,
  actual_passengers INTEGER DEFAULT 0,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create rail_replacement_incidents table for tracking issues
CREATE TABLE IF NOT EXISTS public.rail_replacement_incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.rail_replacement_services(id) ON DELETE CASCADE,
  incident_type TEXT NOT NULL CHECK (incident_type IN ('delay', 'breakdown', 'accident', 'passenger_issue', 'weather', 'other')),
  severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  location TEXT,
  reported_by UUID REFERENCES auth.users(id),
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on new tables
ALTER TABLE public.rail_replacement_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rail_replacement_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rail_replacement_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rail_replacement_incidents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for rail_replacement_services
CREATE POLICY "Organization members can view rail replacement services" ON public.rail_replacement_services
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.organization_id = rail_replacement_services.organization_id
    )
  );

CREATE POLICY "Organization admins can manage rail replacement services" ON public.rail_replacement_services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'council')
      AND profiles.organization_id = rail_replacement_services.organization_id
    )
  );

-- Create RLS policies for rail_replacement_vehicles
CREATE POLICY "Organization members can view rail replacement vehicles" ON public.rail_replacement_vehicles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.rail_replacement_services s ON s.id = rail_replacement_vehicles.service_id
      WHERE p.id = auth.uid()
      AND p.organization_id = s.organization_id
    )
  );

CREATE POLICY "Organization admins can manage rail replacement vehicles" ON public.rail_replacement_vehicles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.rail_replacement_services s ON s.id = rail_replacement_vehicles.service_id
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'council')
      AND p.organization_id = s.organization_id
    )
  );

-- Create RLS policies for rail_replacement_schedules
CREATE POLICY "Organization members can view rail replacement schedules" ON public.rail_replacement_schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.rail_replacement_services s ON s.id = rail_replacement_schedules.service_id
      WHERE p.id = auth.uid()
      AND p.organization_id = s.organization_id
    )
  );

CREATE POLICY "Organization admins can manage rail replacement schedules" ON public.rail_replacement_schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.rail_replacement_services s ON s.id = rail_replacement_schedules.service_id
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'council')
      AND p.organization_id = s.organization_id
    )
  );

-- Create RLS policies for rail_replacement_incidents
CREATE POLICY "Organization members can view rail replacement incidents" ON public.rail_replacement_incidents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.rail_replacement_services s ON s.id = rail_replacement_incidents.service_id
      WHERE p.id = auth.uid()
      AND p.organization_id = s.organization_id
    )
  );

CREATE POLICY "Organization members can report incidents" ON public.rail_replacement_incidents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.rail_replacement_services s ON s.id = rail_replacement_incidents.service_id
      WHERE p.id = auth.uid()
      AND p.organization_id = s.organization_id
    )
  );

CREATE POLICY "Organization admins can manage rail replacement incidents" ON public.rail_replacement_incidents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.rail_replacement_services s ON s.id = rail_replacement_incidents.service_id
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'council')
      AND p.organization_id = s.organization_id
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_routes_route_type ON public.routes(route_type);
CREATE INDEX IF NOT EXISTS idx_routes_status ON public.routes(status);
CREATE INDEX IF NOT EXISTS idx_routes_assigned_vehicle_id ON public.routes(assigned_vehicle_id);
CREATE INDEX IF NOT EXISTS idx_routes_assigned_driver_id ON public.routes(assigned_driver_id);
CREATE INDEX IF NOT EXISTS idx_routes_school_name ON public.routes(school_name);
CREATE INDEX IF NOT EXISTS idx_routes_days_of_week ON public.routes USING GIN(days_of_week);

CREATE INDEX IF NOT EXISTS idx_rail_replacement_services_organization_id ON public.rail_replacement_services(organization_id);
CREATE INDEX IF NOT EXISTS idx_rail_replacement_services_status ON public.rail_replacement_services(status);
CREATE INDEX IF NOT EXISTS idx_rail_replacement_services_start_date ON public.rail_replacement_services(start_date);
CREATE INDEX IF NOT EXISTS idx_rail_replacement_services_end_date ON public.rail_replacement_services(end_date);
CREATE INDEX IF NOT EXISTS idx_rail_replacement_services_affected_line ON public.rail_replacement_services(affected_line);

CREATE INDEX IF NOT EXISTS idx_rail_replacement_vehicles_service_id ON public.rail_replacement_vehicles(service_id);
CREATE INDEX IF NOT EXISTS idx_rail_replacement_vehicles_vehicle_id ON public.rail_replacement_vehicles(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_rail_replacement_vehicles_driver_id ON public.rail_replacement_vehicles(driver_id);
CREATE INDEX IF NOT EXISTS idx_rail_replacement_vehicles_assigned_date ON public.rail_replacement_vehicles(assigned_date);

CREATE INDEX IF NOT EXISTS idx_rail_replacement_schedules_service_id ON public.rail_replacement_schedules(service_id);
CREATE INDEX IF NOT EXISTS idx_rail_replacement_schedules_date ON public.rail_replacement_schedules(date);
CREATE INDEX IF NOT EXISTS idx_rail_replacement_schedules_status ON public.rail_replacement_schedules(status);

CREATE INDEX IF NOT EXISTS idx_rail_replacement_incidents_service_id ON public.rail_replacement_incidents(service_id);
CREATE INDEX IF NOT EXISTS idx_rail_replacement_incidents_incident_type ON public.rail_replacement_incidents(incident_type);
CREATE INDEX IF NOT EXISTS idx_rail_replacement_incidents_severity ON public.rail_replacement_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_rail_replacement_incidents_status ON public.rail_replacement_incidents(status);
CREATE INDEX IF NOT EXISTS idx_rail_replacement_incidents_reported_at ON public.rail_replacement_incidents(reported_at);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_rail_replacement_services_updated_at BEFORE UPDATE ON public.rail_replacement_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rail_replacement_vehicles_updated_at BEFORE UPDATE ON public.rail_replacement_vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rail_replacement_schedules_updated_at BEFORE UPDATE ON public.rail_replacement_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rail_replacement_incidents_updated_at BEFORE UPDATE ON public.rail_replacement_incidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rail_replacement_services TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rail_replacement_vehicles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rail_replacement_schedules TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rail_replacement_incidents TO authenticated;

-- Create views for easier querying
CREATE OR REPLACE VIEW public.school_routes_summary AS
SELECT 
  id,
  name,
  school_name,
  route_type,
  status,
  start_location,
  end_location,
  capacity,
  current_passengers,
  assigned_vehicle_id,
  assigned_driver_id,
  grade_levels,
  pickup_times,
  dropoff_times,
  days_of_week,
  contact_person,
  contact_phone,
  contact_email,
  created_at,
  updated_at
FROM public.routes 
WHERE route_type = 'school';

CREATE OR REPLACE VIEW public.rail_replacement_summary AS
SELECT 
  s.id,
  s.route_name,
  s.affected_line,
  s.start_date,
  s.end_date,
  s.status,
  s.vehicles_assigned,
  s.passengers_affected,
  s.frequency,
  s.estimated_cost,
  s.contact_person,
  s.contact_phone,
  s.contact_email,
  COUNT(v.id) as assigned_vehicles_count,
  COUNT(sch.id) as scheduled_runs,
  COUNT(i.id) as incident_count,
  s.created_at,
  s.updated_at
FROM public.rail_replacement_services s
LEFT JOIN public.rail_replacement_vehicles v ON s.id = v.service_id
LEFT JOIN public.rail_replacement_schedules sch ON s.id = sch.service_id
LEFT JOIN public.rail_replacement_incidents i ON s.id = i.service_id AND i.status != 'closed'
GROUP BY s.id;

-- Grant access to views
GRANT SELECT ON public.school_routes_summary TO authenticated;
GRANT SELECT ON public.rail_replacement_summary TO authenticated;

