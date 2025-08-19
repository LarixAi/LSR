-- =====================================================
-- ENHANCE DEFECT REPORTS SYSTEM
-- =====================================================

-- 1. Add organization_id to defect_reports table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'defect_reports' 
        AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE public.defect_reports 
        ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Update existing defect reports to assign them to the default organization
UPDATE public.defect_reports 
SET organization_id = (
    SELECT id FROM public.organizations 
    WHERE name = 'ABC Transport Ltd' 
    LIMIT 1
)
WHERE organization_id IS NULL;

-- 3. Make organization_id NOT NULL after populating
ALTER TABLE public.defect_reports 
ALTER COLUMN organization_id SET NOT NULL;

-- 4. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_defect_reports_organization_id 
ON public.defect_reports(organization_id);

-- 5. Update RLS policies to include organization_id
DROP POLICY IF EXISTS "Mechanics can view defect reports" ON public.defect_reports;
DROP POLICY IF EXISTS "Mechanics can manage defect reports" ON public.defect_reports;

CREATE POLICY "Mechanics can view defect reports" ON public.defect_reports
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            organization_id IN (
                SELECT organization_id FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role IN ('mechanic', 'admin', 'council')
            )
        )
    );

CREATE POLICY "Mechanics can manage defect reports" ON public.defect_reports
    FOR ALL USING (
        auth.role() = 'authenticated' AND (
            organization_id IN (
                SELECT organization_id FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role IN ('mechanic', 'admin', 'council')
            )
        )
    );

-- 6. Add a mock defect report for testing
INSERT INTO public.defect_reports (
    defect_number,
    vehicle_id,
    reported_by,
    title,
    description,
    defect_type,
    severity,
    status,
    location,
    reported_date,
    estimated_cost,
    organization_id
) VALUES (
    'DEF-2024-MOCK-001',
    (SELECT id FROM public.vehicles WHERE make = 'Ford' LIMIT 1),
    (SELECT id FROM public.profiles WHERE email = 'laronelaing3@outlook.com'),
    'Mock Defect - Brake System Test',
    'This is a mock defect report for testing purposes. Brake pedal feels soft and goes to floor when pressed.',
    'safety',
    'high',
    'investigating',
    'Front brake system',
    NOW() - INTERVAL '1 day',
    250.00,
    (SELECT id FROM public.organizations WHERE name = 'ABC Transport Ltd' LIMIT 1)
) ON CONFLICT (defect_number) DO NOTHING;

-- 7. Create a view to combine defect reports and vehicle check defects
CREATE OR REPLACE VIEW public.combined_defects AS
SELECT 
    'defect_report' as source_type,
    id,
    defect_number,
    vehicle_id,
    reported_by,
    title,
    description,
    defect_type,
    severity,
    status,
    location,
    reported_date as defect_date,
    estimated_cost,
    actual_cost,
    organization_id,
    created_at,
    updated_at
FROM public.defect_reports

UNION ALL

SELECT 
    'vehicle_check' as source_type,
    vc.id,
    'VC-' || vc.id::text as defect_number,
    vc.vehicle_id,
    vc.driver_id as reported_by,
    'Vehicle Check Defect - ' || COALESCE(vc.defect_type, 'General') as title,
    COALESCE(vc.defect_description, 'Defect found during vehicle check') as description,
    CASE 
        WHEN vc.defect_type = 'safety' THEN 'safety'
        WHEN vc.defect_type = 'mechanical' THEN 'mechanical'
        WHEN vc.defect_type = 'electrical' THEN 'electrical'
        ELSE 'other'
    END as defect_type,
    CASE 
        WHEN vc.severity = 'critical' THEN 'critical'
        WHEN vc.severity = 'high' THEN 'high'
        WHEN vc.severity = 'medium' THEN 'medium'
        ELSE 'low'
    END as severity,
    CASE 
        WHEN vc.status = 'resolved' THEN 'resolved'
        WHEN vc.status = 'closed' THEN 'closed'
        ELSE 'investigating'
    END as status,
    COALESCE(vc.defect_location, 'Vehicle') as location,
    vc.check_date as defect_date,
    0 as estimated_cost,
    0 as actual_cost,
    vc.organization_id,
    vc.created_at,
    vc.updated_at
FROM public.vehicle_checks vc
WHERE vc.defects_found = true;

-- 8. Enable RLS on the view
ALTER VIEW public.combined_defects SET (security_invoker = true);

-- 9. Create RLS policy for the view
CREATE POLICY "Users can view combined defects in their organization" ON public.combined_defects
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            organization_id IN (
                SELECT organization_id FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role IN ('mechanic', 'admin', 'council')
            )
        )
    );

-- 10. Success message
SELECT 'Defect Reports Enhancement Complete' as status,
       'Mock defect added and combined defects view created' as details,
       (SELECT COUNT(*) FROM public.defect_reports) as total_defect_reports,
       (SELECT COUNT(*) FROM public.combined_defects) as total_combined_defects;
