-- Create rail_replacement_services table for rail replacement service management
CREATE TABLE IF NOT EXISTS public.rail_replacement_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  service_code TEXT UNIQUE,
  affected_line TEXT NOT NULL,
  service_type TEXT CHECK (service_type IN ('planned', 'emergency', 'maintenance', 'strike', 'weather', 'other')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent', 'critical')),
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'cancelled', 'suspended')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  frequency TEXT, -- e.g., 'every 30 minutes', 'hourly', 'on demand'
  vehicles_required INTEGER,
  vehicles_assigned INTEGER DEFAULT 0,
  passengers_affected INTEGER,
  estimated_cost DECIMAL(12,2),
  actual_cost DECIMAL(12,2),
  revenue DECIMAL(12,2),
  rail_operator TEXT,
  operator_contact TEXT,
  operator_phone TEXT,
  operator_email TEXT,
  special_requirements TEXT[],
  route_details TEXT,
  pickup_locations TEXT[],
  dropoff_locations TEXT[],
  notes TEXT,
  performance_metrics JSONB, -- Store performance data as JSON
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create basic indexes for better performance (additional indexes will be added in later migration)
CREATE INDEX IF NOT EXISTS idx_rail_replacement_services_organization_id ON public.rail_replacement_services(organization_id);
CREATE INDEX IF NOT EXISTS idx_rail_replacement_services_affected_line ON public.rail_replacement_services(affected_line);

-- Enable Row Level Security
ALTER TABLE public.rail_replacement_services ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view rail replacement services from their organization" ON public.rail_replacement_services
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert rail replacement services for their organization" ON public.rail_replacement_services
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update rail replacement services from their organization" ON public.rail_replacement_services
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete rail replacement services from their organization" ON public.rail_replacement_services
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Create updated_at trigger
CREATE TRIGGER handle_rail_replacement_services_updated_at
  BEFORE UPDATE ON public.rail_replacement_services
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
