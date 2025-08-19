
-- Create jobs table
CREATE TABLE public.jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  route_id UUID REFERENCES public.routes(id),
  driver_id UUID REFERENCES public.profiles(id),
  vehicle_id UUID REFERENCES public.vehicles(id),
  status TEXT CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')) DEFAULT 'scheduled',
  start_time TIME,
  end_time TIME,
  job_date DATE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  file_url TEXT,
  file_size TEXT,
  uploaded_by UUID REFERENCES public.profiles(id),
  upload_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,
  status TEXT CHECK (status IN ('valid', 'expiring_soon', 'expired')) DEFAULT 'valid',
  related_entity_id UUID, -- Can reference driver, vehicle, or route
  related_entity_type TEXT CHECK (related_entity_type IN ('driver', 'vehicle', 'route')),
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for jobs
CREATE POLICY "Admins and council can manage jobs" ON public.jobs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'council')
    )
  );

CREATE POLICY "Drivers can view their assigned jobs" ON public.jobs
  FOR SELECT USING (
    driver_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'council')
    )
  );

-- RLS policies for documents
CREATE POLICY "Admins and council can manage documents" ON public.documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'council')
    )
  );

CREATE POLICY "Users can view relevant documents" ON public.documents
  FOR SELECT USING (
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'council', 'driver')
    )
  );

-- Update existing vehicles table RLS policies to be more specific
DROP POLICY IF EXISTS "Admins and council can manage vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Drivers can view assigned vehicles" ON public.vehicles;

CREATE POLICY "Admins and council can manage vehicles" ON public.vehicles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'council')
    )
  );

CREATE POLICY "Drivers can view vehicles" ON public.vehicles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'driver'
    )
  );

CREATE POLICY "Parents can view active vehicles" ON public.vehicles
  FOR SELECT USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'parent'
    )
  );
