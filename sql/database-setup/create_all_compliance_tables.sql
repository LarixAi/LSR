-- =====================================================
-- CREATE ALL COMPLIANCE TABLES
-- =====================================================

-- =====================================================
-- 1. CREATE DRIVER LICENSES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.driver_licenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    license_number TEXT NOT NULL,
    license_type TEXT NOT NULL,
    issuing_authority TEXT,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status TEXT CHECK (status IN ('active', 'expired', 'suspended', 'revoked')) DEFAULT 'active',
    license_class TEXT,
    endorsements TEXT[],
    restrictions TEXT[],
    points_balance INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE COMPLIANCE ALERTS TABLE
-- =====================================================

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
-- 3. CREATE COMPLIANCE VIOLATIONS TABLE
-- =====================================================

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
-- 4. CREATE COMPLIANCE AUDIT LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.compliance_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action_type TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================

-- Driver Licenses Indexes
CREATE INDEX IF NOT EXISTS idx_driver_licenses_driver_id ON public.driver_licenses(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_licenses_organization_id ON public.driver_licenses(organization_id);
CREATE INDEX IF NOT EXISTS idx_driver_licenses_expiry_date ON public.driver_licenses(expiry_date);
CREATE INDEX IF NOT EXISTS idx_driver_licenses_status ON public.driver_licenses(status);
CREATE INDEX IF NOT EXISTS idx_driver_licenses_license_number ON public.driver_licenses(license_number);

-- Compliance Alerts Indexes
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_organization_id ON public.compliance_alerts(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_driver_id ON public.compliance_alerts(driver_id);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_vehicle_id ON public.compliance_alerts(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_alert_date ON public.compliance_alerts(alert_date);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_due_date ON public.compliance_alerts(due_date);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_status ON public.compliance_alerts(status);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_severity ON public.compliance_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_alert_type ON public.compliance_alerts(alert_type);

-- Compliance Violations Indexes
CREATE INDEX IF NOT EXISTS idx_compliance_violations_organization_id ON public.compliance_violations(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_driver_id ON public.compliance_violations(driver_id);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_vehicle_id ON public.compliance_violations(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_violation_date ON public.compliance_violations(violation_date);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_status ON public.compliance_violations(status);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_severity ON public.compliance_violations(severity);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_violation_type ON public.compliance_violations(violation_type);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_case_number ON public.compliance_violations(case_number);

-- Compliance Audit Logs Indexes
CREATE INDEX IF NOT EXISTS idx_compliance_audit_logs_organization_id ON public.compliance_audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_logs_user_id ON public.compliance_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_logs_table_name ON public.compliance_audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_logs_created_at ON public.compliance_audit_logs(created_at);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.driver_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES
-- =====================================================

-- Driver Licenses Policies
CREATE POLICY "Users can view driver licenses in their organization" ON public.driver_licenses
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can insert driver licenses in their organization" ON public.driver_licenses
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update driver licenses in their organization" ON public.driver_licenses
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete driver licenses in their organization" ON public.driver_licenses
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- Compliance Alerts Policies
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

-- Compliance Violations Policies
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

-- Compliance Audit Logs Policies
CREATE POLICY "Users can view compliance audit logs in their organization" ON public.compliance_audit_logs
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can insert compliance audit logs in their organization" ON public.compliance_audit_logs
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- =====================================================
-- CREATE UPDATED_AT TRIGGERS
-- =====================================================

-- Driver Licenses Trigger
CREATE OR REPLACE FUNCTION update_driver_licenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_driver_licenses_updated_at
    BEFORE UPDATE ON public.driver_licenses
    FOR EACH ROW
    EXECUTE FUNCTION update_driver_licenses_updated_at();

-- Compliance Alerts Trigger
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

-- Compliance Violations Trigger
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
