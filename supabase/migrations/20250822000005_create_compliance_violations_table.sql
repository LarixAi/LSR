-- Create compliance_violations table for regulatory violation tracking
CREATE TABLE IF NOT EXISTS public.compliance_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  violation_type TEXT NOT NULL CHECK (violation_type IN ('hours_of_service', 'speed_limit', 'vehicle_maintenance', 'documentation', 'safety_regulations', 'environmental', 'weight_limit', 'route_violation', 'other')),
  violation_date DATE NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed', 'appealed')),
  penalty_amount DECIMAL(10,2),
  penalty_currency TEXT DEFAULT 'GBP',
  resolution_date DATE,
  resolution_notes TEXT,
  regulatory_body TEXT,
  case_number TEXT,
  location TEXT,
  witnesses TEXT[],
  evidence_files TEXT[], -- URLs to evidence files
  corrective_actions TEXT[],
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  risk_assessment_score INTEGER CHECK (risk_assessment_score >= 1 AND risk_assessment_score <= 10),
  impact_on_operations TEXT,
  lessons_learned TEXT,
  created_by UUID REFERENCES public.profiles(id),
  assigned_to UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_compliance_violations_organization_id ON public.compliance_violations(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_driver_id ON public.compliance_violations(driver_id);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_vehicle_id ON public.compliance_violations(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_violation_date ON public.compliance_violations(violation_date);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_violation_type ON public.compliance_violations(violation_type);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_severity ON public.compliance_violations(severity);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_status ON public.compliance_violations(status);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_assigned_to ON public.compliance_violations(assigned_to);

-- Enable Row Level Security
ALTER TABLE public.compliance_violations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view compliance violations from their organization" ON public.compliance_violations
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert compliance violations for their organization" ON public.compliance_violations
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update compliance violations from their organization" ON public.compliance_violations
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete compliance violations from their organization" ON public.compliance_violations
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Create updated_at trigger
CREATE TRIGGER handle_compliance_violations_updated_at
  BEFORE UPDATE ON public.compliance_violations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
