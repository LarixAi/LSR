-- =====================================================
-- ADD MISSING COLUMNS TO DRIVER LICENSES TABLE
-- =====================================================

-- Add missing columns to driver_licenses table
ALTER TABLE public.driver_licenses 
ADD COLUMN IF NOT EXISTS medical_certificate_expiry DATE,
ADD COLUMN IF NOT EXISTS background_check_expiry DATE,
ADD COLUMN IF NOT EXISTS drug_test_expiry DATE,
ADD COLUMN IF NOT EXISTS training_expiry DATE;

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_driver_licenses_medical_expiry ON public.driver_licenses(medical_certificate_expiry);
CREATE INDEX IF NOT EXISTS idx_driver_licenses_background_expiry ON public.driver_licenses(background_check_expiry);
CREATE INDEX IF NOT EXISTS idx_driver_licenses_drug_test_expiry ON public.driver_licenses(drug_test_expiry);
CREATE INDEX IF NOT EXISTS idx_driver_licenses_training_expiry ON public.driver_licenses(training_expiry);
CREATE INDEX IF NOT EXISTS idx_driver_licenses_license_type ON public.driver_licenses(license_type);

-- Update license_type constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'driver_licenses_license_type_check'
    ) THEN
        ALTER TABLE public.driver_licenses 
        ADD CONSTRAINT driver_licenses_license_type_check 
        CHECK (license_type IN ('CDL-A', 'CDL-B', 'CDL-C', 'Regular', 'International'));
    END IF;
END $$;

-- Create or replace views
CREATE OR REPLACE VIEW public.expiring_licenses AS
SELECT 
    dl.*,
    p.first_name,
    p.last_name,
    p.email,
    p.phone,
    o.name as organization_name
FROM public.driver_licenses dl
JOIN public.profiles p ON dl.driver_id = p.id
JOIN public.organizations o ON dl.organization_id = o.id
WHERE dl.status = 'active' 
    AND dl.expiry_date <= (CURRENT_DATE + INTERVAL '30 days')
    AND dl.expiry_date >= CURRENT_DATE;

CREATE OR REPLACE VIEW public.license_statistics AS
SELECT 
    organization_id,
    COUNT(*) as total_licenses,
    COUNT(*) FILTER (WHERE status = 'active') as active_licenses,
    COUNT(*) FILTER (WHERE status = 'expired') as expired_licenses,
    COUNT(*) FILTER (WHERE status = 'suspended') as suspended_licenses,
    COUNT(*) FILTER (WHERE status = 'revoked') as revoked_licenses,
    COUNT(*) FILTER (WHERE status = 'active' AND expiry_date <= (CURRENT_DATE + INTERVAL '30 days')) as expiring_soon
FROM public.driver_licenses
GROUP BY organization_id;

-- Grant permissions on views
GRANT SELECT ON public.expiring_licenses TO authenticated;
GRANT SELECT ON public.license_statistics TO authenticated;

