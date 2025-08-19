-- Add missing tables that forms might need

-- Maintenance scheduling table (for maintenance forms)
CREATE TABLE IF NOT EXISTS public.maintenance_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL,
  maintenance_type TEXT NOT NULL,
  frequency_days INTEGER NOT NULL DEFAULT 90,
  last_completed DATE,
  next_due_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  organization_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Driver certifications table (for driver training forms)
CREATE TABLE IF NOT EXISTS public.driver_certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL,
  certification_type TEXT NOT NULL,
  certification_number TEXT,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  issuing_authority TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  organization_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Vehicle insurance table (for vehicle forms)
CREATE TABLE IF NOT EXISTS public.vehicle_insurance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL,
  policy_number TEXT NOT NULL,
  provider TEXT NOT NULL,
  policy_start_date DATE NOT NULL,
  policy_end_date DATE NOT NULL,
  coverage_type TEXT NOT NULL,
  premium_amount DECIMAL(10,2),
  deductible_amount DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'active',
  organization_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Emergency contacts table (for profile forms)
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contact_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  organization_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Document folders table (for document management forms)
CREATE TABLE IF NOT EXISTS public.document_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  parent_folder_id UUID,
  organization_id UUID NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for the new tables
ALTER TABLE public.maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_folders ENABLE ROW LEVEL SECURITY;

-- RLS policies for maintenance_schedules
CREATE POLICY "Organization members can view maintenance schedules"
ON public.maintenance_schedules FOR SELECT
USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Admins and mechanics can manage maintenance schedules"
ON public.maintenance_schedules FOR ALL
USING (organization_id IN (
  SELECT organization_id FROM public.profiles 
  WHERE id = auth.uid() AND role IN ('admin', 'council', 'mechanic')
));

-- RLS policies for driver_certifications
CREATE POLICY "Drivers can view own certifications"
ON public.driver_certifications FOR SELECT
USING (driver_id = auth.uid() OR organization_id IN (
  SELECT organization_id FROM public.profiles 
  WHERE id = auth.uid() AND role IN ('admin', 'council', 'compliance_officer')
));

CREATE POLICY "Admins and compliance officers can manage certifications"
ON public.driver_certifications FOR ALL
USING (organization_id IN (
  SELECT organization_id FROM public.profiles 
  WHERE id = auth.uid() AND role IN ('admin', 'council', 'compliance_officer')
));

-- RLS policies for vehicle_insurance
CREATE POLICY "Organization members can view vehicle insurance"
ON public.vehicle_insurance FOR SELECT
USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Admins can manage vehicle insurance"
ON public.vehicle_insurance FOR ALL
USING (organization_id IN (
  SELECT organization_id FROM public.profiles 
  WHERE id = auth.uid() AND role IN ('admin', 'council')
));

-- RLS policies for emergency_contacts
CREATE POLICY "Users can manage own emergency contacts"
ON public.emergency_contacts FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Admins can view organization emergency contacts"
ON public.emergency_contacts FOR SELECT
USING (organization_id IN (
  SELECT organization_id FROM public.profiles 
  WHERE id = auth.uid() AND role IN ('admin', 'council')
));

-- RLS policies for document_folders
CREATE POLICY "Organization members can view document folders"
ON public.document_folders FOR SELECT
USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can manage document folders"
ON public.document_folders FOR ALL
USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

-- Add updated_at triggers
CREATE TRIGGER update_maintenance_schedules_updated_at
  BEFORE UPDATE ON public.maintenance_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_driver_certifications_updated_at
  BEFORE UPDATE ON public.driver_certifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehicle_insurance_updated_at
  BEFORE UPDATE ON public.vehicle_insurance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at
  BEFORE UPDATE ON public.emergency_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_document_folders_updated_at
  BEFORE UPDATE ON public.document_folders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();