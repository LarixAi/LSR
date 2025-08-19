-- =====================================================
-- COMPLETE PARTS & SUPPLIES INTEGRATION (ADAPTIVE)
-- =====================================================
-- This script creates the complete parts and supplies integration
-- Adapts to existing table structures to avoid column errors

-- 1. CREATE ORGANIZATIONS TABLE (ADAPTIVE)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    contact_email TEXT,
    type TEXT DEFAULT 'transport',
    address TEXT,
    phone TEXT,
    email TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default organization if it doesn't exist (ADAPTIVE)
DO $$
DECLARE
    org_exists BOOLEAN;
    has_contact_email BOOLEAN;
    has_type BOOLEAN;
    has_address BOOLEAN;
    has_phone BOOLEAN;
    has_email BOOLEAN;
    has_is_active BOOLEAN;
BEGIN
    -- Check if organization already exists
    SELECT EXISTS(SELECT 1 FROM public.organizations WHERE name = 'ABC Transport Ltd') INTO org_exists;
    
    -- Check which columns exist in the organizations table
    SELECT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' AND column_name = 'contact_email'
    ) INTO has_contact_email;
    
    SELECT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' AND column_name = 'type'
    ) INTO has_type;
    
    SELECT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' AND column_name = 'address'
    ) INTO has_address;
    
    SELECT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' AND column_name = 'phone'
    ) INTO has_phone;
    
    SELECT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' AND column_name = 'email'
    ) INTO has_email;
    
    SELECT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' AND column_name = 'is_active'
    ) INTO has_is_active;
    
    -- Only insert if organization doesn't exist
    IF NOT org_exists THEN
        -- Build dynamic INSERT based on existing columns
        IF has_contact_email AND has_type AND has_address AND has_phone AND has_email AND has_is_active THEN
            INSERT INTO public.organizations (name, slug, contact_email, type, address, phone, email, is_active)
            VALUES (
                'ABC Transport Ltd',
                'abc-transport',
                'admin@abctransport.com',
                'transport',
                '123 Transport Way, London, UK',
                '+44 20 1234 5678',
                'info@abctransport.com',
                true
            );
        ELSIF has_contact_email AND has_type AND has_address AND has_phone AND has_email THEN
            INSERT INTO public.organizations (name, slug, contact_email, type, address, phone, email)
            VALUES (
                'ABC Transport Ltd',
                'abc-transport',
                'admin@abctransport.com',
                'transport',
                '123 Transport Way, London, UK',
                '+44 20 1234 5678',
                'info@abctransport.com'
            );
        ELSIF has_contact_email AND has_type AND has_address AND has_phone THEN
            INSERT INTO public.organizations (name, slug, contact_email, type, address, phone)
            VALUES (
                'ABC Transport Ltd',
                'abc-transport',
                'admin@abctransport.com',
                'transport',
                '123 Transport Way, London, UK',
                '+44 20 1234 5678'
            );
        ELSIF has_contact_email AND has_type AND has_address THEN
            INSERT INTO public.organizations (name, slug, contact_email, type, address)
            VALUES (
                'ABC Transport Ltd',
                'abc-transport',
                'admin@abctransport.com',
                'transport',
                '123 Transport Way, London, UK'
            );
        ELSIF has_contact_email AND has_type THEN
            INSERT INTO public.organizations (name, slug, contact_email, type)
            VALUES (
                'ABC Transport Ltd',
                'abc-transport',
                'admin@abctransport.com',
                'transport'
            );
        ELSIF has_contact_email THEN
            INSERT INTO public.organizations (name, slug, contact_email)
            VALUES (
                'ABC Transport Ltd',
                'abc-transport',
                'admin@abctransport.com'
            );
        ELSE
            -- Minimal insert with just name and slug
            INSERT INTO public.organizations (name, slug)
            VALUES (
                'ABC Transport Ltd',
                'abc-transport'
            );
        END IF;
    END IF;
END $$;

-- 2. CREATE PARTS INVENTORY TABLE (ADAPTIVE)
CREATE TABLE IF NOT EXISTS public.parts_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    part_number VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) CHECK (category IN ('engine', 'brakes', 'electrical', 'tires', 'fluids', 'body', 'interior', 'other')),
    quantity INTEGER DEFAULT 0,
    min_quantity INTEGER DEFAULT 0,
    max_quantity INTEGER DEFAULT 1000,
    unit_price DECIMAL(10,2) DEFAULT 0,
    supplier VARCHAR(255),
    supplier_contact VARCHAR(255),
    location VARCHAR(255),
    status VARCHAR(20) CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock', 'on_order', 'discontinued')) DEFAULT 'in_stock',
    discontinued BOOLEAN DEFAULT FALSE,
    last_ordered TIMESTAMP WITH TIME ZONE,
    next_order_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'parts_inventory_org_part_unique'
    ) THEN
        ALTER TABLE public.parts_inventory 
        ADD CONSTRAINT parts_inventory_org_part_unique 
        UNIQUE(organization_id, part_number);
    END IF;
