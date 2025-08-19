-- Enhanced Inventory Management System with Approval Workflows
-- This script creates a complete inventory system with admin controls and approval workflows

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS public.parts_approval_requests CASCADE;
DROP TABLE IF EXISTS public.parts_inventory CASCADE;
DROP TABLE IF EXISTS public.stock_movements CASCADE;
DROP TABLE IF EXISTS public.stock_orders CASCADE;
DROP TABLE IF EXISTS public.inventory_alerts CASCADE;

-- Create enhanced parts_inventory table with organization support
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
    last_ordered TIMESTAMP WITH TIME ZONE,
    next_order_date TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique part numbers within an organization
    UNIQUE(organization_id, part_number)
);

-- Create parts approval requests table
CREATE TABLE IF NOT EXISTS public.parts_approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    part_id UUID REFERENCES public.parts_inventory(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES auth.users(id),
    request_type VARCHAR(50) CHECK (request_type IN ('new_part', 'quantity_increase', 'price_change', 'supplier_change', 'discontinue_part')),
    current_value TEXT, -- JSON string for current state
    requested_value TEXT, -- JSON string for requested changes
    quantity_requested INTEGER,
    reason TEXT NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')) DEFAULT 'pending',
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enhanced stock movements table
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    movement_number VARCHAR(50) UNIQUE NOT NULL,
    part_id UUID NOT NULL REFERENCES public.parts_inventory(id) ON DELETE CASCADE,
    movement_type VARCHAR(20) CHECK (movement_type IN ('stock_in', 'stock_out', 'adjustment', 'return', 'transfer')),
    quantity INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) DEFAULT 0,
    total_value DECIMAL(10,2) DEFAULT 0,
    reference_type VARCHAR(20) CHECK (reference_type IN ('order', 'job', 'adjustment', 'return', 'manual', 'approval')),
    reference_number VARCHAR(50),
    approval_request_id UUID REFERENCES public.parts_approval_requests(id),
    notes TEXT,
    moved_by UUID NOT NULL REFERENCES auth.users(id),
    movement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enhanced stock orders table
CREATE TABLE IF NOT EXISTS public.stock_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    part_id UUID NOT NULL REFERENCES public.parts_inventory(id) ON DELETE CASCADE,
    supplier VARCHAR(255) NOT NULL,
    supplier_contact VARCHAR(255),
    quantity_ordered INTEGER NOT NULL,
    quantity_received INTEGER DEFAULT 0,
    unit_price DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    order_status VARCHAR(20) CHECK (order_status IN ('pending', 'ordered', 'shipped', 'received', 'cancelled', 'approved')) DEFAULT 'pending',
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expected_delivery TIMESTAMP WITH TIME ZONE,
    actual_delivery TIMESTAMP WITH TIME ZONE,
    approval_request_id UUID REFERENCES public.parts_approval_requests(id),
    notes TEXT,
    ordered_by UUID NOT NULL REFERENCES auth.users(id),
    received_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory alerts table
CREATE TABLE IF NOT EXISTS public.inventory_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    part_id UUID REFERENCES public.parts_inventory(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) CHECK (alert_type IN ('low_stock', 'out_of_stock', 'overstock', 'expiring', 'price_change', 'approval_needed')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    is_read BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.parts_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts_approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for parts_inventory
CREATE POLICY "Users can view parts in their organization" ON public.parts_inventory
    FOR SELECT USING (organization_id = (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Mechanics can create parts in their organization" ON public.parts_inventory
    FOR INSERT WITH CHECK (
        organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) AND
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('mechanic', 'admin', 'council'))
    );

CREATE POLICY "Mechanics can update parts in their organization" ON public.parts_inventory
    FOR UPDATE USING (
        organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) AND
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('mechanic', 'admin', 'council'))
    );

CREATE POLICY "Admins can delete parts in their organization" ON public.parts_inventory
    FOR DELETE USING (
        organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) AND
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'council'))
    );

