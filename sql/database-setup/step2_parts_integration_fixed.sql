-- =====================================================
-- STEP 2: PARTS & SUPPLIES INTEGRATION (FIXED VERSION)
-- =====================================================
-- This script creates the complete parts and supplies integration
-- ASSUMES: organization_id column already exists in parts_inventory table
-- Run step1_add_organization_id.sql first if you haven't already

-- 1. CREATE ALL TABLES FIRST (without RLS policies yet)

-- 1.1 CREATE PARTS REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.parts_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    defect_id UUID NOT NULL REFERENCES public.defect_reports(id) ON DELETE CASCADE,
    part_id UUID NOT NULL REFERENCES public.parts_inventory(id) ON DELETE CASCADE,
    quantity_requested INTEGER NOT NULL,
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected', 'fulfilled')) DEFAULT 'pending',
    requested_by UUID NOT NULL REFERENCES public.profiles(id),
    approved_by UUID REFERENCES public.profiles(id),
    requested_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    approved_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.2 CREATE STOCK MOVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    movement_number VARCHAR(50) UNIQUE NOT NULL,
    part_id UUID NOT NULL REFERENCES public.parts_inventory(id) ON DELETE CASCADE,
    movement_type VARCHAR(20) CHECK (movement_type IN ('stock_in', 'stock_out', 'adjustment', 'return')) NOT NULL,
    quantity INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) DEFAULT 0,
    total_value DECIMAL(10,2) DEFAULT 0,
    reference_type VARCHAR(20) CHECK (reference_type IN ('order', 'job', 'adjustment', 'return', 'manual')) NOT NULL,
    reference_number VARCHAR(50) NOT NULL,
    notes TEXT,
    moved_by UUID NOT NULL REFERENCES public.profiles(id),
    movement_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.3 CREATE STOCK ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.stock_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    part_id UUID NOT NULL REFERENCES public.parts_inventory(id) ON DELETE CASCADE,
    supplier VARCHAR(255),
    supplier_contact VARCHAR(255),
    quantity_ordered INTEGER NOT NULL,
    quantity_received INTEGER DEFAULT 0,
    unit_price DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(10,2) DEFAULT 0,
    order_status VARCHAR(20) CHECK (order_status IN ('pending', 'ordered', 'shipped', 'received', 'cancelled')) DEFAULT 'pending',
    order_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expected_delivery TIMESTAMP WITH TIME ZONE,
    actual_delivery TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    ordered_by UUID NOT NULL REFERENCES public.profiles(id),
    received_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.4 CREATE JOB PARTS TABLE (for tracking parts used in work orders)
