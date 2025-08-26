-- Create defect_reports table for defect tracking
CREATE TABLE IF NOT EXISTS public.defect_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  defect_type TEXT NOT NULL CHECK (defect_type IN ('mechanical', 'electrical', 'body', 'interior', 'safety', 'cosmetic', 'performance', 'other')),
  description TEXT NOT NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'reported' CHECK (status IN ('reported', 'investigating', 'approved', 'in_progress', 'resolved', 'closed', 'rejected')),
  location TEXT,
  component_affected TEXT,
  estimated_repair_cost DECIMAL(10,2),
  actual_repair_cost DECIMAL(10,2),
  reported_date DATE NOT NULL,
  investigated_date DATE,
  investigation_notes TEXT,
  investigation_by UUID REFERENCES public.profiles(id),
  approved_date DATE,
  approved_by UUID REFERENCES public.profiles(id),
  work_order_id UUID REFERENCES public.work_orders(id),
  resolved_date DATE,
  resolution_notes TEXT,
  resolution_method TEXT,
  parts_used TEXT[],
  labor_hours DECIMAL(5,2),
  warranty_claim BOOLEAN DEFAULT false,
  warranty_claim_number TEXT,
  warranty_claim_status TEXT,
  photos TEXT[], -- URLs to defect photos
  attachments TEXT[], -- URLs to additional files
  safety_implications BOOLEAN DEFAULT false,
  safety_implications_details TEXT,
  operational_impact TEXT,
  customer_notified BOOLEAN DEFAULT false,
  customer_notification_date DATE,
  customer_response TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  follow_up_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_defect_reports_organization_id ON public.defect_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_defect_reports_vehicle_id ON public.defect_reports(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_defect_reports_reported_by ON public.defect_reports(reported_by);
CREATE INDEX IF NOT EXISTS idx_defect_reports_defect_type ON public.defect_reports(defect_type);
CREATE INDEX IF NOT EXISTS idx_defect_reports_severity ON public.defect_reports(severity);
CREATE INDEX IF NOT EXISTS idx_defect_reports_status ON public.defect_reports(status);
CREATE INDEX IF NOT EXISTS idx_defect_reports_reported_date ON public.defect_reports(reported_date);
CREATE INDEX IF NOT EXISTS idx_defect_reports_work_order_id ON public.defect_reports(work_order_id);

-- Enable Row Level Security
ALTER TABLE public.defect_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view defect reports from their organization" ON public.defect_reports
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert defect reports for their organization" ON public.defect_reports
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update defect reports from their organization" ON public.defect_reports
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete defect reports from their organization" ON public.defect_reports
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Create updated_at trigger
CREATE TRIGGER handle_defect_reports_updated_at
  BEFORE UPDATE ON public.defect_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
