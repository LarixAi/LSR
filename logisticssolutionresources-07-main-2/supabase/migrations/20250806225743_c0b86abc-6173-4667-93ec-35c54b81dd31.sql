-- Enable RLS on vehicle document related tables
ALTER TABLE public.vehicle_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_document_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_compliance_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vehicle_document_templates
CREATE POLICY "Organization members can view document templates" 
ON public.vehicle_document_templates 
FOR SELECT 
USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Admins can manage document templates" 
ON public.vehicle_document_templates 
FOR ALL 
USING (organization_id IN (
  SELECT organization_id FROM public.profiles 
  WHERE id = auth.uid() 
  AND role IN ('admin', 'council')
));

-- Create RLS policies for vehicle_documents
CREATE POLICY "Organization members can view vehicle documents" 
ON public.vehicle_documents 
FOR SELECT 
USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Organization members can manage vehicle documents" 
ON public.vehicle_documents 
FOR ALL 
USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

-- Create RLS policies for vehicle_document_alerts
CREATE POLICY "Organization members can view document alerts" 
ON public.vehicle_document_alerts 
FOR SELECT 
USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Admins can manage document alerts" 
ON public.vehicle_document_alerts 
FOR ALL 
USING (organization_id IN (
  SELECT organization_id FROM public.profiles 
  WHERE id = auth.uid() 
  AND role IN ('admin', 'council', 'compliance_officer')
));

-- Create RLS policies for vehicle_compliance_reports
CREATE POLICY "Organization members can view compliance reports" 
ON public.vehicle_compliance_reports 
FOR SELECT 
USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Organization members can manage compliance reports" 
ON public.vehicle_compliance_reports 
FOR ALL 
USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));