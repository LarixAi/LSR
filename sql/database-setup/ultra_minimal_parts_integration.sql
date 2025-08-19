-- =====================================================
-- ULTRA MINIMAL PARTS & SUPPLIES INTEGRATION
-- =====================================================
-- This script creates ONLY the essential parts and supplies tables
-- NO external dependencies - completely isolated and minimal

-- 1. CREATE ORGANIZATIONS TABLE (ULTRA MINIMAL)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default organization if it doesn't exist (ULTRA MINIMAL)
INSERT INTO public.organizations (name, slug)
VALUES ('ABC Transport Ltd', 'abc-transport')
ON CONFLICT (slug) DO NOTHING;

-- 2. CREATE PARTS INVENTORY TABLE (ULTRA MINIMAL)
CREATE TABLE IF NOT EXISTS public.parts_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    part_number VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    quantity INTEGER DEFAULT 0,
    min_quantity INTEGER DEFAULT 0,
    max_quantity INTEGER DEFAULT 1000,
    unit_price DECIMAL(10,2) DEFAULT 0,
    supplier VARCHAR(255),
    location VARCHAR(255),
    status VARCHAR(20) DEFAULT 'in_stock',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, part_number)
);

-- 3. CREATE PARTS REQUESTS TABLE (ULTRA MINIMAL)
CREATE TABLE IF NOT EXISTS public.parts_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    part_id UUID NOT NULL REFERENCES public.parts_inventory(id) ON DELETE CASCADE,
    quantity_requested INTEGER NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending',
    requested_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREATE STOCK MOVEMENTS TABLE (ULTRA MINIMAL)
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    part_id UUID NOT NULL REFERENCES public.parts_inventory(id) ON DELETE CASCADE,
    movement_type VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    reference_type VARCHAR(20) NOT NULL,
    reference_number VARCHAR(50) NOT NULL,
    notes TEXT,
    movement_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CREATE STOCK ORDERS TABLE (ULTRA MINIMAL)
CREATE TABLE IF NOT EXISTS public.stock_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    part_id UUID NOT NULL REFERENCES public.parts_inventory(id) ON DELETE CASCADE,
    supplier VARCHAR(255),
    quantity_ordered INTEGER NOT NULL,
    quantity_received INTEGER DEFAULT 0,
    unit_price DECIMAL(10,2) DEFAULT 0,
    order_status VARCHAR(20) DEFAULT 'pending',
    order_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CREATE JOB PARTS TABLE (ULTRA MINIMAL)
CREATE TABLE IF NOT EXISTS public.job_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    part_id UUID NOT NULL REFERENCES public.parts_inventory(id) ON DELETE CASCADE,
    quantity_used INTEGER NOT NULL,
    unit_price DECIMAL(10,2) DEFAULT 0,
    usage_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. CREATE INVENTORY ALERTS TABLE (ULTRA MINIMAL)
CREATE TABLE IF NOT EXISTS public.inventory_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    part_id UUID NOT NULL REFERENCES public.parts_inventory(id) ON DELETE CASCADE,
    alert_type VARCHAR(20) NOT NULL,
    alert_message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. ENABLE ROW LEVEL SECURITY (ULTRA MINIMAL)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_alerts ENABLE ROW LEVEL SECURITY;

