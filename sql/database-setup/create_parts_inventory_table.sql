-- Create Parts Inventory Table and Sample Data
-- This script creates the parts_inventory table with comprehensive parts tracking

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Mechanics can view parts inventory" ON public.parts_inventory;
DROP POLICY IF EXISTS "Mechanics can manage parts inventory" ON public.parts_inventory;

-- Drop existing trigger if it exists (only for parts_inventory)
DROP TRIGGER IF EXISTS update_parts_inventory_updated_at ON public.parts_inventory;

-- Create parts_inventory table (will not recreate if exists)
CREATE TABLE IF NOT EXISTS public.parts_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) CHECK (category IN ('engine', 'brakes', 'electrical', 'tires', 'fluids', 'body', 'interior', 'other')),
    quantity INTEGER DEFAULT 0,
    min_quantity INTEGER DEFAULT 0,
    unit_price DECIMAL(10,2) DEFAULT 0,
    supplier VARCHAR(255),
    supplier_contact VARCHAR(255),
    location VARCHAR(255),
    status VARCHAR(20) CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock', 'on_order')) DEFAULT 'in_stock',
    last_ordered TIMESTAMP WITH TIME ZONE,
    next_order_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on parts_inventory table
ALTER TABLE public.parts_inventory ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Mechanics can view parts inventory" ON public.parts_inventory
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role IN ('mechanic', 'admin', 'council')
            )
        )
    );

CREATE POLICY "Mechanics can manage parts inventory" ON public.parts_inventory
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

-- Create the trigger for parts_inventory only
CREATE TRIGGER update_parts_inventory_updated_at 
    BEFORE UPDATE ON public.parts_inventory
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- Get Jimmy's profile ID
DO $$
DECLARE
    jimmy_id UUID;
