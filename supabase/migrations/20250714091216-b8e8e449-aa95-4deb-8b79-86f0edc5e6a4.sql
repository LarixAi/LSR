-- Tachograph Management Tables
CREATE TABLE public.tachograph_records (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('digital', 'analogue')),
    file_url TEXT,
    card_download_date TIMESTAMP WITH TIME ZONE,
    head_download_date TIMESTAMP WITH TIME ZONE,
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed', 'requires_attention')),
    issues_found INTEGER DEFAULT 0,
    next_download_due DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.tachograph_issues (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tachograph_id UUID REFERENCES public.tachograph_records(id) ON DELETE CASCADE NOT NULL,
    issue_type TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    resolved_by UUID REFERENCES public.profiles(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Route Planning & Job Pricing Tables
CREATE TABLE public.route_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    start_location TEXT NOT NULL,
    end_location TEXT NOT NULL,
    waypoints JSONB DEFAULT '[]',
    estimated_duration_minutes INTEGER,
    estimated_distance_km NUMERIC(10,2),
    base_price NUMERIC(10,2),
    price_per_km NUMERIC(10,2),
    price_per_hour NUMERIC(10,2),
    vehicle_requirements JSONB DEFAULT '{}',
    compliance_notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.job_pricing (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    route_template_id UUID REFERENCES public.route_templates(id),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    base_price NUMERIC(10,2) NOT NULL,
    distance_price NUMERIC(10,2) DEFAULT 0,
    time_price NUMERIC(10,2) DEFAULT 0,
    fuel_cost NUMERIC(10,2) DEFAULT 0,
    driver_cost NUMERIC(10,2) DEFAULT 0,
    vehicle_cost NUMERIC(10,2) DEFAULT 0,
    margin_percentage NUMERIC(5,2) DEFAULT 20,
    total_cost NUMERIC(10,2) NOT NULL,
    final_price NUMERIC(10,2) NOT NULL,
    pricing_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Compliance Monitoring Tables
CREATE TABLE public.compliance_alerts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    alert_type TEXT NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('driver', 'vehicle', 'tachograph', 'license', 'insurance', 'mot')),
    entity_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'expired')),
    acknowledged_by UUID REFERENCES public.profiles(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES public.profiles(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.compliance_audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    audit_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    compliance_status TEXT NOT NULL CHECK (compliance_status IN ('compliant', 'non_compliant', 'warning', 'expired')),
    details JSONB DEFAULT '{}',
    auditor_id UUID REFERENCES public.profiles(id),
    audit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Vehicle Maintenance & Compliance
CREATE TABLE public.vehicle_compliance (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    mot_expiry DATE,
    insurance_expiry DATE,
    tax_expiry DATE,
    next_service_due DATE,
    next_inspection_due DATE,
    annual_test_due DATE,
    compliance_status TEXT NOT NULL DEFAULT 'compliant' CHECK (compliance_status IN ('compliant', 'warning', 'expired', 'critical')),
    notes TEXT,
    last_updated_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tachograph_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tachograph_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_compliance ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Organization members can manage tachograph records" ON public.tachograph_records
FOR ALL USING (organization_id = get_user_organization_id());

CREATE POLICY "Organization members can manage tachograph issues" ON public.tachograph_issues
FOR ALL USING (EXISTS (
    SELECT 1 FROM public.tachograph_records tr 
    WHERE tr.id = tachograph_issues.tachograph_id 
    AND tr.organization_id = get_user_organization_id()
));

CREATE POLICY "Organization members can manage route templates" ON public.route_templates
FOR ALL USING (organization_id = get_user_organization_id());

CREATE POLICY "Organization members can manage job pricing" ON public.job_pricing
FOR ALL USING (organization_id = get_user_organization_id());

CREATE POLICY "Organization members can manage compliance alerts" ON public.compliance_alerts
FOR ALL USING (organization_id = get_user_organization_id());

CREATE POLICY "Organization members can manage compliance audit logs" ON public.compliance_audit_logs
FOR ALL USING (organization_id = get_user_organization_id());

CREATE POLICY "Organization members can manage vehicle compliance" ON public.vehicle_compliance
FOR ALL USING (organization_id = get_user_organization_id());

-- Create indexes for performance
CREATE INDEX idx_tachograph_records_vehicle_date ON public.tachograph_records(vehicle_id, date);
CREATE INDEX idx_tachograph_records_driver_date ON public.tachograph_records(driver_id, date);
CREATE INDEX idx_tachograph_records_next_download ON public.tachograph_records(next_download_due) WHERE next_download_due IS NOT NULL;
CREATE INDEX idx_compliance_alerts_due_date ON public.compliance_alerts(due_date) WHERE status = 'active';
CREATE INDEX idx_compliance_alerts_entity ON public.compliance_alerts(entity_type, entity_id);
CREATE INDEX idx_vehicle_compliance_status ON public.vehicle_compliance(compliance_status);

-- Create updated_at triggers
CREATE TRIGGER update_tachograph_records_updated_at
    BEFORE UPDATE ON public.tachograph_records
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_route_templates_updated_at
    BEFORE UPDATE ON public.route_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_pricing_updated_at
    BEFORE UPDATE ON public.job_pricing
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_alerts_updated_at
    BEFORE UPDATE ON public.compliance_alerts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehicle_compliance_updated_at
    BEFORE UPDATE ON public.vehicle_compliance
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();