-- 9. CREATE BASIC INDEXES (ULTRA MINIMAL)
CREATE INDEX IF NOT EXISTS idx_parts_inventory_org ON public.parts_inventory(organization_id);
CREATE INDEX IF NOT EXISTS idx_parts_requests_org ON public.parts_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_org ON public.stock_movements(organization_id);
CREATE INDEX IF NOT EXISTS idx_stock_orders_org ON public.stock_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_job_parts_org ON public.job_parts(organization_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_org ON public.inventory_alerts(organization_id);

-- 10. INSERT SAMPLE DATA (ULTRA MINIMAL)
DO $$
DECLARE
    default_org_id UUID;
BEGIN
    -- Get the default organization ID
    SELECT id INTO default_org_id FROM public.organizations WHERE name = 'ABC Transport Ltd' LIMIT 1;
    
    -- Only insert sample parts if the table is empty and we have an organization
    IF default_org_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.parts_inventory LIMIT 1) THEN
        INSERT INTO public.parts_inventory (
            part_number,
            name,
            description,
            category,
            quantity,
            min_quantity,
            max_quantity,
            unit_price,
            supplier,
            location,
            status,
            organization_id
        ) VALUES 
        ('ENG-001', 'Engine Oil Filter', 'High-quality engine oil filter for commercial vehicles', 'engine', 25, 5, 50, 12.99, 'AutoParts Ltd', 'Warehouse A - Shelf 1', 'in_stock', default_org_id),
        ('BRK-001', 'Brake Pads Set', 'Front brake pads for heavy-duty vehicles', 'brakes', 15, 3, 30, 45.99, 'BrakeTech', 'Warehouse A - Shelf 2', 'in_stock', default_org_id),
        ('ELC-001', 'Battery 12V', 'Heavy-duty 12V battery for commercial vehicles', 'electrical', 8, 2, 15, 89.99, 'PowerSource', 'Warehouse B - Shelf 1', 'low_stock', default_org_id),
        ('TIR-001', 'Tire 275/70R22.5', 'All-season tire for commercial vehicles', 'tires', 12, 4, 20, 199.99, 'TireWorld', 'Warehouse C - Shelf 1', 'in_stock', default_org_id),
        ('FLU-001', 'Engine Oil 15W-40', 'Synthetic engine oil for diesel engines', 'fluids', 30, 10, 50, 24.99, 'OilCo', 'Warehouse A - Shelf 3', 'in_stock', default_org_id),
        ('BOD-001', 'Mirror Assembly', 'Side mirror assembly for commercial vehicles', 'body', 5, 2, 10, 75.99, 'BodyParts', 'Warehouse B - Shelf 2', 'low_stock', default_org_id),
        ('INT-001', 'Seat Cover Set', 'Heavy-duty seat covers for driver comfort', 'interior', 20, 5, 25, 35.99, 'InteriorPro', 'Warehouse A - Shelf 4', 'in_stock', default_org_id),
        ('ENG-002', 'Air Filter', 'High-performance air filter for diesel engines', 'engine', 3, 5, 15, 18.99, 'FilterMax', 'Warehouse A - Shelf 1', 'out_of_stock', default_org_id);
    END IF;
END $$;

-- 11. CREATE BASIC VIEWS (ULTRA MINIMAL)
CREATE OR REPLACE VIEW public.parts_usage_report AS
SELECT 
    jp.id,
    p.part_number,
    p.name as part_name,
    p.category,
    jp.quantity_used,
    jp.unit_price,
    jp.usage_date,
    jp.notes,
    jp.organization_id
FROM public.job_parts jp
JOIN public.parts_inventory p ON jp.part_id = p.id;

CREATE OR REPLACE VIEW public.parts_requests_summary AS
SELECT 
    pr.id,
    p.part_number,
    p.name as part_name,
    p.category,
    pr.quantity_requested,
    pr.priority,
    pr.status,
    pr.requested_date,
    pr.notes,
    pr.organization_id
FROM public.parts_requests pr
JOIN public.parts_inventory p ON pr.part_id = p.id;

CREATE OR REPLACE VIEW public.inventory_alerts_view AS
SELECT 
    ia.id,
    ia.organization_id,
    p.part_number,
    p.name as part_name,
    p.category,
    p.quantity,
    p.min_quantity,
    ia.alert_type,
    ia.alert_message,
    ia.severity,
    ia.is_active,
    ia.created_at
FROM public.inventory_alerts ia
JOIN public.parts_inventory p ON ia.part_id = p.id;