BEGIN
    -- Get Jimmy's profile ID
    SELECT id INTO jimmy_id FROM profiles WHERE email = 'laronelaing3@outlook.com';
    
    -- Insert sample parts inventory
    INSERT INTO public.parts_inventory (
        part_number, name, description, category, quantity, min_quantity, 
        unit_price, supplier, supplier_contact, location, status
    ) VALUES
        ('BRK-001', 'Brake Pad Set (Front)', 'High-quality brake pads for front wheels', 'brakes', 15, 5, 45.00, 'AutoParts UK', 'sales@autopartsuk.com', 'Shelf A1, Bin 3', 'in_stock'),
        ('BRK-002', 'Brake Pad Set (Rear)', 'High-quality brake pads for rear wheels', 'brakes', 8, 5, 38.00, 'AutoParts UK', 'sales@autopartsuk.com', 'Shelf A1, Bin 4', 'low_stock'),
        ('ENG-001', 'Oil Filter', 'Premium oil filter for diesel engines', 'engine', 25, 10, 12.50, 'Motor Factors Ltd', 'orders@motorfactors.co.uk', 'Shelf B2, Bin 1', 'in_stock'),
        ('ENG-002', 'Air Filter', 'High-flow air filter element', 'engine', 12, 8, 18.00, 'Motor Factors Ltd', 'orders@motorfactors.co.uk', 'Shelf B2, Bin 2', 'low_stock'),
        ('ENG-003', 'Fuel Filter', 'Diesel fuel filter cartridge', 'engine', 6, 5, 22.00, 'Motor Factors Ltd', 'orders@motorfactors.co.uk', 'Shelf B2, Bin 3', 'low_stock'),
        ('ELC-001', 'Battery 12V 100Ah', 'Heavy-duty truck battery', 'electrical', 3, 2, 120.00, 'Battery World', 'sales@batteryworld.co.uk', 'Shelf C3, Bin 1', 'low_stock'),
        ('ELC-002', 'Headlight Bulb H4', 'LED replacement headlight bulbs', 'electrical', 20, 10, 8.50, 'Lighting Solutions', 'info@lightingsolutions.co.uk', 'Shelf C3, Bin 2', 'in_stock'),
        ('ELC-003', 'Fuse Set', 'Assorted automotive fuses', 'electrical', 50, 20, 5.00, 'Electronics Supply', 'sales@electronicsupply.co.uk', 'Shelf C3, Bin 3', 'in_stock'),
        ('TIR-001', 'Tire 225/75R16', 'All-season commercial tire', 'tires', 8, 4, 85.00, 'Tire Express', 'orders@tireexpress.co.uk', 'Warehouse Section D', 'low_stock'),
        ('TIR-002', 'Tire 195/65R15', 'Standard passenger tire', 'tires', 12, 6, 65.00, 'Tire Express', 'orders@tireexpress.co.uk', 'Warehouse Section D', 'in_stock'),
        ('FLU-001', 'Engine Oil 5W-30', 'Synthetic engine oil 5L', 'fluids', 30, 15, 25.00, 'Oil Depot', 'sales@oildepot.co.uk', 'Shelf E4, Bin 1', 'in_stock'),
        ('FLU-002', 'Brake Fluid DOT4', 'High-performance brake fluid', 'fluids', 15, 8, 12.00, 'Oil Depot', 'sales@oildepot.co.uk', 'Shelf E4, Bin 2', 'low_stock'),
        ('FLU-003', 'Coolant 50/50', 'Antifreeze coolant concentrate', 'fluids', 20, 10, 18.00, 'Oil Depot', 'sales@oildepot.co.uk', 'Shelf E4, Bin 3', 'in_stock'),
        ('FLU-004', 'Power Steering Fluid', 'ATF power steering fluid', 'fluids', 8, 5, 15.00, 'Oil Depot', 'sales@oildepot.co.uk', 'Shelf E4, Bin 4', 'low_stock'),
        ('BOD-001', 'Windscreen Wiper Blade', 'Universal wiper blade set', 'body', 25, 10, 12.00, 'Body Parts Co', 'sales@bodyparts.co.uk', 'Shelf F5, Bin 1', 'in_stock'),
        ('BOD-002', 'Side Mirror Glass', 'Replacement mirror glass', 'body', 5, 3, 35.00, 'Body Parts Co', 'sales@bodyparts.co.uk', 'Shelf F5, Bin 2', 'low_stock'),
        ('INT-001', 'Floor Mats Set', 'Heavy-duty rubber floor mats', 'interior', 10, 5, 45.00, 'Interior Solutions', 'orders@interiorsolutions.co.uk', 'Shelf G6, Bin 1', 'low_stock'),
        ('INT-002', 'Seat Cover Set', 'Universal seat covers', 'interior', 8, 4, 55.00, 'Interior Solutions', 'orders@interiorsolutions.co.uk', 'Shelf G6, Bin 2', 'low_stock'),
        ('OTH-001', 'First Aid Kit', 'Automotive first aid kit', 'other', 6, 3, 28.00, 'Safety Supplies', 'sales@safetysupplies.co.uk', 'Shelf H7, Bin 1', 'low_stock'),
        ('OTH-002', 'Fire Extinguisher', 'Vehicle fire extinguisher', 'other', 4, 2, 35.00, 'Safety Supplies', 'sales@safetysupplies.co.uk', 'Shelf H7, Bin 2', 'low_stock')
    ON CONFLICT (part_number) DO NOTHING;
    
    RAISE NOTICE 'Sample parts inventory created successfully';
END $$;

-- Verify the data
SELECT 'Parts Inventory:' as info;
SELECT 
    part_number,
    name,
    category,
    quantity,
    min_quantity,
    unit_price,
    status,
    supplier
FROM parts_inventory 
ORDER BY category, name;

-- Show parts by category
SELECT 'Parts by Category:' as info;
SELECT 
    category,
    COUNT(*) as count,
    SUM(quantity * unit_price) as total_value,
    STRING_AGG(part_number, ', ') as part_numbers
FROM parts_inventory 
GROUP BY category
ORDER BY category;

-- Show parts by status
SELECT 'Parts by Status:' as info;
SELECT 
    status,
    COUNT(*) as count,
    SUM(quantity * unit_price) as total_value,
    STRING_AGG(part_number, ', ') as part_numbers
FROM parts_inventory 
GROUP BY status
ORDER BY 
    CASE status 
        WHEN 'out_of_stock' THEN 1 
        WHEN 'low_stock' THEN 2 
        WHEN 'on_order' THEN 3 
        WHEN 'in_stock' THEN 4 
    END;

-- Show total inventory value
SELECT 'Total Inventory Value:' as info;
SELECT 
    COUNT(*) as total_parts,
    SUM(quantity) as total_quantity,
    SUM(quantity * unit_price) as total_value,
    AVG(unit_price) as avg_unit_price
FROM parts_inventory;