-- RLS Policies for parts_approval_requests
CREATE POLICY "Users can view approval requests in their organization" ON public.parts_approval_requests
    FOR SELECT USING (organization_id = (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Mechanics can create approval requests" ON public.parts_approval_requests
    FOR INSERT WITH CHECK (
        organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) AND
        requester_id = auth.uid() AND
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('mechanic', 'admin', 'council'))
    );

CREATE POLICY "Admins can manage approval requests" ON public.parts_approval_requests
    FOR ALL USING (
        organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) AND
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'council'))
    );

-- RLS Policies for stock_movements
CREATE POLICY "Users can view stock movements in their organization" ON public.stock_movements
    FOR SELECT USING (organization_id = (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Mechanics can create stock movements" ON public.stock_movements
    FOR INSERT WITH CHECK (
        organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) AND
        moved_by = auth.uid() AND
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('mechanic', 'admin', 'council'))
    );

-- RLS Policies for stock_orders
CREATE POLICY "Users can view stock orders in their organization" ON public.stock_orders
    FOR SELECT USING (organization_id = (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Mechanics can create stock orders" ON public.stock_orders
    FOR INSERT WITH CHECK (
        organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) AND
        ordered_by = auth.uid() AND
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('mechanic', 'admin', 'council'))
    );

CREATE POLICY "Admins can manage stock orders" ON public.stock_orders
    FOR ALL USING (
        organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) AND
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'council'))
    );

-- RLS Policies for inventory_alerts
CREATE POLICY "Users can view alerts in their organization" ON public.inventory_alerts
    FOR SELECT USING (organization_id = (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ));

