-- Create Comprehensive Stock Management System
-- This script creates tables for stock movements, orders, job bookings, and audit trail

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Mechanics can view stock movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Mechanics can manage stock movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Mechanics can view stock orders" ON public.stock_orders;
DROP POLICY IF EXISTS "Mechanics can manage stock orders" ON public.stock_orders;
DROP POLICY IF EXISTS "Mechanics can view job parts" ON public.job_parts;
DROP POLICY IF EXISTS "Mechanics can manage job parts" ON public.job_parts;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_stock_movements_updated_at ON public.stock_movements;
DROP TRIGGER IF EXISTS update_stock_orders_updated_at ON public.stock_orders;
DROP TRIGGER IF EXISTS update_job_parts_updated_at ON public.job_parts;

-- Create stock_movements table for tracking all stock in/out
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movement_number VARCHAR(20) UNIQUE NOT NULL,
    part_id UUID REFERENCES public.parts_inventory(id),
    movement_type VARCHAR(20) CHECK (movement_type IN ('stock_in', 'stock_out', 'adjustment', 'return')),
    quantity INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2),
    total_value DECIMAL(10,2),
    reference_type VARCHAR(20) CHECK (reference_type IN ('order', 'job', 'adjustment', 'return', 'manual')),
    reference_id UUID, -- Links to orders, jobs, etc.
    reference_number VARCHAR(50), -- Order number, job number, etc.
    notes TEXT,
    moved_by UUID REFERENCES public.profiles(id),
    movement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stock_orders table for tracking orders
CREATE TABLE IF NOT EXISTS public.stock_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(20) UNIQUE NOT NULL,
    part_id UUID REFERENCES public.parts_inventory(id),
    supplier VARCHAR(255),
    supplier_contact VARCHAR(255),
    quantity_ordered INTEGER NOT NULL,
    quantity_received INTEGER DEFAULT 0,
    unit_price DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    order_status VARCHAR(20) CHECK (order_status IN ('pending', 'ordered', 'shipped', 'received', 'cancelled')) DEFAULT 'pending',
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expected_delivery TIMESTAMP WITH TIME ZONE,
    actual_delivery TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    ordered_by UUID REFERENCES public.profiles(id),
    received_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job_parts table for tracking parts used in jobs
CREATE TABLE IF NOT EXISTS public.job_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID, -- References work_orders or other job tables
    part_id UUID REFERENCES public.parts_inventory(id),
    quantity_used INTEGER NOT NULL,
    unit_price DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    usage_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    used_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_parts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for stock_movements
CREATE POLICY "Mechanics can view stock movements" ON public.stock_movements
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role IN ('mechanic', 'admin', 'council')
            )
        )
    );

CREATE POLICY "Mechanics can manage stock movements" ON public.stock_movements
    FOR ALL USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role IN ('mechanic', 'admin', 'council')
            )
        )
    );

-- Create RLS policies for stock_orders
CREATE POLICY "Mechanics can view stock orders" ON public.stock_orders
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role IN ('mechanic', 'admin', 'council')
            )
        )
    );

CREATE POLICY "Mechanics can manage stock orders" ON public.stock_orders
    FOR ALL USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role IN ('mechanic', 'admin', 'council')
            )
        )
    );

-- Create RLS policies for job_parts
CREATE POLICY "Mechanics can view job parts" ON public.job_parts
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role IN ('mechanic', 'admin', 'council')
            )
        )
    );

CREATE POLICY "Mechanics can manage job parts" ON public.job_parts
    FOR ALL USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role IN ('mechanic', 'admin', 'council')
            )
        )
    );

