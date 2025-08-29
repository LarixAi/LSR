-- =====================================================
-- FIX DATABASE COLUMN ISSUES
-- =====================================================
-- This script fixes the column issues in defect_reports and work_orders tables

-- 1. FIX DEFECT_REPORTS TABLE
-- Add organization_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'defect_reports' 
        AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE public.defect_reports 
        ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
        
        -- Update existing records to assign them to the default organization
        UPDATE public.defect_reports 
        SET organization_id = (
            SELECT id FROM public.organizations 
            WHERE name = 'ABC Transport Ltd' 
            LIMIT 1
        )
        WHERE organization_id IS NULL;
        
        RAISE NOTICE 'Added organization_id column to defect_reports table';
    ELSE
        RAISE NOTICE 'organization_id column already exists in defect_reports table';
    END IF;
END $$;

-- 2. FIX WORK_ORDERS TABLE
-- Add organization_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'work_orders' 
        AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE public.work_orders 
        ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
        
        -- Update existing records to assign them to the default organization
        UPDATE public.work_orders 
        SET organization_id = (
            SELECT id FROM public.organizations 
            WHERE name = 'ABC Transport Ltd' 
            LIMIT 1
        )
        WHERE organization_id IS NULL;
        
        RAISE NOTICE 'Added organization_id column to work_orders table';
    ELSE
        RAISE NOTICE 'organization_id column already exists in work_orders table';
    END IF;
END $$;

-- 3. CREATE INDEXES FOR BETTER PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_defect_reports_organization_id 
ON public.defect_reports(organization_id);

CREATE INDEX IF NOT EXISTS idx_work_orders_organization_id 
ON public.work_orders(organization_id);

-- 4. UPDATE RLS POLICIES FOR DEFECT_REPORTS
DROP POLICY IF EXISTS "Mechanics can view defect reports" ON public.defect_reports;
DROP POLICY IF EXISTS "Mechanics can manage defect reports" ON public.defect_reports;

CREATE POLICY "Users can view defect reports from their organization" ON public.defect_reports
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert defect reports for their organization" ON public.defect_reports
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update defect reports from their organization" ON public.defect_reports
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete defect reports from their organization" ON public.defect_reports
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- 5. UPDATE RLS POLICIES FOR WORK_ORDERS
DROP POLICY IF EXISTS "Users can view work orders from their organization" ON public.work_orders;
DROP POLICY IF EXISTS "Users can insert work orders for their organization" ON public.work_orders;
DROP POLICY IF EXISTS "Users can update work orders from their organization" ON public.work_orders;
DROP POLICY IF EXISTS "Users can delete work orders from their organization" ON public.work_orders;

CREATE POLICY "Users can view work orders from their organization" ON public.work_orders
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert work orders for their organization" ON public.work_orders
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update work orders from their organization" ON public.work_orders
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete work orders from their organization" ON public.work_orders
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- 6. ADD SAMPLE DATA FOR TESTING (if tables are empty)
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
) 
SELECT 
    'DEF-2024-TEST-001',
    v.id,
    p.id,
    'Test Defect - Brake System',
    'This is a test defect report for testing purposes. Brake pedal feels soft.',
    'safety',
    'high',
    'investigating',
    'Front brake system',
    NOW() - INTERVAL '1 day',
    250.00,
    o.id
FROM public.organizations o
CROSS JOIN (SELECT id FROM public.vehicles LIMIT 1) v
CROSS JOIN (SELECT id FROM public.profiles WHERE email = 'laronelaing3@outlook.com' LIMIT 1) p
WHERE NOT EXISTS (SELECT 1 FROM public.defect_reports LIMIT 1)
LIMIT 1;

INSERT INTO public.work_orders (
    organization_id,
    vehicle_id,
    assigned_mechanic_id,
    work_order_number,
    title,
    description,
    priority,
    status,
    work_type,
    estimated_hours,
    scheduled_date,
    created_by
) 
SELECT 
    o.id,
    v.id,
    p.id,
    'WO-2024-TEST-001',
    'Test Work Order - Engine Maintenance',
    'This is a test work order for testing purposes.',
    'medium',
    'open',
    'preventive',
    4.0,
    NOW() + INTERVAL '1 day',
    p.id
FROM public.organizations o
CROSS JOIN (SELECT id FROM public.vehicles LIMIT 1) v
CROSS JOIN (SELECT id FROM public.profiles WHERE email = 'laronelaing3@outlook.com' LIMIT 1) p
WHERE NOT EXISTS (SELECT 1 FROM public.work_orders LIMIT 1)
LIMIT 1;

-- =====================================================
-- FIX COMPLETE
-- =====================================================
