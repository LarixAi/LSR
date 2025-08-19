-- =====================================================
-- CREATE COMPLIANCE ALERTS TABLE
-- =====================================================

-- Create compliance_alerts table
CREATE TABLE IF NOT EXISTS public.compliance_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alert_type TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    title TEXT NOT NULL,
    description TEXT,
    driver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    license_id UUID REFERENCES public.driver_licenses(id) ON DELETE CASCADE,
    alert_date DATE NOT NULL,
    due_date DATE,
    status TEXT CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    resolved_date TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    compliance_rule_id TEXT,
    violation_type TEXT,
    penalty_amount DECIMAL(10,2),
    points_deducted INTEGER DEFAULT 0,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_compliance_alerts_organization_id ON public.compliance_alerts(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_driver_id ON public.compliance_alerts(driver_id);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_vehicle_id ON public.compliance_alerts(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_alert_date ON public.compliance_alerts(alert_date);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_due_date ON public.compliance_alerts(due_date);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_status ON public.compliance_alerts(status);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_severity ON public.compliance_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_alert_type ON public.compliance_alerts(alert_type);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.compliance_alerts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES
-- =====================================================

CREATE POLICY "Users can view compliance alerts in their organization" ON public.compliance_alerts
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can insert compliance alerts in their organization" ON public.compliance_alerts
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        ) AND
        created_by = auth.uid()
    );

CREATE POLICY "Users can update compliance alerts in their organization" ON public.compliance_alerts
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete compliance alerts in their organization" ON public.compliance_alerts
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- =====================================================
-- CREATE UPDATED_AT TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION update_compliance_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_compliance_alerts_updated_at
    BEFORE UPDATE ON public.compliance_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_compliance_alerts_updated_at();
