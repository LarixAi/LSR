-- =====================================================
-- CREATE COMPLIANCE VIOLATIONS TABLE
-- =====================================================

-- Create compliance_violations table
CREATE TABLE IF NOT EXISTS public.compliance_violations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    violation_type TEXT NOT NULL,
    violation_code TEXT,
    description TEXT NOT NULL,
    driver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    license_id UUID REFERENCES public.driver_licenses(id) ON DELETE CASCADE,
    violation_date DATE NOT NULL,
    detected_date DATE NOT NULL,
    reported_date DATE,
    location TEXT,
    severity TEXT CHECK (severity IN ('minor', 'moderate', 'major', 'critical')) DEFAULT 'moderate',
    status TEXT CHECK (status IN ('pending', 'investigating', 'resolved', 'appealed', 'closed')) DEFAULT 'pending',
    penalty_amount DECIMAL(10,2) DEFAULT 0,
    points_deducted INTEGER DEFAULT 0,
    fine_amount DECIMAL(10,2) DEFAULT 0,
    court_date DATE,
    court_outcome TEXT,
    appeal_status TEXT CHECK (appeal_status IN ('none', 'pending', 'approved', 'rejected')) DEFAULT 'none',
    appeal_date DATE,
    appeal_outcome TEXT,
    evidence_files TEXT[],
    witness_statements TEXT,
    officer_name TEXT,
    officer_badge TEXT,
    case_number TEXT,
    citation_number TEXT,
    notes TEXT,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_compliance_violations_organization_id ON public.compliance_violations(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_driver_id ON public.compliance_violations(driver_id);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_vehicle_id ON public.compliance_violations(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_violation_date ON public.compliance_violations(violation_date);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_status ON public.compliance_violations(status);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_severity ON public.compliance_violations(severity);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_violation_type ON public.compliance_violations(violation_type);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_case_number ON public.compliance_violations(case_number);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.compliance_violations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES
-- =====================================================

CREATE POLICY "Users can view compliance violations in their organization" ON public.compliance_violations
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can insert compliance violations in their organization" ON public.compliance_violations
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        ) AND
        created_by = auth.uid()
    );

CREATE POLICY "Users can update compliance violations in their organization" ON public.compliance_violations
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete compliance violations in their organization" ON public.compliance_violations
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- =====================================================
-- CREATE UPDATED_AT TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION update_compliance_violations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_compliance_violations_updated_at
    BEFORE UPDATE ON public.compliance_violations
    FOR EACH ROW
    EXECUTE FUNCTION update_compliance_violations_updated_at();
