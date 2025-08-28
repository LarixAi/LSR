-- =====================================================
-- COMPREHENSIVE BACKEND SECURITY & PARTS INTEGRATION
-- =====================================================

-- 1. FIX ALL FUNCTION SECURITY ISSUES
-- Update functions with mutable search paths
CREATE OR REPLACE FUNCTION public.generate_work_order_number()
RETURNS character varying
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    work_order_num VARCHAR(50);
    current_year VARCHAR(4);
    sequence_num INTEGER;
BEGIN
    current_year := TO_CHAR(NOW(), 'YYYY');
    
    -- Get the next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(work_order_number FROM 12) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM public.defect_reports
    WHERE work_order_number LIKE 'WO-' || current_year || '-%';
    
    work_order_num := 'WO-' || current_year || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN work_order_num;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS character varying
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    invoice_num VARCHAR(50);
    current_year VARCHAR(4);
    sequence_num INTEGER;
BEGIN
    current_year := TO_CHAR(NOW(), 'YYYY');
    
    -- Get the next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 12) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM public.repair_invoices
    WHERE invoice_number LIKE 'INV-' || current_year || '-%';
    
    invoice_num := 'INV-' || current_year || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN invoice_num;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_work_order_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Only set work order number if not already set and status is being changed to 'repairing'
    IF NEW.work_order_number IS NULL AND NEW.status = 'repairing' THEN
        NEW.work_order_number := public.generate_work_order_number();
        NEW.start_date := NOW();
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_invoice_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Only set invoice number if not already set
    IF NEW.invoice_number IS NULL THEN
        NEW.invoice_number := public.generate_invoice_number();
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_repair_time(p_defect_id uuid, p_mechanic_id uuid, p_activity_type character varying, p_description text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    INSERT INTO public.repair_time_logs (
        defect_id,
        mechanic_id,
        activity_type,
        start_time,
        description
    ) VALUES (
        p_defect_id,
        p_mechanic_id,
        p_activity_type,
        NOW(),
        p_description
    );
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.end_repair_time_log(p_defect_id uuid, p_mechanic_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    UPDATE public.repair_time_logs 
    SET 
        end_time = NOW(),
        duration_minutes = EXTRACT(EPOCH FROM (NOW() - start_time)) / 60
    WHERE defect_id = p_defect_id 
    AND mechanic_id = p_mechanic_id 
    AND end_time IS NULL;
    
    -- Update total actual hours on defect report
    UPDATE public.defect_reports 
    SET actual_hours = (
        SELECT COALESCE(SUM(duration_minutes), 0) / 60.0
        FROM public.repair_time_logs
        WHERE defect_id = p_defect_id
    )
    WHERE id = p_defect_id;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_work_order(p_defect_id uuid, p_mechanic_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    invoice_id UUID;
BEGIN
    -- Update defect report status to 'resolved'
    UPDATE public.defect_reports 
    SET 
        status = 'resolved',
        completion_date = NOW(),
        updated_at = NOW()
    WHERE id = p_defect_id;
    
    -- Complete all remaining stages
    UPDATE public.work_order_stages 
    SET 
        status = 'completed',
        completed_at = NOW(),
        updated_at = NOW()
    WHERE defect_id = p_defect_id 
    AND status IN ('pending', 'in_progress');
    
    -- Create invoice if not exists
    INSERT INTO public.repair_invoices (
        defect_id,
        labor_hours,
        labor_rate,
        labor_total,
        parts_total,
        total_amount,
        status,
        created_by
    )
    SELECT 
        p_defect_id,
        dr.actual_hours,
        75.00, -- Default labor rate
        dr.actual_hours * 75.00,
        COALESCE(SUM(pr.total_cost), 0),
        (dr.actual_hours * 75.00) + COALESCE(SUM(pr.total_cost), 0),
        'draft',
        p_mechanic_id
    FROM public.defect_reports dr
    LEFT JOIN public.parts_requests pr ON dr.id = pr.defect_id AND pr.status = 'installed'
    WHERE dr.id = p_defect_id
    GROUP BY dr.id, dr.actual_hours
    ON CONFLICT (defect_id) DO NOTHING;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

-- 2. ADD RLS POLICIES TO PUBLICLY EXPOSED TABLES

-- Vehicles table RLS policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vehicles' AND policyname = 'Users can manage vehicles in their organization') THEN
        CREATE POLICY "Users can manage vehicles in their organization" ON public.vehicles
            FOR ALL USING (organization_id = get_user_organization_id())
            WITH CHECK (organization_id = get_user_organization_id());
    END IF;
END $$;

-- Routes table RLS policies  
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'routes' AND policyname = 'Users can manage routes in their organization') THEN
        CREATE POLICY "Users can manage routes in their organization" ON public.routes
            FOR ALL USING (organization_id = get_user_organization_id())
            WITH CHECK (organization_id = get_user_organization_id());
    END IF;
END $$;

-- Schools table RLS policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'schools' AND policyname = 'Users can manage schools in their organization') THEN
        CREATE POLICY "Users can manage schools in their organization" ON public.schools
            FOR ALL USING (organization_id = get_user_organization_id())
            WITH CHECK (organization_id = get_user_organization_id());
    END IF;
END $$;

-- Mechanic organizations table RLS policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mechanic_organizations' AND policyname = 'Users can manage mechanic organizations in their organization') THEN
        CREATE POLICY "Users can manage mechanic organizations in their organization" ON public.mechanic_organizations
            FOR ALL USING (organization_id = get_user_organization_id())
            WITH CHECK (organization_id = get_user_organization_id());
    END IF;
END $$;

-- 3. CREATE PARTS & SUPPLIES SYSTEM

-- Parts Inventory table
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT parts_inventory_org_part_unique UNIQUE(organization_id, part_number)
);