END $$;

-- 3. CREATE PARTS REQUESTS TABLE (ADAPTIVE)
CREATE TABLE IF NOT EXISTS public.parts_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    defect_id UUID, -- Make optional since defect_reports might not exist
    part_id UUID NOT NULL REFERENCES public.parts_inventory(id) ON DELETE CASCADE,
    quantity_requested INTEGER NOT NULL,
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected', 'fulfilled')) DEFAULT 'pending',
    requested_by UUID, -- Make optional since profiles might not exist
    approved_by UUID, -- Make optional since profiles might not exist
    requested_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    approved_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREATE STOCK MOVEMENTS TABLE (ADAPTIVE)
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
    moved_by UUID, -- Make optional since profiles might not exist
    movement_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CREATE STOCK ORDERS TABLE (ADAPTIVE)
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
    ordered_by UUID, -- Make optional since profiles might not exist
    received_by UUID, -- Make optional since profiles might not exist
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CREATE JOB PARTS TABLE (ADAPTIVE)
CREATE TABLE IF NOT EXISTS public.job_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    job_id UUID, -- Make optional since defect_reports might not exist
    part_id UUID NOT NULL REFERENCES public.parts_inventory(id) ON DELETE CASCADE,
    quantity_used INTEGER NOT NULL,
    unit_price DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(10,2) DEFAULT 0,
    usage_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    notes TEXT,
    used_by UUID, -- Make optional since profiles might not exist
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. CREATE INVENTORY ALERTS TABLE (ADAPTIVE)
CREATE TABLE IF NOT EXISTS public.inventory_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    part_id UUID NOT NULL REFERENCES public.parts_inventory(id) ON DELETE CASCADE,
    alert_type VARCHAR(20) CHECK (alert_type IN ('low_stock', 'out_of_stock', 'expiring', 'overstock')) NOT NULL,
    alert_message TEXT NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    is_active BOOLEAN DEFAULT TRUE,
    acknowledged_by UUID, -- Make optional since profiles might not exist
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. ENABLE ROW LEVEL SECURITY (ADAPTIVE)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_alerts ENABLE ROW LEVEL SECURITY;

-- 9. CREATE SEQUENCES (ADAPTIVE)
CREATE SEQUENCE IF NOT EXISTS movement_sequence START 1;
CREATE SEQUENCE IF NOT EXISTS order_sequence START 1;

-- 10. CREATE FUNCTIONS (ADAPTIVE)

-- 10.1 Function to generate movement numbers
CREATE OR REPLACE FUNCTION public.generate_movement_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.movement_number := 'MOV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(CAST(nextval('movement_sequence') AS TEXT), 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10.2 Function to generate order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(CAST(nextval('order_sequence') AS TEXT), 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10.3 Function to update part quantities automatically
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

-- 10.4 Function to create inventory alerts
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

-- 11. CREATE TRIGGERS (ADAPTIVE)
DO $$
BEGIN
    -- Create movement number trigger
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'generate_movement_number_trigger'
    ) THEN
        CREATE TRIGGER generate_movement_number_trigger
            BEFORE INSERT ON public.stock_movements
            FOR EACH ROW
            EXECUTE FUNCTION public.generate_movement_number();
    END IF;

    -- Create order number trigger
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'generate_order_number_trigger'
    ) THEN
        CREATE TRIGGER generate_order_number_trigger
            BEFORE INSERT ON public.stock_orders
            FOR EACH ROW
            EXECUTE FUNCTION public.generate_order_number();
    END IF;

    -- Create quantity update trigger
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_part_quantity_trigger'
    ) THEN
        CREATE TRIGGER update_part_quantity_trigger
            AFTER INSERT ON public.stock_movements
            FOR EACH ROW
            EXECUTE FUNCTION public.update_part_quantity();
    END IF;

    -- Create inventory alert trigger
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'create_inventory_alert_trigger'
    ) THEN
        CREATE TRIGGER create_inventory_alert_trigger
            AFTER UPDATE ON public.parts_inventory
            FOR EACH ROW
            EXECUTE FUNCTION public.create_inventory_alert();
    END IF;
