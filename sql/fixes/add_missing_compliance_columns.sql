-- =====================================================
-- ADD MISSING COLUMNS TO COMPLIANCE_VIOLATIONS TABLE
-- =====================================================

-- Add missing columns to existing compliance_violations table
DO $$ 
BEGIN
    -- Add case_number column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'compliance_violations' 
                   AND column_name = 'case_number') THEN
        ALTER TABLE public.compliance_violations ADD COLUMN case_number TEXT;
    END IF;

    -- Add citation_number column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'compliance_violations' 
                   AND column_name = 'citation_number') THEN
        ALTER TABLE public.compliance_violations ADD COLUMN citation_number TEXT;
    END IF;

    -- Add officer_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'compliance_violations' 
                   AND column_name = 'officer_name') THEN
        ALTER TABLE public.compliance_violations ADD COLUMN officer_name TEXT;
    END IF;

    -- Add officer_badge column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'compliance_violations' 
                   AND column_name = 'officer_badge') THEN
        ALTER TABLE public.compliance_violations ADD COLUMN officer_badge TEXT;
    END IF;

    -- Add evidence_files column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'compliance_violations' 
                   AND column_name = 'evidence_files') THEN
        ALTER TABLE public.compliance_violations ADD COLUMN evidence_files TEXT[];
    END IF;

    -- Add witness_statements column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'compliance_violations' 
                   AND column_name = 'witness_statements') THEN
        ALTER TABLE public.compliance_violations ADD COLUMN witness_statements TEXT;
    END IF;

    -- Add appeal_status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'compliance_violations' 
                   AND column_name = 'appeal_status') THEN
        ALTER TABLE public.compliance_violations ADD COLUMN appeal_status TEXT CHECK (appeal_status IN ('none', 'pending', 'approved', 'rejected')) DEFAULT 'none';
    END IF;

    -- Add appeal_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'compliance_violations' 
                   AND column_name = 'appeal_date') THEN
        ALTER TABLE public.compliance_violations ADD COLUMN appeal_date DATE;
    END IF;

    -- Add appeal_outcome column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'compliance_violations' 
                   AND column_name = 'appeal_outcome') THEN
        ALTER TABLE public.compliance_violations ADD COLUMN appeal_outcome TEXT;
    END IF;

    -- Add court_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'compliance_violations' 
                   AND column_name = 'court_date') THEN
        ALTER TABLE public.compliance_violations ADD COLUMN court_date DATE;
    END IF;

    -- Add court_outcome column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'compliance_violations' 
                   AND column_name = 'court_outcome') THEN
        ALTER TABLE public.compliance_violations ADD COLUMN court_outcome TEXT;
    END IF;

    -- Add fine_amount column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'compliance_violations' 
                   AND column_name = 'fine_amount') THEN
        ALTER TABLE public.compliance_violations ADD COLUMN fine_amount DECIMAL(10,2) DEFAULT 0;
    END IF;

    -- Add points_deducted column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'compliance_violations' 
                   AND column_name = 'points_deducted') THEN
        ALTER TABLE public.compliance_violations ADD COLUMN points_deducted INTEGER DEFAULT 0;
    END IF;

    -- Add penalty_amount column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'compliance_violations' 
                   AND column_name = 'penalty_amount') THEN
        ALTER TABLE public.compliance_violations ADD COLUMN penalty_amount DECIMAL(10,2) DEFAULT 0;
    END IF;

    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'compliance_violations' 
                   AND column_name = 'status') THEN
        ALTER TABLE public.compliance_violations ADD COLUMN status TEXT CHECK (status IN ('pending', 'investigating', 'resolved', 'appealed', 'closed')) DEFAULT 'pending';
    END IF;

    -- Add severity column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'compliance_violations' 
                   AND column_name = 'severity') THEN
        ALTER TABLE public.compliance_violations ADD COLUMN severity TEXT CHECK (severity IN ('minor', 'moderate', 'major', 'critical')) DEFAULT 'moderate';
    END IF;

    -- Add location column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'compliance_violations' 
                   AND column_name = 'location') THEN
        ALTER TABLE public.compliance_violations ADD COLUMN location TEXT;
    END IF;

    -- Add reported_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'compliance_violations' 
                   AND column_name = 'reported_date') THEN
        ALTER TABLE public.compliance_violations ADD COLUMN reported_date DATE;
    END IF;

    -- Add detected_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'compliance_violations' 
                   AND column_name = 'detected_date') THEN
        ALTER TABLE public.compliance_violations ADD COLUMN detected_date DATE;
    END IF;

    -- Add violation_code column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'compliance_violations' 
                   AND column_name = 'violation_code') THEN
        ALTER TABLE public.compliance_violations ADD COLUMN violation_code TEXT;
    END IF;

    -- Add license_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'compliance_violations' 
                   AND column_name = 'license_id') THEN
        ALTER TABLE public.compliance_violations ADD COLUMN license_id UUID REFERENCES public.driver_licenses(id) ON DELETE CASCADE;
    END IF;

    -- Add organization_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'compliance_violations' 
                   AND column_name = 'organization_id') THEN
        ALTER TABLE public.compliance_violations ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
    END IF;

    -- Add created_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'compliance_violations' 
                   AND column_name = 'created_by') THEN
        ALTER TABLE public.compliance_violations ADD COLUMN created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'compliance_violations' 
                   AND column_name = 'created_at') THEN
        ALTER TABLE public.compliance_violations ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'compliance_violations' 
                   AND column_name = 'updated_at') THEN
        ALTER TABLE public.compliance_violations ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

END $$;

-- =====================================================
-- CREATE INDEXES IF THEY DON'T EXIST
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
-- DROP EXISTING POLICIES AND RECREATE
-- =====================================================

DROP POLICY IF EXISTS "Users can view compliance violations in their organization" ON public.compliance_violations;
DROP POLICY IF EXISTS "Users can insert compliance violations in their organization" ON public.compliance_violations;
DROP POLICY IF EXISTS "Users can update compliance violations in their organization" ON public.compliance_violations;
DROP POLICY IF EXISTS "Users can delete compliance violations in their organization" ON public.compliance_violations;

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

DROP TRIGGER IF EXISTS trigger_update_compliance_violations_updated_at ON public.compliance_violations;

CREATE TRIGGER trigger_update_compliance_violations_updated_at
    BEFORE UPDATE ON public.compliance_violations
    FOR EACH ROW
    EXECUTE FUNCTION update_compliance_violations_updated_at();