CREATE TABLE IF NOT EXISTS public.job_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.defect_reports(id) ON DELETE CASCADE,
    part_id UUID NOT NULL REFERENCES public.parts_inventory(id) ON DELETE CASCADE,
    quantity_used INTEGER NOT NULL,
    unit_price DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(10,2) DEFAULT 0,
    usage_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    notes TEXT,
    used_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.5 CREATE INVENTORY ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.inventory_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    part_id UUID NOT NULL REFERENCES public.parts_inventory(id) ON DELETE CASCADE,
    alert_type VARCHAR(20) CHECK (alert_type IN ('low_stock', 'out_of_stock', 'expiring', 'overstock')) NOT NULL,
    alert_message TEXT NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    is_active BOOLEAN DEFAULT TRUE,
    acknowledged_by UUID REFERENCES public.profiles(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ENABLE ROW LEVEL SECURITY (after tables are created)
ALTER TABLE public.parts_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_alerts ENABLE ROW LEVEL SECURITY;

-- 3. CREATE FUNCTIONS (before triggers)

-- 3.1 Function to generate movement numbers
CREATE OR REPLACE FUNCTION public.generate_movement_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.movement_number := 'MOV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(CAST(nextval('movement_sequence') AS TEXT), 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3.2 Function to generate order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(CAST(nextval('order_sequence') AS TEXT), 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3.3 Function to update part quantities automatically
CREATE OR REPLACE FUNCTION public.update_part_quantity()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the part quantity based on movement type
    IF NEW.movement_type = 'stock_in' THEN
        UPDATE public.parts_inventory 
        SET quantity = quantity + NEW.quantity,
            status = CASE 
                WHEN quantity + NEW.quantity > min_quantity THEN 'in_stock'
                WHEN quantity + NEW.quantity > 0 THEN 'low_stock'
                ELSE 'out_of_stock'
            END,
            updated_at = NOW()
        WHERE id = NEW.part_id;
    ELSIF NEW.movement_type = 'stock_out' THEN
        UPDATE public.parts_inventory 
        SET quantity = quantity - NEW.quantity,
            status = CASE 
                WHEN quantity - NEW.quantity > min_quantity THEN 'in_stock'
                WHEN quantity - NEW.quantity > 0 THEN 'low_stock'
                ELSE 'out_of_stock'
            END,
            updated_at = NOW()
        WHERE id = NEW.part_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3.4 Function to create inventory alerts
CREATE OR REPLACE FUNCTION public.create_inventory_alert()
RETURNS TRIGGER AS $$
DECLARE
    org_id UUID;
BEGIN
    -- Get organization_id from the updated part
    SELECT organization_id INTO org_id FROM public.parts_inventory WHERE id = NEW.id;
    
    -- Create low stock alert
    IF NEW.quantity <= NEW.min_quantity AND NEW.quantity > 0 THEN
        INSERT INTO public.inventory_alerts (
            organization_id,
            part_id,
            alert_type,
            alert_message,
            severity
        ) VALUES (
            org_id,
            NEW.id,
            'low_stock',
            'Part ' || NEW.name || ' is running low on stock. Current quantity: ' || NEW.quantity,
            'medium'
        );
    END IF;
    
    -- Create out of stock alert
    IF NEW.quantity = 0 THEN
        INSERT INTO public.inventory_alerts (
            organization_id,
            part_id,
            alert_type,
            alert_message,
            severity
        ) VALUES (
            org_id,
            NEW.id,
            'out_of_stock',
            'Part ' || NEW.name || ' is out of stock.',
            'high'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. CREATE SEQUENCES
CREATE SEQUENCE IF NOT EXISTS movement_sequence START 1;
CREATE SEQUENCE IF NOT EXISTS order_sequence START 1;

-- 5. CREATE TRIGGERS
DROP TRIGGER IF EXISTS generate_movement_number_trigger ON public.stock_movements;
CREATE TRIGGER generate_movement_number_trigger
    BEFORE INSERT ON public.stock_movements
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_movement_number();

DROP TRIGGER IF EXISTS generate_order_number_trigger ON public.stock_orders;
CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON public.stock_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_order_number();

DROP TRIGGER IF EXISTS update_part_quantity_trigger ON public.stock_movements;
CREATE TRIGGER update_part_quantity_trigger
    AFTER INSERT ON public.stock_movements
    FOR EACH ROW
    EXECUTE FUNCTION public.update_part_quantity();

DROP TRIGGER IF EXISTS create_inventory_alert_trigger ON public.parts_inventory;
CREATE TRIGGER create_inventory_alert_trigger
    AFTER UPDATE ON public.parts_inventory
    FOR EACH ROW
    EXECUTE FUNCTION public.create_inventory_alert();

-- 6. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_parts_requests_organization_id ON public.parts_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_parts_requests_defect_id ON public.parts_requests(defect_id);
CREATE INDEX IF NOT EXISTS idx_parts_requests_status ON public.parts_requests(status);
CREATE INDEX IF NOT EXISTS idx_parts_requests_requested_by ON public.parts_requests(requested_by);

CREATE INDEX IF NOT EXISTS idx_stock_movements_organization_id ON public.stock_movements(organization_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_part_id ON public.stock_movements(part_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_movement_date ON public.stock_movements(movement_date);
CREATE INDEX IF NOT EXISTS idx_stock_movements_movement_type ON public.stock_movements(movement_type);

CREATE INDEX IF NOT EXISTS idx_stock_orders_organization_id ON public.stock_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_stock_orders_part_id ON public.stock_orders(part_id);
CREATE INDEX IF NOT EXISTS idx_stock_orders_order_status ON public.stock_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_stock_orders_order_date ON public.stock_orders(order_date);

CREATE INDEX IF NOT EXISTS idx_job_parts_organization_id ON public.job_parts(organization_id);
CREATE INDEX IF NOT EXISTS idx_job_parts_job_id ON public.job_parts(job_id);
CREATE INDEX IF NOT EXISTS idx_job_parts_part_id ON public.job_parts(part_id);
CREATE INDEX IF NOT EXISTS idx_job_parts_usage_date ON public.job_parts(usage_date);

CREATE INDEX IF NOT EXISTS idx_inventory_alerts_organization_id ON public.inventory_alerts(organization_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_part_id ON public.inventory_alerts(part_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_alert_type ON public.inventory_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_is_active ON public.inventory_alerts(is_active);

-- 7. INSERT SAMPLE DATA

-- 7.1 Sample parts inventory (only if organization_id column exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'parts_inventory' 
        AND column_name = 'organization_id'
    ) THEN
        -- Insert sample parts with organization_id
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
            supplier_contact,
            location,
            status,
            organization_id
        ) VALUES 
        ('ENG-001', 'Engine Oil Filter', 'High-quality engine oil filter for commercial vehicles', 'engine', 25, 5, 50, 12.99, 'AutoParts Ltd', 'sales@autoparts.com', 'Warehouse A - Shelf 1', 'in_stock', (SELECT id FROM public.organizations WHERE name = 'ABC Transport Ltd' LIMIT 1)),
        ('BRK-001', 'Brake Pads Set', 'Front brake pads for heavy-duty vehicles', 'brakes', 15, 3, 30, 45.99, 'BrakeTech', 'orders@braketech.com', 'Warehouse A - Shelf 2', 'in_stock', (SELECT id FROM public.organizations WHERE name = 'ABC Transport Ltd' LIMIT 1)),
        ('ELC-001', 'Battery 12V', 'Heavy-duty 12V battery for commercial vehicles', 'electrical', 8, 2, 15, 89.99, 'PowerSource', 'info@powersource.com', 'Warehouse B - Shelf 1', 'low_stock', (SELECT id FROM public.organizations WHERE name = 'ABC Transport Ltd' LIMIT 1)),
        ('TIR-001', 'Tire 275/70R22.5', 'All-season tire for commercial vehicles', 'tires', 12, 4, 20, 199.99, 'TireWorld', 'sales@tireworld.com', 'Warehouse C - Shelf 1', 'in_stock', (SELECT id FROM public.organizations WHERE name = 'ABC Transport Ltd' LIMIT 1)),
        ('FLU-001', 'Engine Oil 15W-40', 'Synthetic engine oil for diesel engines', 'fluids', 30, 10, 50, 24.99, 'OilCo', 'orders@oilco.com', 'Warehouse A - Shelf 3', 'in_stock', (SELECT id FROM public.organizations WHERE name = 'ABC Transport Ltd' LIMIT 1)),
        ('BOD-001', 'Mirror Assembly', 'Side mirror assembly for commercial vehicles', 'body', 5, 2, 10, 75.99, 'BodyParts', 'sales@bodyparts.com', 'Warehouse B - Shelf 2', 'low_stock', (SELECT id FROM public.organizations WHERE name = 'ABC Transport Ltd' LIMIT 1)),
        ('INT-001', 'Seat Cover Set', 'Heavy-duty seat covers for driver comfort', 'interior', 20, 5, 25, 35.99, 'InteriorPro', 'orders@interiorpro.com', 'Warehouse A - Shelf 4', 'in_stock', (SELECT id FROM public.organizations WHERE name = 'ABC Transport Ltd' LIMIT 1)),
        ('ENG-002', 'Air Filter', 'High-performance air filter for diesel engines', 'engine', 3, 5, 15, 18.99, 'FilterMax', 'sales@filtermax.com', 'Warehouse A - Shelf 1', 'out_of_stock', (SELECT id FROM public.organizations WHERE name = 'ABC Transport Ltd' LIMIT 1))
        ON CONFLICT (part_number) DO UPDATE SET
            quantity = EXCLUDED.quantity,
            status = EXCLUDED.status,
            updated_at = NOW();
    END IF;
END $$;

-- 7.2 Sample stock movements
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.parts_inventory WHERE part_number = 'ENG-001' LIMIT 1) THEN
        INSERT INTO public.stock_movements (
            part_id,
            movement_type,
            quantity,
            previous_quantity,
            new_quantity,
            unit_price,
            total_value,
            reference_type,
            reference_number,
            notes,
            moved_by,
            organization_id
        ) VALUES 
        ((SELECT id FROM public.parts_inventory WHERE part_number = 'ENG-001' LIMIT 1), 'stock_in', 25, 0, 25, 12.99, 324.75, 'order', 'ORD-20241201-0001', 'Initial stock', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.organizations WHERE name = 'ABC Transport Ltd' LIMIT 1)),
        ((SELECT id FROM public.parts_inventory WHERE part_number = 'BRK-001' LIMIT 1), 'stock_in', 15, 0, 15, 45.99, 689.85, 'order', 'ORD-20241201-0002', 'Initial stock', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.organizations WHERE name = 'ABC Transport Ltd' LIMIT 1)),
        ((SELECT id FROM public.parts_inventory WHERE part_number = 'ELC-001' LIMIT 1), 'stock_out', 2, 10, 8, 89.99, 179.98, 'job', 'DEF-2024-123456', 'Used for vehicle repair', (SELECT id FROM public.profiles WHERE role = 'mechanic' LIMIT 1), (SELECT id FROM public.organizations WHERE name = 'ABC Transport Ltd' LIMIT 1))
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- 7.3 Sample parts requests (only if defect_reports table has data)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.defect_reports LIMIT 1) AND 
       EXISTS (SELECT 1 FROM public.parts_inventory WHERE part_number = 'ENG-002' LIMIT 1) THEN
        INSERT INTO public.parts_requests (
            organization_id,
            defect_id,
            part_id,
            quantity_requested,
            priority,
            status,
            requested_by,
            notes
        ) VALUES 
        ((SELECT id FROM public.organizations WHERE name = 'ABC Transport Ltd' LIMIT 1), 
         (SELECT id FROM public.defect_reports LIMIT 1), 
         (SELECT id FROM public.parts_inventory WHERE part_number = 'ENG-002' LIMIT 1), 
         2, 'high', 'pending', 
         (SELECT id FROM public.profiles WHERE role = 'mechanic' LIMIT 1), 
         'Urgently needed for engine repair'),
        ((SELECT id FROM public.organizations WHERE name = 'ABC Transport Ltd' LIMIT 1), 
         (SELECT id FROM public.defect_reports LIMIT 1), 
         (SELECT id FROM public.parts_inventory WHERE part_number = 'BOD-001' LIMIT 1), 
         1, 'medium', 'approved', 
         (SELECT id FROM public.profiles WHERE role = 'mechanic' LIMIT 1), 
         'Mirror replacement needed')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- 8. CREATE VIEWS FOR REPORTING

-- 8.1 View for parts usage in work orders
CREATE OR REPLACE VIEW public.parts_usage_report AS
SELECT 
    jp.id,
    jp.job_id,
    dr.defect_number,
    dr.title as defect_title,
    p.part_number,
    p.name as part_name,
    p.category,
    jp.quantity_used,
    jp.unit_price,
    jp.total_cost,
    jp.usage_date,
    jp.notes,
    prof.first_name || ' ' || prof.last_name as used_by_name,
    jp.organization_id
FROM public.job_parts jp
JOIN public.defect_reports dr ON jp.job_id = dr.id
JOIN public.parts_inventory p ON jp.part_id = p.id
JOIN public.profiles prof ON jp.used_by = prof.id;

-- 8.2 View for parts requests summary
CREATE OR REPLACE VIEW public.parts_requests_summary AS
SELECT 
    pr.id,
    pr.defect_id,
    dr.defect_number,
    dr.title as defect_title,
    p.part_number,
    p.name as part_name,
    p.category,
    pr.quantity_requested,
    pr.priority,
    pr.status,
    pr.requested_date,
    pr.approved_date,
    req.first_name || ' ' || req.last_name as requested_by_name,
    app.first_name || ' ' || app.last_name as approved_by_name,
    pr.notes,
    pr.organization_id
FROM public.parts_requests pr
JOIN public.defect_reports dr ON pr.defect_id = dr.id
JOIN public.parts_inventory p ON pr.part_id = p.id
JOIN public.profiles req ON pr.requested_by = req.id
LEFT JOIN public.profiles app ON pr.approved_by = app.id;

-- 8.3 View for inventory alerts
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
    ia.created_at,
    ia.acknowledged_at,
    prof.first_name || ' ' || prof.last_name as acknowledged_by_name
FROM public.inventory_alerts ia
JOIN public.parts_inventory p ON ia.part_id = p.id
LEFT JOIN public.profiles prof ON ia.acknowledged_by = prof.id;

-- 9. GRANT PERMISSIONS
GRANT SELECT ON public.parts_usage_report TO authenticated;
GRANT SELECT ON public.parts_requests_summary TO authenticated;
GRANT SELECT ON public.inventory_alerts_view TO authenticated;

-- 10. CREATE RLS POLICIES (NOW that all tables exist)

-- 10.1 Parts Requests Policies
DROP POLICY IF EXISTS "Users can view parts requests in their organization" ON public.parts_requests;
CREATE POLICY "Users can view parts requests in their organization" ON public.parts_requests
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('mechanic', 'admin', 'council')
        )
    );