END $$;

-- 12. CREATE INDEXES FOR PERFORMANCE (ADAPTIVE)
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_name ON public.organizations(name);

CREATE INDEX IF NOT EXISTS idx_parts_inventory_organization_id ON public.parts_inventory(organization_id);
CREATE INDEX IF NOT EXISTS idx_parts_inventory_part_number ON public.parts_inventory(part_number);
CREATE INDEX IF NOT EXISTS idx_parts_inventory_category ON public.parts_inventory(category);
CREATE INDEX IF NOT EXISTS idx_parts_inventory_status ON public.parts_inventory(status);

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

-- 13. INSERT SAMPLE DATA (ADAPTIVE)
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
            supplier_contact,
            location,
            status,
            organization_id
        ) VALUES 
        ('ENG-001', 'Engine Oil Filter', 'High-quality engine oil filter for commercial vehicles', 'engine', 25, 5, 50, 12.99, 'AutoParts Ltd', 'sales@autoparts.com', 'Warehouse A - Shelf 1', 'in_stock', default_org_id),
        ('BRK-001', 'Brake Pads Set', 'Front brake pads for heavy-duty vehicles', 'brakes', 15, 3, 30, 45.99, 'BrakeTech', 'orders@braketech.com', 'Warehouse A - Shelf 2', 'in_stock', default_org_id),
        ('ELC-001', 'Battery 12V', 'Heavy-duty 12V battery for commercial vehicles', 'electrical', 8, 2, 15, 89.99, 'PowerSource', 'info@powersource.com', 'Warehouse B - Shelf 1', 'low_stock', default_org_id),
        ('TIR-001', 'Tire 275/70R22.5', 'All-season tire for commercial vehicles', 'tires', 12, 4, 20, 199.99, 'TireWorld', 'sales@tireworld.com', 'Warehouse C - Shelf 1', 'in_stock', default_org_id),
        ('FLU-001', 'Engine Oil 15W-40', 'Synthetic engine oil for diesel engines', 'fluids', 30, 10, 50, 24.99, 'OilCo', 'orders@oilco.com', 'Warehouse A - Shelf 3', 'in_stock', default_org_id),
        ('BOD-001', 'Mirror Assembly', 'Side mirror assembly for commercial vehicles', 'body', 5, 2, 10, 75.99, 'BodyParts', 'sales@bodyparts.com', 'Warehouse B - Shelf 2', 'low_stock', default_org_id),
        ('INT-001', 'Seat Cover Set', 'Heavy-duty seat covers for driver comfort', 'interior', 20, 5, 25, 35.99, 'InteriorPro', 'orders@interiorpro.com', 'Warehouse A - Shelf 4', 'in_stock', default_org_id),
        ('ENG-002', 'Air Filter', 'High-performance air filter for diesel engines', 'engine', 3, 5, 15, 18.99, 'FilterMax', 'sales@filtermax.com', 'Warehouse A - Shelf 1', 'out_of_stock', default_org_id);
    END IF;
END $$;

-- 14. CREATE VIEWS FOR REPORTING (ADAPTIVE)
CREATE OR REPLACE VIEW public.parts_usage_report AS
SELECT 
    jp.id,
    jp.job_id,
    p.part_number,
    p.name as part_name,
    p.category,
    jp.quantity_used,
    jp.unit_price,
    jp.total_cost,
    jp.usage_date,
    jp.notes,
    jp.organization_id
FROM public.job_parts jp
JOIN public.parts_inventory p ON jp.part_id = p.id;

CREATE OR REPLACE VIEW public.parts_requests_summary AS
SELECT 
    pr.id,
    pr.defect_id,
    p.part_number,
    p.name as part_name,
    p.category,
    pr.quantity_requested,
    pr.priority,
    pr.status,
    pr.requested_date,
    pr.approved_date,
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
    ia.created_at,
    ia.acknowledged_at
FROM public.inventory_alerts ia
JOIN public.parts_inventory p ON ia.part_id = p.id;

-- 15. GRANT PERMISSIONS (ADAPTIVE)
GRANT SELECT ON public.parts_usage_report TO authenticated;
GRANT SELECT ON public.parts_requests_summary TO authenticated;
GRANT SELECT ON public.inventory_alerts_view TO authenticated;

-- 16. CREATE SIMPLIFIED RLS POLICIES (ADAPTIVE - NO external references)