-- Update the existing function safely (don't drop it)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for all tables
CREATE TRIGGER update_stock_movements_updated_at 
    BEFORE UPDATE ON public.stock_movements
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stock_orders_updated_at 
    BEFORE UPDATE ON public.stock_orders
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_parts_updated_at 
    BEFORE UPDATE ON public.job_parts
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically update part quantities when stock movements occur
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
            END
        WHERE id = NEW.part_id;
    ELSIF NEW.movement_type = 'stock_out' THEN
        UPDATE public.parts_inventory 
        SET quantity = quantity - NEW.quantity,
            status = CASE 
                WHEN quantity - NEW.quantity > min_quantity THEN 'in_stock'
                WHEN quantity - NEW.quantity > 0 THEN 'low_stock'
                ELSE 'out_of_stock'
            END
        WHERE id = NEW.part_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic quantity updates
CREATE TRIGGER update_part_quantity_trigger
    AFTER INSERT ON public.stock_movements
    FOR EACH ROW
    EXECUTE FUNCTION public.update_part_quantity();

-- Create function to generate movement numbers
CREATE OR REPLACE FUNCTION public.generate_movement_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.movement_number := 'MOV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(CAST(nextval('movement_sequence') AS TEXT), 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create sequence for movement numbers
CREATE SEQUENCE IF NOT EXISTS movement_sequence START 1;

-- Create trigger for movement numbers
CREATE TRIGGER generate_movement_number_trigger
    BEFORE INSERT ON public.stock_movements
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_movement_number();

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(CAST(nextval('order_sequence') AS TEXT), 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_sequence START 1;

-- Create trigger for order numbers
CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON public.stock_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_order_number();

-- Get Jimmy's profile ID and some part IDs
DO $$
DECLARE
    jimmy_id UUID;
    part_ids UUID[];
BEGIN
    -- Get Jimmy's profile ID
    SELECT id INTO jimmy_id FROM profiles WHERE email = 'laronelaing3@outlook.com';
    
    -- Get some part IDs
    SELECT ARRAY_AGG(id) INTO part_ids FROM parts_inventory LIMIT 10;
    
    -- Insert sample stock orders
    INSERT INTO public.stock_orders (
        part_id, supplier, supplier_contact, quantity_ordered, unit_price, total_cost,
        order_status, expected_delivery, notes, ordered_by
    ) VALUES
        (part_ids[1], 'AutoParts UK', 'sales@autopartsuk.com', 20, 45.00, 900.00, 'ordered', NOW() + INTERVAL '3 days', 'Urgent order for brake pads', jimmy_id),
        (part_ids[2], 'Motor Factors Ltd', 'orders@motorfactors.co.uk', 15, 12.50, 187.50, 'shipped', NOW() + INTERVAL '2 days', 'Oil filters for service', jimmy_id),
        (part_ids[3], 'Battery World', 'sales@batteryworld.co.uk', 5, 120.00, 600.00, 'pending', NOW() + INTERVAL '5 days', 'Heavy-duty batteries', jimmy_id),
        (part_ids[4], 'Tire Express', 'orders@tireexpress.co.uk', 8, 85.00, 680.00, 'received', NOW() - INTERVAL '1 day', 'Commercial tires', jimmy_id),
        (part_ids[5], 'Oil Depot', 'sales@oildepot.co.uk', 25, 25.00, 625.00, 'ordered', NOW() + INTERVAL '4 days', 'Engine oil for fleet', jimmy_id)
    ON CONFLICT (order_number) DO NOTHING;
    
    -- Insert sample stock movements (stock in from received orders)
    INSERT INTO public.stock_movements (
        part_id, movement_type, quantity, previous_quantity, new_quantity, unit_price, total_value,
        reference_type, reference_number, notes, moved_by
    ) VALUES
        (part_ids[4], 'stock_in', 8, 12, 20, 85.00, 680.00, 'order', 'ORD-20240816-0004', 'Received tire order', jimmy_id),
        (part_ids[1], 'stock_in', 15, 15, 30, 45.00, 675.00, 'order', 'ORD-20240815-0001', 'Received brake pad order', jimmy_id),
        (part_ids[2], 'stock_in', 10, 25, 35, 12.50, 125.00, 'order', 'ORD-20240814-0002', 'Received oil filter order', jimmy_id)
    ON CONFLICT (movement_number) DO NOTHING;
    
    -- Insert sample job parts usage
    INSERT INTO public.job_parts (
        job_id, part_id, quantity_used, unit_price, total_cost, notes, used_by
    ) VALUES
        ('550e8400-e29b-41d4-a716-446655440001', part_ids[1], 2, 45.00, 90.00, 'Brake replacement job', jimmy_id),
        ('550e8400-e29b-41d4-a716-446655440002', part_ids[2], 1, 12.50, 12.50, 'Oil change service', jimmy_id),
        ('550e8400-e29b-41d4-a716-446655440003', part_ids[3], 1, 120.00, 120.00, 'Battery replacement', jimmy_id),
        ('550e8400-e29b-41d4-a716-446655440004', part_ids[4], 2, 85.00, 170.00, 'Tire replacement job', jimmy_id),
        ('550e8400-e29b-41d4-a716-446655440005', part_ids[5], 3, 25.00, 75.00, 'Engine oil change', jimmy_id)
    ON CONFLICT DO NOTHING;
    
    -- Insert corresponding stock out movements for job parts
    INSERT INTO public.stock_movements (
        part_id, movement_type, quantity, previous_quantity, new_quantity, unit_price, total_value,
        reference_type, reference_number, notes, moved_by
    ) VALUES
        (part_ids[1], 'stock_out', 2, 30, 28, 45.00, 90.00, 'job', 'JOB-001', 'Brake replacement job', jimmy_id),
        (part_ids[2], 'stock_out', 1, 35, 34, 12.50, 12.50, 'job', 'JOB-002', 'Oil change service', jimmy_id),
        (part_ids[3], 'stock_out', 1, 3, 2, 120.00, 120.00, 'job', 'JOB-003', 'Battery replacement', jimmy_id),
        (part_ids[4], 'stock_out', 2, 20, 18, 85.00, 170.00, 'job', 'JOB-004', 'Tire replacement job', jimmy_id),
        (part_ids[5], 'stock_out', 3, 30, 27, 25.00, 75.00, 'job', 'JOB-005', 'Engine oil change', jimmy_id)
    ON CONFLICT (movement_number) DO NOTHING;
    
    RAISE NOTICE 'Sample stock management data created successfully';
END $$;

-- Verify the data
SELECT 'Stock Orders:' as info;
SELECT 
    order_number,
    p.part_number,
    p.name,
    quantity_ordered,
    quantity_received,
    order_status,
    order_date,
    expected_delivery
FROM stock_orders so
JOIN parts_inventory p ON so.part_id = p.id
ORDER BY order_date DESC;

SELECT 'Stock Movements:' as info;
SELECT 
    movement_number,
    p.part_number,
    p.name,
    movement_type,
    quantity,
    previous_quantity,
    new_quantity,
    reference_type,
    reference_number,
    movement_date
FROM stock_movements sm
JOIN parts_inventory p ON sm.part_id = p.id
ORDER BY movement_date DESC;

SELECT 'Job Parts Usage:' as info;
SELECT 
    job_id,
    p.part_number,
    p.name,
    quantity_used,
    total_cost,
    usage_date
FROM job_parts jp
JOIN parts_inventory p ON jp.part_id = p.id
ORDER BY usage_date DESC;

SELECT 'Current Inventory Status:' as info;
SELECT 
    part_number,
    name,
    quantity,
    min_quantity,
    status,
    unit_price,
    (quantity * unit_price) as total_value
FROM parts_inventory
ORDER BY status, name;
