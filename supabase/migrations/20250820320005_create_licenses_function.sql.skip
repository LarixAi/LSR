-- =====================================================
-- CREATE FUNCTION TO FETCH LICENSES WITH DRIVER INFO
-- =====================================================

-- Function to get licenses with driver information
CREATE OR REPLACE FUNCTION get_licenses_with_drivers(org_id UUID)
RETURNS TABLE (
  id UUID,
  driver_id UUID,
  license_number TEXT,
  license_type TEXT,
  issuing_authority TEXT,
  issue_date DATE,
  expiry_date DATE,
  status TEXT,
  license_class TEXT,
  endorsements TEXT[],
  restrictions TEXT[],
  points_balance INTEGER,
  notes TEXT,
  organization_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  medical_certificate_expiry DATE,
  background_check_expiry DATE,
  drug_test_expiry DATE,
  training_expiry DATE,
  driver_name TEXT,
  driver_email TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dl.id,
    dl.driver_id,
    dl.license_number,
    dl.license_type,
    dl.issuing_authority,
    dl.issue_date,
    dl.expiry_date,
    dl.status,
    dl.license_class,
    dl.endorsements,
    dl.restrictions,
    dl.points_balance,
    dl.notes,
    dl.organization_id,
    dl.created_at,
    dl.updated_at,
    dl.medical_certificate_expiry,
    dl.background_check_expiry,
    dl.drug_test_expiry,
    dl.training_expiry,
    COALESCE(p.first_name || ' ' || p.last_name, 'Unknown Driver') as driver_name,
    COALESCE(p.email, '') as driver_email
  FROM public.driver_licenses dl
  LEFT JOIN public.profiles p ON dl.driver_id = p.id
  WHERE dl.organization_id = org_id
  ORDER BY dl.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_licenses_with_drivers(UUID) TO authenticated;

