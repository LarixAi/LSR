-- =====================================================
-- CREATE DRIVER LICENSES TABLE
-- =====================================================

-- Create driver_licenses table
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
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_driver_licenses_driver_id ON public.driver_licenses(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_licenses_organization_id ON public.driver_licenses(organization_id);
CREATE INDEX IF NOT EXISTS idx_driver_licenses_expiry_date ON public.driver_licenses(expiry_date);
CREATE INDEX IF NOT EXISTS idx_driver_licenses_status ON public.driver_licenses(status);
CREATE INDEX IF NOT EXISTS idx_driver_licenses_license_number ON public.driver_licenses(license_number);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.driver_licenses ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES
-- =====================================================

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

-- =====================================================
-- CREATE UPDATED_AT TRIGGER
-- =====================================================

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