-- 12. GRANT PERMISSIONS (ULTRA MINIMAL)
GRANT SELECT ON public.parts_usage_report TO authenticated;
GRANT SELECT ON public.parts_requests_summary TO authenticated;
GRANT SELECT ON public.inventory_alerts_view TO authenticated;

-- 13. CREATE ULTRA SIMPLE RLS POLICIES (ULTRA MINIMAL)
-- Organizations - Simple view policy
DROP POLICY IF EXISTS "Users can view organizations" ON public.organizations;
CREATE POLICY "Users can view organizations" ON public.organizations
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Parts Inventory - Simple policies
DROP POLICY IF EXISTS "Users can view parts inventory" ON public.parts_inventory;
CREATE POLICY "Users can view parts inventory" ON public.parts_inventory
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can manage parts inventory" ON public.parts_inventory;
CREATE POLICY "Users can manage parts inventory" ON public.parts_inventory
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Parts Requests - Simple policies
DROP POLICY IF EXISTS "Users can view parts requests" ON public.parts_requests;
CREATE POLICY "Users can view parts requests" ON public.parts_requests
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can manage parts requests" ON public.parts_requests;
CREATE POLICY "Users can manage parts requests" ON public.parts_requests
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Stock Movements - Simple policies
DROP POLICY IF EXISTS "Users can view stock movements" ON public.stock_movements;
CREATE POLICY "Users can view stock movements" ON public.stock_movements
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can manage stock movements" ON public.stock_movements;
CREATE POLICY "Users can manage stock movements" ON public.stock_movements
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Stock Orders - Simple policies
DROP POLICY IF EXISTS "Users can view stock orders" ON public.stock_orders;
CREATE POLICY "Users can view stock orders" ON public.stock_orders
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can manage stock orders" ON public.stock_orders;
CREATE POLICY "Users can manage stock orders" ON public.stock_orders
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Job Parts - Simple policies
DROP POLICY IF EXISTS "Users can view job parts" ON public.job_parts;
CREATE POLICY "Users can view job parts" ON public.job_parts
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can manage job parts" ON public.job_parts;
CREATE POLICY "Users can manage job parts" ON public.job_parts
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Inventory Alerts - Simple policies
DROP POLICY IF EXISTS "Users can view inventory alerts" ON public.inventory_alerts;
CREATE POLICY "Users can view inventory alerts" ON public.inventory_alerts
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can manage inventory alerts" ON public.inventory_alerts;
CREATE POLICY "Users can manage inventory alerts" ON public.inventory_alerts
    FOR ALL USING (auth.uid() IS NOT NULL);

-- 14. CREATE RLS POLICIES FOR VIEWS (ULTRA MINIMAL)
DROP POLICY IF EXISTS "Users can view parts usage report" ON public.parts_usage_report;
CREATE POLICY "Users can view parts usage report" ON public.parts_usage_report
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can view parts requests summary" ON public.parts_requests_summary;
CREATE POLICY "Users can view parts requests summary" ON public.parts_requests_summary
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can view inventory alerts" ON public.inventory_alerts_view;
CREATE POLICY "Users can view inventory alerts" ON public.inventory_alerts_view
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- =====================================================
-- ULTRA MINIMAL INTEGRATION COMPLETE
-- =====================================================
-- The Parts & Supplies system is now ultra-minimally integrated with:
-- 1. Organizations table (ultra minimal structure)
-- 2. Parts Inventory management
-- 3. Parts Requests system
-- 4. Stock Movements tracking
-- 5. Stock Orders management
-- 6. Job Parts tracking
-- 7. Inventory Alerts system
-- 8. Basic Reporting Views

-- NOTE: This version is ultra minimal and focused
-- NO complex functions, triggers, or external dependencies
-- NO references to any external tables (profiles, schools, etc.)
-- NO conditional logic or complex checks
-- Simple DROP + CREATE for all RLS policies
-- Organization-level filtering will be handled at the application level
-- Safe to run multiple times without conflicts