-- Parts Requests table
CREATE TABLE IF NOT EXISTS public.parts_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    defect_id UUID,
    part_id UUID NOT NULL REFERENCES public.parts_inventory(id) ON DELETE CASCADE,
    quantity_requested INTEGER NOT NULL,
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected', 'fulfilled')) DEFAULT 'pending',
    requested_by UUID,
    approved_by UUID,
    requested_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    approved_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock Movements table
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
    moved_by UUID,
    movement_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock Orders table
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
    ordered_by UUID,
    received_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory Alerts table
CREATE TABLE IF NOT EXISTS public.inventory_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    part_id UUID NOT NULL REFERENCES public.parts_inventory(id) ON DELETE CASCADE,
    alert_type VARCHAR(20) CHECK (alert_type IN ('low_stock', 'out_of_stock', 'expiring', 'overstock')) NOT NULL,
    alert_message TEXT NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    is_active BOOLEAN DEFAULT TRUE,
    acknowledged_by UUID,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all parts tables
ALTER TABLE public.parts_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_alerts ENABLE ROW LEVEL SECURITY;

-- 4. CREATE RLS POLICIES FOR PARTS TABLES

-- Parts Inventory policies
CREATE POLICY "Users can manage parts inventory in their organization" ON public.parts_inventory
    FOR ALL USING (organization_id = get_user_organization_id())
    WITH CHECK (organization_id = get_user_organization_id());

-- Parts Requests policies
CREATE POLICY "Users can manage parts requests in their organization" ON public.parts_requests
    FOR ALL USING (organization_id = get_user_organization_id())
    WITH CHECK (organization_id = get_user_organization_id());

-- Stock Movements policies
CREATE POLICY "Users can manage stock movements in their organization" ON public.stock_movements
    FOR ALL USING (organization_id = get_user_organization_id())
    WITH CHECK (organization_id = get_user_organization_id());

-- Stock Orders policies
CREATE POLICY "Users can manage stock orders in their organization" ON public.stock_orders
    FOR ALL USING (organization_id = get_user_organization_id())
    WITH CHECK (organization_id = get_user_organization_id());

-- Inventory Alerts policies
CREATE POLICY "Users can manage inventory alerts in their organization" ON public.inventory_alerts
    FOR ALL USING (organization_id = get_user_organization_id())
    WITH CHECK (organization_id = get_user_organization_id());

