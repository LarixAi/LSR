-- Create Sample Mechanic Data
-- This script adds realistic sample data for the mechanic dashboard

-- First, ensure we have the mechanic role and Jimmy's profile
DO $$ 
BEGIN
    -- Add mechanic role if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'mechanic' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    ) THEN
        ALTER TYPE user_role ADD VALUE 'mechanic';
        RAISE NOTICE 'Added mechanic role to user_role enum';
    END IF;
END $$;

-- Update Jimmy's profile to mechanic role
UPDATE profiles 
SET 
  role = 'mechanic'::user_role,
  first_name = 'Jimmy',
  last_name = 'Brick',
  updated_at = NOW()
WHERE email = 'laronelaing3@outlook.com';

-- Create work_orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_number VARCHAR(20) UNIQUE NOT NULL,
    vehicle_id UUID REFERENCES public.vehicles(id),
    mechanic_id UUID REFERENCES public.profiles(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    estimated_hours DECIMAL(4,2),
    actual_hours DECIMAL(4,2),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vehicle_inspections table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.vehicle_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_number VARCHAR(20) UNIQUE NOT NULL,
    vehicle_id UUID REFERENCES public.vehicles(id),
    inspector_id UUID REFERENCES public.profiles(id),
    inspection_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('scheduled', 'in_progress', 'completed', 'failed')),
    scheduled_date DATE NOT NULL,
    completed_date DATE,
    result VARCHAR(20) CHECK (result IN ('pass', 'fail', 'conditional')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create parts_inventory table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.parts_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    quantity INTEGER DEFAULT 0,
    min_quantity INTEGER DEFAULT 0,
    unit_price DECIMAL(10,2),
    supplier VARCHAR(255),
    location VARCHAR(100),
    status VARCHAR(20) CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock', 'discontinued')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts_inventory ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Mechanics can view work orders" ON public.work_orders
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role IN ('mechanic', 'admin', 'council')
            )
        )
    );

CREATE POLICY "Mechanics can manage work orders" ON public.work_orders
    FOR ALL USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role IN ('mechanic', 'admin', 'council')
            )
        )
    );

CREATE POLICY "Mechanics can view inspections" ON public.vehicle_inspections
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role IN ('mechanic', 'admin', 'council')
            )
        )
    );

CREATE POLICY "Mechanics can manage inspections" ON public.vehicle_inspections
    FOR ALL USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role IN ('mechanic', 'admin', 'council')
            )
        )
    );

CREATE POLICY "Mechanics can view inventory" ON public.parts_inventory
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role IN ('mechanic', 'admin', 'council')
            )
        )
    );

CREATE POLICY "Mechanics can manage inventory" ON public.parts_inventory
    FOR ALL USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role IN ('mechanic', 'admin', 'council')
            )
        )
    );

-- Get Jimmy's profile ID
DO $$
DECLARE
    jimmy_id UUID;
    vehicle_ids UUID[];
