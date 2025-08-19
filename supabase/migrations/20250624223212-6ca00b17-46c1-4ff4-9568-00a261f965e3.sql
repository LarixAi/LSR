
-- Create mechanics table
CREATE TABLE public.mechanics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  mechanic_license_number TEXT,
  specializations TEXT[],
  certification_level TEXT CHECK (certification_level IN ('apprentice', 'journeyman', 'master', 'certified_technician')),
  hourly_rate DECIMAL(10,2),
  availability_schedule JSONB, -- Store weekly schedule
  is_available BOOLEAN DEFAULT true,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create maintenance_requests table
CREATE TABLE public.maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  mechanic_id UUID REFERENCES public.mechanics(id),
  requested_by UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  parts_needed TEXT[],
  scheduled_date DATE,
  completed_date DATE,
  notes TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create maintenance_logs table for tracking work done
CREATE TABLE public.maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maintenance_request_id UUID REFERENCES public.maintenance_requests(id) ON DELETE CASCADE NOT NULL,
  mechanic_id UUID REFERENCES public.mechanics(id) NOT NULL,
  work_description TEXT NOT NULL,
  hours_worked DECIMAL(5,2),
  parts_used JSONB, -- Array of parts with quantities and costs
  status_update TEXT,
  log_date DATE DEFAULT CURRENT_DATE,
  log_time TIME DEFAULT CURRENT_TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mechanic_vehicle_assignments table
CREATE TABLE public.mechanic_vehicle_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mechanic_id UUID REFERENCES public.mechanics(id) ON DELETE CASCADE NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  assigned_date DATE DEFAULT CURRENT_DATE,
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add maintenance_status column to vehicles table
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS maintenance_status TEXT CHECK (maintenance_status IN ('operational', 'maintenance_due', 'in_maintenance', 'out_of_service')) DEFAULT 'operational';
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS last_maintenance_date DATE;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS next_maintenance_due DATE;

-- Enable RLS on all new tables
ALTER TABLE public.mechanics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanic_vehicle_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies for mechanics
CREATE POLICY "Admins and council can manage mechanics" ON public.mechanics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'council')
    )
  );

CREATE POLICY "Mechanics can view their own profile" ON public.mechanics
  FOR SELECT USING (profile_id = auth.uid());

-- RLS policies for maintenance_requests
CREATE POLICY "Admins and mechanics can view maintenance requests" ON public.maintenance_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'council', 'mechanic')
    )
  );

CREATE POLICY "Admins can manage maintenance requests" ON public.maintenance_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'council')
    )
  );

CREATE POLICY "Mechanics can update assigned requests" ON public.maintenance_requests
  FOR UPDATE USING (
    mechanic_id IN (
      SELECT id FROM public.mechanics WHERE profile_id = auth.uid()
    )
  );

-- RLS policies for maintenance_logs
CREATE POLICY "Admins and mechanics can view maintenance logs" ON public.maintenance_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'council', 'mechanic')
    )
  );

CREATE POLICY "Mechanics can create logs for their work" ON public.maintenance_logs
  FOR INSERT WITH CHECK (
    mechanic_id IN (
      SELECT id FROM public.mechanics WHERE profile_id = auth.uid()
    )
  );

-- RLS policies for mechanic_vehicle_assignments
CREATE POLICY "Admins can manage vehicle assignments" ON public.mechanic_vehicle_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'council')
    )
  );

CREATE POLICY "Mechanics can view their assignments" ON public.mechanic_vehicle_assignments
  FOR SELECT USING (
    mechanic_id IN (
      SELECT id FROM public.mechanics WHERE profile_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mechanics_profile_id ON public.mechanics(profile_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_vehicle_id ON public.maintenance_requests(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_mechanic_id ON public.maintenance_requests(mechanic_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON public.maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_request_id ON public.maintenance_logs(maintenance_request_id);
CREATE INDEX IF NOT EXISTS idx_mechanic_assignments_mechanic_id ON public.mechanic_vehicle_assignments(mechanic_id);
CREATE INDEX IF NOT EXISTS idx_mechanic_assignments_vehicle_id ON public.mechanic_vehicle_assignments(vehicle_id);