-- 5. CREATE SEQUENCES AND FUNCTIONS
CREATE SEQUENCE IF NOT EXISTS movement_sequence START 1;
CREATE SEQUENCE IF NOT EXISTS order_sequence START 1;

-- Movement number generation
CREATE OR REPLACE FUNCTION public.generate_movement_number()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    NEW.movement_number := 'MOV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(CAST(nextval('movement_sequence') AS TEXT), 4, '0');
    RETURN NEW;
END;
$$;

-- Order number generation
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(CAST(nextval('order_sequence') AS TEXT), 4, '0');
    RETURN NEW;
END;
$$;

-- Part quantity update function
CREATE OR REPLACE FUNCTION public.update_part_quantity()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- 6. CREATE TRIGGERS
CREATE TRIGGER IF NOT EXISTS generate_movement_number_trigger
    BEFORE INSERT ON public.stock_movements
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_movement_number();

CREATE TRIGGER IF NOT EXISTS generate_order_number_trigger
    BEFORE INSERT ON public.stock_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_order_number();

CREATE TRIGGER IF NOT EXISTS update_part_quantity_trigger
    AFTER INSERT ON public.stock_movements
    FOR EACH ROW
    EXECUTE FUNCTION public.update_part_quantity();

-- 7. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_parts_inventory_organization_id ON public.parts_inventory(organization_id);
CREATE INDEX IF NOT EXISTS idx_parts_inventory_part_number ON public.parts_inventory(part_number);
CREATE INDEX IF NOT EXISTS idx_parts_inventory_category ON public.parts_inventory(category);
CREATE INDEX IF NOT EXISTS idx_parts_inventory_status ON public.parts_inventory(status);

CREATE INDEX IF NOT EXISTS idx_parts_requests_organization_id ON public.parts_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_parts_requests_status ON public.parts_requests(status);

CREATE INDEX IF NOT EXISTS idx_stock_movements_organization_id ON public.stock_movements(organization_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_part_id ON public.stock_movements(part_id);

CREATE INDEX IF NOT EXISTS idx_stock_orders_organization_id ON public.stock_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_stock_orders_status ON public.stock_orders(order_status);

-- 8. INSERT SAMPLE DATA
DO $$
DECLARE
    default_org_id UUID;
BEGIN
    -- Get first available organization
    SELECT id INTO default_org_id FROM public.organizations LIMIT 1;
    
    -- Insert sample parts if organization exists and table is empty
    IF default_org_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.parts_inventory LIMIT 1) THEN
        INSERT INTO public.parts_inventory (
            part_number, name, description, category, quantity, min_quantity, max_quantity,
            unit_price, supplier, supplier_contact, location, status, organization_id
        ) VALUES 
        ('ENG-001', 'Engine Oil Filter', 'High-quality engine oil filter', 'engine', 25, 5, 50, 12.99, 'AutoParts Ltd', 'sales@autoparts.com', 'Warehouse A-1', 'in_stock', default_org_id),
        ('BRK-001', 'Brake Pads Set', 'Front brake pads for heavy vehicles', 'brakes', 15, 3, 30, 45.99, 'BrakeTech', 'orders@braketech.com', 'Warehouse A-2', 'in_stock', default_org_id),
        ('ELC-001', 'Battery 12V', 'Heavy-duty 12V battery', 'electrical', 8, 2, 15, 89.99, 'PowerSource', 'info@powersource.com', 'Warehouse B-1', 'low_stock', default_org_id),
        ('TIR-001', 'Tire 275/70R22.5', 'All-season commercial tire', 'tires', 12, 4, 20, 199.99, 'TireWorld', 'sales@tireworld.com', 'Warehouse C-1', 'in_stock', default_org_id),
        ('FLU-001', 'Engine Oil 15W-40', 'Synthetic diesel engine oil', 'fluids', 30, 10, 50, 24.99, 'OilCo', 'orders@oilco.com', 'Warehouse A-3', 'in_stock', default_org_id);
    END IF;
END $$;