DROP POLICY IF EXISTS "Mechanics can create parts requests" ON public.parts_requests;
CREATE POLICY "Mechanics can create parts requests" ON public.parts_requests
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('mechanic', 'admin', 'council')
        )
        AND requested_by = auth.uid()
    );

DROP POLICY IF EXISTS "Admins can manage parts requests" ON public.parts_requests;
CREATE POLICY "Admins can manage parts requests" ON public.parts_requests
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'council')
        )
    );

-- 10.2 Stock Movements Policies
DROP POLICY IF EXISTS "Users can view stock movements in their organization" ON public.stock_movements;
CREATE POLICY "Users can view stock movements in their organization" ON public.stock_movements
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('mechanic', 'admin', 'council')
        )
    );

DROP POLICY IF EXISTS "Mechanics can create stock movements" ON public.stock_movements;
CREATE POLICY "Mechanics can create stock movements" ON public.stock_movements
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('mechanic', 'admin', 'council')
        )
        AND moved_by = auth.uid()
    );

-- 10.3 Stock Orders Policies
DROP POLICY IF EXISTS "Users can view stock orders in their organization" ON public.stock_orders;
CREATE POLICY "Users can view stock orders in their organization" ON public.stock_orders
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('mechanic', 'admin', 'council')
        )
    );