BEGIN
    -- Get Jimmy's profile ID
    SELECT id INTO jimmy_id FROM profiles WHERE email = 'laronelaing3@outlook.com';
    
    -- Get some vehicle IDs
    SELECT ARRAY_AGG(id) INTO vehicle_ids FROM vehicles LIMIT 5;
    
    -- Insert sample work orders
    INSERT INTO public.work_orders (
        work_order_number, vehicle_id, mechanic_id, title, description, 
        priority, status, estimated_hours, started_at
    ) VALUES
        ('WO-2024-001', vehicle_ids[1], jimmy_id, 'Engine Repair', 'Engine making unusual noise, needs diagnostic', 'high', 'in_progress', 4.0, NOW() - INTERVAL '2 hours'),
        ('WO-2024-002', vehicle_ids[2], jimmy_id, 'Brake System Check', 'Brake pedal feels soft, need to inspect brake system', 'medium', 'pending', 2.0, NULL),
        ('WO-2024-003', vehicle_ids[3], jimmy_id, 'Electrical System', 'Dashboard lights flickering, electrical issue', 'low', 'completed', 1.5, NOW() - INTERVAL '6 hours'),
        ('WO-2024-004', vehicle_ids[4], jimmy_id, 'Oil Change & Filter', 'Regular maintenance - oil change and filter replacement', 'low', 'completed', 0.5, NOW() - INTERVAL '8 hours'),
        ('WO-2024-005', vehicle_ids[5], jimmy_id, 'Tire Replacement', 'Front left tire showing wear, needs replacement', 'medium', 'in_progress', 1.0, NOW() - INTERVAL '1 hour')
    ON CONFLICT (work_order_number) DO NOTHING;
    
    -- Insert sample vehicle inspections
    INSERT INTO public.vehicle_inspections (
        inspection_number, vehicle_id, inspector_id, inspection_type, 
        status, scheduled_date, result
    ) VALUES
        ('INS-2024-001', vehicle_ids[1], jimmy_id, 'Safety Inspection', 'scheduled', CURRENT_DATE + INTERVAL '2 days', NULL),
        ('INS-2024-002', vehicle_ids[2], jimmy_id, 'Annual Service', 'scheduled', CURRENT_DATE + INTERVAL '4 days', NULL),
        ('INS-2024-003', vehicle_ids[3], jimmy_id, 'Pre-Trip Check', 'completed', CURRENT_DATE - INTERVAL '1 day', 'pass'),
        ('INS-2024-004', vehicle_ids[4], jimmy_id, 'Brake System Inspection', 'in_progress', CURRENT_DATE, NULL),
        ('INS-2024-005', vehicle_ids[5], jimmy_id, 'Electrical System Check', 'scheduled', CURRENT_DATE + INTERVAL '1 day', NULL)
    ON CONFLICT (inspection_number) DO NOTHING;
    
    -- Insert sample parts inventory
    INSERT INTO public.parts_inventory (
        part_number, name, category, description, quantity, min_quantity, 
        unit_price, supplier, location, status
    ) VALUES
        ('BP-001', 'Brake Pads', 'Brakes', 'Front brake pads for commercial vehicles', 15, 5, 45.99, 'AutoParts Co', 'Shelf A1', 'in_stock'),
        ('OF-002', 'Oil Filter', 'Engine', 'High-quality oil filter for diesel engines', 8, 10, 12.50, 'FilterPro', 'Shelf B2', 'low_stock'),
        ('AF-003', 'Air Filter', 'Engine', 'Air filter for engine intake system', 12, 5, 18.75, 'FilterPro', 'Shelf B3', 'in_stock'),
        ('SP-004', 'Spark Plugs', 'Engine', 'Iridium spark plugs set of 6', 3, 8, 8.99, 'SparkTech', 'Shelf C1', 'out_of_stock'),
        ('TF-005', 'Transmission Fluid', 'Transmission', 'Synthetic transmission fluid 1L', 20, 3, 15.25, 'FluidMax', 'Shelf D1', 'in_stock'),
        ('BF-006', 'Brake Fluid', 'Brakes', 'DOT 4 brake fluid 500ml', 10, 5, 9.99, 'FluidMax', 'Shelf D2', 'in_stock'),
        ('WP-007', 'Wiper Blades', 'Exterior', 'Windshield wiper blades pair', 6, 4, 22.50, 'WiperPro', 'Shelf E1', 'in_stock'),
        ('HB-008', 'Headlight Bulbs', 'Electrical', 'LED headlight bulbs H4', 4, 6, 35.00, 'LightTech', 'Shelf E2', 'low_stock')
    ON CONFLICT (part_number) DO NOTHING;
    
    RAISE NOTICE 'Sample mechanic data created successfully';
END $$;

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON public.work_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_inspections_updated_at BEFORE UPDATE ON public.vehicle_inspections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parts_inventory_updated_at BEFORE UPDATE ON public.parts_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify the data
SELECT 'Work Orders:' as info;
SELECT 
    work_order_number,
    title,
    priority,
    status,
    estimated_hours,
    started_at
FROM work_orders 
ORDER BY created_at DESC;

SELECT 'Vehicle Inspections:' as info;
SELECT 
    inspection_number,
    inspection_type,
    status,
    scheduled_date,
    result
FROM vehicle_inspections 
ORDER BY scheduled_date;

SELECT 'Parts Inventory:' as info;
SELECT 
    part_number,
    name,
    category,
    quantity,
    min_quantity,
    status
FROM parts_inventory 
ORDER BY category, name;

SELECT 'Jimmy Profile:' as info;
SELECT 
    first_name,
    last_name,
    email,
    role,
    created_at
FROM profiles 
WHERE email = 'laronelaing3@outlook.com';