CREATE POLICY "System can create alerts" ON public.inventory_alerts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update alerts in their organization" ON public.inventory_alerts
    FOR UPDATE USING (
        organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_parts_inventory_org ON public.parts_inventory(organization_id);
CREATE INDEX IF NOT EXISTS idx_parts_inventory_status ON public.parts_inventory(status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_org ON public.parts_approval_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON public.parts_approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_stock_movements_org ON public.stock_movements(organization_id);
CREATE INDEX IF NOT EXISTS idx_stock_orders_org ON public.stock_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_org ON public.inventory_alerts(organization_id);

-- Create functions for automatic operations
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

-- Create function to generate movement numbers
CREATE OR REPLACE FUNCTION public.generate_movement_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.movement_number := 'MOV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(CAST(nextval('movement_sequence') AS TEXT), 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(CAST(nextval('order_sequence') AS TEXT), 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create sequences
CREATE SEQUENCE IF NOT EXISTS movement_sequence START 1;
CREATE SEQUENCE IF NOT EXISTS order_sequence START 1;

-- Create triggers
CREATE TRIGGER update_part_quantity_trigger
    AFTER INSERT ON public.stock_movements
    FOR EACH ROW
    EXECUTE FUNCTION public.update_part_quantity();

CREATE TRIGGER generate_movement_number_trigger
    BEFORE INSERT ON public.stock_movements
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_movement_number();

CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON public.stock_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_order_number();

-- Create function to check if approval is needed
CREATE OR REPLACE FUNCTION public.check_approval_needed(
    p_organization_id UUID,
    p_part_id UUID,
    p_quantity INTEGER,
    p_request_type VARCHAR(50)
)
RETURNS BOOLEAN AS $$
DECLARE
    part_record RECORD;
    approval_threshold INTEGER;
BEGIN
    -- Get part details
    SELECT * INTO part_record FROM public.parts_inventory WHERE id = p_part_id;
    
    -- Get organization's approval threshold (default to 100 if not set)
    SELECT COALESCE(approval_threshold, 100) INTO approval_threshold 
    FROM public.organizations WHERE id = p_organization_id;
    
    -- Check if approval is needed based on request type and quantity
    IF p_request_type = 'quantity_increase' AND p_quantity > approval_threshold THEN
        RETURN TRUE;
    ELSIF p_request_type = 'new_part' AND p_quantity > approval_threshold THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create inventory alerts
CREATE OR REPLACE FUNCTION public.create_inventory_alert(
    p_organization_id UUID,
    p_part_id UUID,
    p_alert_type VARCHAR(50),
    p_title VARCHAR(255),
    p_message TEXT,
    p_severity VARCHAR(20) DEFAULT 'medium'
)
RETURNS UUID AS $$
DECLARE
    alert_id UUID;
BEGIN
    INSERT INTO public.inventory_alerts (
        organization_id, part_id, alert_type, title, message, severity
    ) VALUES (
        p_organization_id, p_part_id, p_alert_type, p_title, p_message, p_severity
    ) RETURNING id INTO alert_id;
    
    RETURN alert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SEQUENCE movement_sequence TO authenticated;
GRANT USAGE ON SEQUENCE order_sequence TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_approval_needed(UUID, UUID, INTEGER, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_inventory_alert(UUID, UUID, VARCHAR, VARCHAR, TEXT, VARCHAR) TO authenticated;

-- Insert sample data for Jimmy's organization
DO $$
DECLARE
    jimmy_org_id UUID;
    jimmy_user_id UUID;
BEGIN
    -- Get Jimmy's organization and user ID
    SELECT organization_id INTO jimmy_org_id FROM profiles WHERE email = 'laronelaing3@outlook.com';
    SELECT id INTO jimmy_user_id FROM auth.users WHERE email = 'laronelaing3@outlook.com';
    
    -- Insert sample parts
    INSERT INTO public.parts_inventory (
        organization_id, part_number, name, description, category, quantity, min_quantity, 
        unit_price, supplier, supplier_contact, location, status, created_by
    ) VALUES
        (jimmy_org_id, 'BRK-001', 'Brake Pad Set (Front)', 'High-quality brake pads for front wheels', 'brakes', 15, 5, 45.00, 'AutoParts UK', 'sales@autopartsuk.com', 'Shelf A1, Bin 3', 'in_stock', jimmy_user_id),
        (jimmy_org_id, 'BRK-002', 'Brake Pad Set (Rear)', 'High-quality brake pads for rear wheels', 'brakes', 8, 5, 38.00, 'AutoParts UK', 'sales@autopartsuk.com', 'Shelf A1, Bin 4', 'low_stock', jimmy_user_id),
        (jimmy_org_id, 'ENG-001', 'Oil Filter', 'Premium oil filter for diesel engines', 'engine', 25, 10, 12.50, 'Motor Factors Ltd', 'orders@motorfactors.co.uk', 'Shelf B2, Bin 1', 'in_stock', jimmy_user_id),
        (jimmy_org_id, 'ENG-002', 'Air Filter', 'High-flow air filter element', 'engine', 12, 8, 18.00, 'Motor Factors Ltd', 'orders@motorfactors.co.uk', 'Shelf B2, Bin 2', 'low_stock', jimmy_user_id),
        (jimmy_org_id, 'ELC-001', 'Battery 12V 100Ah', 'Heavy-duty truck battery', 'electrical', 3, 2, 120.00, 'Battery World', 'sales@batteryworld.co.uk', 'Shelf C3, Bin 1', 'low_stock', jimmy_user_id),
        (jimmy_org_id, 'TIR-001', 'Tire 225/75R16', 'All-season commercial tire', 'tires', 8, 4, 85.00, 'Tire Express', 'orders@tireexpress.co.uk', 'Warehouse Section D', 'low_stock', jimmy_user_id),
        (jimmy_org_id, 'FLU-001', 'Engine Oil 5W-30', 'Synthetic engine oil 5L', 'fluids', 30, 15, 25.00, 'Oil Depot', 'sales@oildepot.co.uk', 'Shelf E4, Bin 1', 'in_stock', jimmy_user_id);
END $$;