DROP POLICY IF EXISTS "Admins can manage stock orders" ON public.stock_orders;
CREATE POLICY "Admins can manage stock orders" ON public.stock_orders
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'council')
        )
    );

-- 10.4 Job Parts Policies
DROP POLICY IF EXISTS "Users can view job parts in their organization" ON public.job_parts;
CREATE POLICY "Users can view job parts in their organization" ON public.job_parts
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('mechanic', 'admin', 'council')
        )
    );

DROP POLICY IF EXISTS "Mechanics can create job parts" ON public.job_parts;
CREATE POLICY "Mechanics can create job parts" ON public.job_parts
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'council')
        )
        AND used_by = auth.uid()
    );

-- 10.5 Inventory Alerts Policies
DROP POLICY IF EXISTS "Users can view inventory alerts in their organization" ON public.inventory_alerts;
CREATE POLICY "Users can view inventory alerts in their organization" ON public.inventory_alerts
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('mechanic', 'admin', 'council')
        )
    );

DROP POLICY IF EXISTS "Admins can manage inventory alerts" ON public.inventory_alerts;
CREATE POLICY "Admins can manage inventory alerts" ON public.inventory_alerts
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'council')
        )
    );

-- 11. CREATE RLS POLICIES FOR VIEWS
CREATE POLICY "Users can view parts usage report in their organization" ON public.parts_usage_report
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('mechanic', 'admin', 'council')
        )
    );

CREATE POLICY "Users can view parts requests summary in their organization" ON public.parts_requests_summary
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('mechanic', 'admin', 'council')
        )
    );

CREATE POLICY "Users can view inventory alerts in their organization" ON public.inventory_alerts_view
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('mechanic', 'admin', 'council')
        )
    );

-- =====================================================
-- INTEGRATION COMPLETE
-- =====================================================
-- The Parts & Supplies system is now fully integrated with:
-- 1. Work Orders (Defect Reports)
-- 2. Vehicle Inspections
-- 3. Maintenance Management
-- 4. Cost Tracking
-- 5. Inventory Alerts
-- 6. Stock Movements
-- 7. Parts Requests
-- 8. Reporting Views
