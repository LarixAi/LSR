-- =====================================================
-- ADD SAMPLE LICENSE DATA
-- =====================================================

-- Insert sample driver licenses for testing
INSERT INTO public.driver_licenses (
    driver_id,
    license_number,
    license_type,
    issuing_authority,
    issue_date,
    expiry_date,
    status,
    license_class,
    endorsements,
    restrictions,
    points_balance,
    medical_certificate_expiry,
    background_check_expiry,
    drug_test_expiry,
    training_expiry,
    notes,
    organization_id
) 
SELECT 
    p.id as driver_id,
    CASE 
        WHEN p.first_name = 'John' THEN 'DL123456789'
        WHEN p.first_name = 'Sarah' THEN 'DL987654321'
        WHEN p.first_name = 'Michael' THEN 'DL456789123'
        WHEN p.first_name = 'Emma' THEN 'DL789123456'
        WHEN p.first_name = 'David' THEN 'DL321654987'
        ELSE 'DL' || substr(md5(random()::text), 1, 9)
    END as license_number,
    CASE 
        WHEN p.first_name = 'John' THEN 'CDL-A'
        WHEN p.first_name = 'Sarah' THEN 'CDL-B'
        WHEN p.first_name = 'Michael' THEN 'CDL-C'
        WHEN p.first_name = 'Emma' THEN 'Regular'
        WHEN p.first_name = 'David' THEN 'International'
        ELSE 'Regular'
    END as license_type,
    CASE 
        WHEN p.first_name IN ('John', 'Sarah') THEN 'DMV California'
        WHEN p.first_name IN ('Michael', 'Emma') THEN 'DVLA UK'
        WHEN p.first_name = 'David' THEN 'Transport Canada'
        ELSE 'Local Authority'
    END as issuing_authority,
    CASE 
        WHEN p.first_name = 'John' THEN '2023-01-15'
        WHEN p.first_name = 'Sarah' THEN '2023-03-20'
        WHEN p.first_name = 'Michael' THEN '2023-06-10'
        WHEN p.first_name = 'Emma' THEN '2023-08-05'
        WHEN p.first_name = 'David' THEN '2023-11-12'
        ELSE (CURRENT_DATE - INTERVAL '1 year')::date
    END as issue_date,
    CASE 
        WHEN p.first_name = 'John' THEN '2025-01-15'
        WHEN p.first_name = 'Sarah' THEN '2024-12-20'  -- Expiring soon
        WHEN p.first_name = 'Michael' THEN '2024-10-15' -- Expired
        WHEN p.first_name = 'Emma' THEN '2026-08-05'
        WHEN p.first_name = 'David' THEN '2025-11-12'
        ELSE (CURRENT_DATE + INTERVAL '2 years')::date
    END as expiry_date,
    CASE 
        WHEN p.first_name = 'Michael' THEN 'expired'
        WHEN p.first_name = 'Sarah' THEN 'active'
        ELSE 'active'
    END as status,
    CASE 
        WHEN p.first_name = 'John' THEN 'Class 1'
        WHEN p.first_name = 'Sarah' THEN 'Class 2'
        WHEN p.first_name = 'Michael' THEN 'Class 3'
        WHEN p.first_name = 'Emma' THEN 'Class B'
        WHEN p.first_name = 'David' THEN 'Class 5'
        ELSE 'Standard'
    END as license_class,
    CASE 
        WHEN p.first_name = 'John' THEN ARRAY['Hazmat', 'Tanker', 'Passenger']
        WHEN p.first_name = 'Sarah' THEN ARRAY['School Bus', 'Air Brakes']
        WHEN p.first_name = 'Michael' THEN ARRAY['Passenger']
        WHEN p.first_name = 'Emma' THEN '{}'::text[]
        WHEN p.first_name = 'David' THEN ARRAY['International']
        ELSE '{}'::text[]
    END as endorsements,
    CASE 
        WHEN p.first_name = 'John' THEN ARRAY['Corrective Lenses']
        WHEN p.first_name = 'Sarah' THEN '{}'::text[]
        WHEN p.first_name = 'Michael' THEN ARRAY['Automatic Transmission']
        WHEN p.first_name = 'Emma' THEN '{}'::text[]
        WHEN p.first_name = 'David' THEN ARRAY['Outside Mirror']
        ELSE '{}'::text[]
    END as restrictions,
    CASE 
        WHEN p.first_name = 'John' THEN 0
        WHEN p.first_name = 'Sarah' THEN 2
        WHEN p.first_name = 'Michael' THEN 5
        WHEN p.first_name = 'Emma' THEN 0
        WHEN p.first_name = 'David' THEN 1
        ELSE 0
    END as points_balance,
    CASE 
        WHEN p.first_name = 'John' THEN '2024-12-15'
        WHEN p.first_name = 'Sarah' THEN '2024-11-20'  -- Expiring soon
        WHEN p.first_name = 'Michael' THEN '2024-09-15' -- Expired
        WHEN p.first_name = 'Emma' THEN '2025-06-05'
        WHEN p.first_name = 'David' THEN '2025-10-12'
        ELSE (CURRENT_DATE + INTERVAL '1 year')::date
    END as medical_certificate_expiry,
    CASE 
        WHEN p.first_name = 'John' THEN '2025-06-15'
        WHEN p.first_name = 'Sarah' THEN '2024-08-20'  -- Expiring soon
        WHEN p.first_name = 'Michael' THEN '2024-05-15' -- Expired
        WHEN p.first_name = 'Emma' THEN '2026-02-05'
        WHEN p.first_name = 'David' THEN '2025-08-12'
        ELSE (CURRENT_DATE + INTERVAL '2 years')::date
    END as background_check_expiry,
    CASE 
        WHEN p.first_name = 'John' THEN '2024-10-15'
        WHEN p.first_name = 'Sarah' THEN '2024-09-20'  -- Expiring soon
        WHEN p.first_name = 'Michael' THEN '2024-07-15' -- Expired
        WHEN p.first_name = 'Emma' THEN '2025-04-05'
        WHEN p.first_name = 'David' THEN '2025-09-12'
        ELSE (CURRENT_DATE + INTERVAL '1 year')::date
    END as drug_test_expiry,
    CASE 
        WHEN p.first_name = 'John' THEN '2025-03-15'
        WHEN p.first_name = 'Sarah' THEN '2024-12-20'  -- Expiring soon
        WHEN p.first_name = 'Michael' THEN '2024-10-15' -- Expired
        WHEN p.first_name = 'Emma' THEN '2025-09-05'
        WHEN p.first_name = 'David' THEN '2025-07-12'
        ELSE (CURRENT_DATE + INTERVAL '1.5 years')::date
    END as training_expiry,
    CASE 
        WHEN p.first_name = 'John' THEN 'Senior driver with hazmat certification'
        WHEN p.first_name = 'Sarah' THEN 'School bus driver with clean record'
        WHEN p.first_name = 'Michael' THEN 'Needs license renewal and medical update'
        WHEN p.first_name = 'Emma' THEN 'New driver with regular license'
        WHEN p.first_name = 'David' THEN 'International driver with cross-border experience'
        ELSE 'Standard driver license'
    END as notes,
    p.organization_id
FROM public.profiles p
WHERE p.role = 'driver' 
    AND p.organization_id IS NOT NULL
    AND p.first_name IN ('John', 'Sarah', 'Michael', 'Emma', 'David')
    AND NOT EXISTS (
        SELECT 1 FROM public.driver_licenses dl 
        WHERE dl.driver_id = p.id
    )
LIMIT 5;