-- 16.1 Organizations Policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'organizations' AND policyname = 'Users can view organizations') THEN
        CREATE POLICY "Users can view organizations" ON public.organizations
            FOR SELECT USING (auth.uid() IS NOT NULL);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'organizations' AND policyname = 'Admins can manage organizations') THEN
        CREATE POLICY "Admins can manage organizations" ON public.organizations
            FOR ALL USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- 16.2 Parts Inventory Policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'parts_inventory' AND policyname = 'Users can view parts inventory') THEN
        CREATE POLICY "Users can view parts inventory" ON public.parts_inventory
            FOR SELECT USING (auth.uid() IS NOT NULL);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'parts_inventory' AND policyname = 'Mechanics can manage parts inventory') THEN
        CREATE POLICY "Mechanics can manage parts inventory" ON public.parts_inventory
            FOR ALL USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- 16.3 Parts Requests Policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'parts_requests' AND policyname = 'Users can view parts requests') THEN
        CREATE POLICY "Users can view parts requests" ON public.parts_requests
            FOR SELECT USING (auth.uid() IS NOT NULL);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'parts_requests' AND policyname = 'Mechanics can create parts requests') THEN
        CREATE POLICY "Mechanics can create parts requests" ON public.parts_requests
            FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'parts_requests' AND policyname = 'Admins can manage parts requests') THEN
        CREATE POLICY "Admins can manage parts requests" ON public.parts_requests
            FOR ALL USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- 16.4 Stock Movements Policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stock_movements' AND policyname = 'Users can view stock movements') THEN
        CREATE POLICY "Users can view stock movements" ON public.stock_movements
            FOR SELECT USING (auth.uid() IS NOT NULL);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stock_movements' AND policyname = 'Mechanics can create stock movements') THEN
        CREATE POLICY "Mechanics can create stock movements" ON public.stock_movements
            FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- 16.5 Stock Orders Policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stock_orders' AND policyname = 'Users can view stock orders') THEN
        CREATE POLICY "Users can view stock orders" ON public.stock_orders
            FOR SELECT USING (auth.uid() IS NOT NULL);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stock_orders' AND policyname = 'Admins can manage stock orders') THEN
        CREATE POLICY "Admins can manage stock orders" ON public.stock_orders
            FOR ALL USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- 16.6 Job Parts Policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'job_parts' AND policyname = 'Users can view job parts') THEN
        CREATE POLICY "Users can view job parts" ON public.job_parts
            FOR SELECT USING (auth.uid() IS NOT NULL);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'job_parts' AND policyname = 'Mechanics can create job parts') THEN
        CREATE POLICY "Mechanics can create job parts" ON public.job_parts
            FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- 16.7 Inventory Alerts Policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inventory_alerts' AND policyname = 'Users can view inventory alerts') THEN
        CREATE POLICY "Users can view inventory alerts" ON public.inventory_alerts
            FOR SELECT USING (auth.uid() IS NOT NULL);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inventory_alerts' AND policyname = 'Admins can manage inventory alerts') THEN
        CREATE POLICY "Admins can manage inventory alerts" ON public.inventory_alerts
            FOR ALL USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- 17. CREATE RLS POLICIES FOR VIEWS (ADAPTIVE)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'parts_usage_report' AND policyname = 'Users can view parts usage report') THEN
        CREATE POLICY "Users can view parts usage report" ON public.parts_usage_report
            FOR SELECT USING (auth.uid() IS NOT NULL);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'parts_requests_summary' AND policyname = 'Users can view parts requests summary') THEN
        CREATE POLICY "Users can view parts requests summary" ON public.parts_requests_summary
            FOR SELECT USING (auth.uid() IS NOT NULL);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inventory_alerts_view' AND policyname = 'Users can view inventory alerts') THEN
        CREATE POLICY "Users can view inventory alerts" ON public.inventory_alerts_view
            FOR SELECT USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- =====================================================
-- INTEGRATION COMPLETE (ADAPTIVE)
-- =====================================================
-- The Parts & Supplies system is now fully integrated with:
-- 1. Organizations table (adapts to existing structure)
-- 2. Parts Inventory management
-- 3. Parts Requests system
-- 4. Stock Movements tracking
-- 5. Stock Orders management
-- 6. Job Parts tracking
-- 7. Inventory Alerts system
-- 8. Reporting Views

-- NOTE: This version adapts to existing table structures
-- Checks which columns exist in organizations table before inserting
-- Makes foreign key references optional to avoid dependency issues
-- Uses simplified RLS policies that don't reference external tables
-- Organization-level filtering will be handled at the application level
-- Safe to run multiple times without conflicts
