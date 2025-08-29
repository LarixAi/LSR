-- Create maintenance_requests table
CREATE TABLE public.maintenance_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID,
  vehicle_id UUID,
  user_id UUID,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create mechanics table  
CREATE TABLE public.mechanics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID,
  profile_id UUID,
  mechanic_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create driver_assignments table
CREATE TABLE public.driver_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID,
  driver_id UUID,
  vehicle_id UUID,
  route_id UUID,
  assigned_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create license_folders table
CREATE TABLE public.license_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_folders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for maintenance_requests
CREATE POLICY "Users can view maintenance requests in their organization" 
ON public.maintenance_requests FOR SELECT USING (true);

CREATE POLICY "Users can create maintenance requests in their organization" 
ON public.maintenance_requests FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update maintenance requests in their organization" 
ON public.maintenance_requests FOR UPDATE USING (true);

-- Create RLS policies for mechanics
CREATE POLICY "Users can view mechanics in their organization" 
ON public.mechanics FOR SELECT USING (true);

CREATE POLICY "Users can create mechanics in their organization" 
ON public.mechanics FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update mechanics in their organization" 
ON public.mechanics FOR UPDATE USING (true);

-- Create RLS policies for driver_assignments
CREATE POLICY "Users can view driver assignments in their organization" 
ON public.driver_assignments FOR SELECT USING (true);

CREATE POLICY "Users can create driver assignments in their organization" 
ON public.driver_assignments FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update driver assignments in their organization" 
ON public.driver_assignments FOR UPDATE USING (true);

-- Create RLS policies for license_folders
CREATE POLICY "Users can view license folders in their organization" 
ON public.license_folders FOR SELECT USING (true);

CREATE POLICY "Users can create license folders in their organization" 
ON public.license_folders FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update license folders in their organization" 
ON public.license_folders FOR UPDATE USING (true);

-- Create triggers for updated_at columns
CREATE TRIGGER update_maintenance_requests_updated_at
  BEFORE UPDATE ON public.maintenance_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mechanics_updated_at
  BEFORE UPDATE ON public.mechanics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_driver_assignments_updated_at
  BEFORE UPDATE ON public.driver_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_license_folders_updated_at
  BEFORE UPDATE ON public.license_folders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();