-- Phase 1: Critical Foundation - RLS Policies and Core Tables

-- First, add comprehensive RLS policies for critical tables that have none

-- Routes table policies
CREATE POLICY "Users can view org routes" ON public.routes
FOR SELECT USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Admins can manage org routes" ON public.routes
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role = ANY(ARRAY['admin', 'council'])
  )
);

-- Route stops policies
CREATE POLICY "Users can view org route stops" ON public.route_stops
FOR SELECT USING (route_id IN (
  SELECT id FROM public.routes WHERE organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
));

CREATE POLICY "Admins can manage org route stops" ON public.route_stops
FOR ALL USING (route_id IN (
  SELECT id FROM public.routes WHERE organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role = ANY(ARRAY['admin', 'council'])
  )
));

-- Jobs table policies
CREATE POLICY "Users can view org jobs" ON public.jobs
FOR SELECT USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Drivers can view assigned jobs" ON public.jobs
FOR SELECT USING (driver_id = auth.uid());

CREATE POLICY "Admins can manage org jobs" ON public.jobs
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role = ANY(ARRAY['admin', 'council'])
  )
);

-- Vehicles table policies
CREATE POLICY "Users can view org vehicles" ON public.vehicles
FOR SELECT USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Admins can manage org vehicles" ON public.vehicles
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role = ANY(ARRAY['admin', 'council'])
  )
);

-- Fuel transactions policies
CREATE POLICY "Users can view org fuel transactions" ON public.fuel_transactions
FOR SELECT USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Drivers can view their fuel transactions" ON public.fuel_transactions
FOR SELECT USING (driver_id = auth.uid());

CREATE POLICY "Admins can manage org fuel transactions" ON public.fuel_transactions
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role = ANY(ARRAY['admin', 'council'])
  )
);

-- Vehicle checks policies
CREATE POLICY "Users can view org vehicle checks" ON public.vehicle_checks
FOR SELECT USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Drivers can create vehicle checks" ON public.vehicle_checks
FOR INSERT WITH CHECK (
  driver_id = auth.uid() AND
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Admins can manage org vehicle checks" ON public.vehicle_checks
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role = ANY(ARRAY['admin', 'council'])
  )
);

-- Time entries policies
CREATE POLICY "Drivers can view their time entries" ON public.time_entries
FOR SELECT USING (driver_id = auth.uid());

CREATE POLICY "Drivers can manage their time entries" ON public.time_entries
FOR ALL USING (driver_id = auth.uid());

CREATE POLICY "Admins can view org time entries" ON public.time_entries
FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role = ANY(ARRAY['admin', 'council'])
  )
);

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON public.notifications
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON public.notifications
FOR UPDATE USING (user_id = auth.uid());

-- Add missing core tables that are referenced in code

-- Route assignments table
CREATE TABLE IF NOT EXISTS public.route_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id),
  assignment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TIME,
  end_time TIME,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  organization_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(route_id, assignment_date, driver_id)
);

ALTER TABLE public.route_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org route assignments" ON public.route_assignments
FOR SELECT USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Drivers can view their assignments" ON public.route_assignments
FOR SELECT USING (driver_id = auth.uid());

CREATE POLICY "Admins can manage org route assignments" ON public.route_assignments
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role = ANY(ARRAY['admin', 'council'])
  )
);

-- Job assignments table
CREATE TABLE IF NOT EXISTS public.job_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  assigned_by UUID,
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'in_progress', 'completed', 'cancelled')),
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  organization_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.job_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org job assignments" ON public.job_assignments
FOR SELECT USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Drivers can view their job assignments" ON public.job_assignments
FOR SELECT USING (driver_id = auth.uid());

CREATE POLICY "Drivers can update their assignments" ON public.job_assignments
FOR UPDATE USING (driver_id = auth.uid());

CREATE POLICY "Admins can manage org job assignments" ON public.job_assignments
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role = ANY(ARRAY['admin', 'council'])
  )
);

-- Student pickups table
CREATE TABLE IF NOT EXISTS public.student_pickups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id BIGINT NOT NULL REFERENCES public.child_profiles(id),
  route_id UUID REFERENCES public.routes(id),
  driver_id UUID NOT NULL,
  pickup_time TIMESTAMPTZ NOT NULL,
  pickup_location TEXT NOT NULL,
  dropoff_time TIMESTAMPTZ,
  dropoff_location TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'picked_up', 'dropped_off', 'absent', 'cancelled')),
  pickup_confirmed_by UUID,
  dropoff_confirmed_by UUID,
  parent_notified_pickup BOOLEAN DEFAULT false,
  parent_notified_dropoff BOOLEAN DEFAULT false,
  notes TEXT,
  organization_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.student_pickups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org student pickups" ON public.student_pickups
FOR SELECT USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Drivers can view their student pickups" ON public.student_pickups
FOR SELECT USING (driver_id = auth.uid());

CREATE POLICY "Drivers can update their student pickups" ON public.student_pickups
FOR UPDATE USING (driver_id = auth.uid());

CREATE POLICY "Admins can manage org student pickups" ON public.student_pickups
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role = ANY(ARRAY['admin', 'council'])
  )
);

-- Driver locations table for real-time tracking
CREATE TABLE IF NOT EXISTS public.driver_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  accuracy_meters INTEGER,
  altitude_meters INTEGER,
  speed_kmh DECIMAL(5,2),
  heading_degrees INTEGER,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  route_id UUID REFERENCES public.routes(id),
  vehicle_id UUID REFERENCES public.vehicles(id),
  organization_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_driver_locations_driver_time ON public.driver_locations(driver_id, recorded_at DESC);
CREATE INDEX idx_driver_locations_route ON public.driver_locations(route_id);

CREATE POLICY "Drivers can insert their locations" ON public.driver_locations
FOR INSERT WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Users can view org driver locations" ON public.driver_locations
FOR SELECT USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Admins can manage org driver locations" ON public.driver_locations
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role = ANY(ARRAY['admin', 'council'])
  )
);

-- Update triggers for timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_route_assignments_updated_at
    BEFORE UPDATE ON public.route_assignments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_assignments_updated_at
    BEFORE UPDATE ON public.job_assignments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_pickups_updated_at
    BEFORE UPDATE ON public.student_pickups
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();