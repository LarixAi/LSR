-- =====================================================
-- CREATE TIRE MANAGEMENT TABLES
-- =====================================================

-- Create vehicle_tires table
CREATE TABLE IF NOT EXISTS public.vehicle_tires (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    tire_position TEXT NOT NULL CHECK (tire_position IN ('front_left', 'front_right', 'rear_left', 'rear_right', 'spare')),
    tire_brand TEXT,
    tire_model TEXT,
    tire_size TEXT,
    serial_number TEXT UNIQUE,
    installation_date DATE,
    last_rotation_date DATE,
    tread_depth DECIMAL(4,2),
    pressure_psi INTEGER,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tire_inventory table
CREATE TABLE IF NOT EXISTS public.tire_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tire_brand TEXT NOT NULL,
    tire_model TEXT NOT NULL,
    tire_size TEXT NOT NULL,
    serial_number TEXT UNIQUE,
    quantity INTEGER NOT NULL DEFAULT 0,
    minimum_quantity INTEGER DEFAULT 2,
    cost_per_tire DECIMAL(10,2),
    supplier TEXT,
    location TEXT,
    condition TEXT CHECK (condition IN ('new', 'used', 'damaged')) DEFAULT 'new',
    purchase_date DATE,
    expiry_date DATE,
    notes TEXT,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================

-- Vehicle tires indexes
CREATE INDEX IF NOT EXISTS idx_vehicle_tires_vehicle_id ON public.vehicle_tires(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_tires_organization_id ON public.vehicle_tires(organization_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_tires_tire_position ON public.vehicle_tires(tire_position);
CREATE INDEX IF NOT EXISTS idx_vehicle_tires_is_active ON public.vehicle_tires(is_active);
CREATE INDEX IF NOT EXISTS idx_vehicle_tires_installation_date ON public.vehicle_tires(installation_date);

-- Tire inventory indexes
CREATE INDEX IF NOT EXISTS idx_tire_inventory_organization_id ON public.tire_inventory(organization_id);
CREATE INDEX IF NOT EXISTS idx_tire_inventory_tire_brand ON public.tire_inventory(tire_brand);
CREATE INDEX IF NOT EXISTS idx_tire_inventory_tire_model ON public.tire_inventory(tire_model);
CREATE INDEX IF NOT EXISTS idx_tire_inventory_condition ON public.tire_inventory(condition);
CREATE INDEX IF NOT EXISTS idx_tire_inventory_quantity ON public.tire_inventory(quantity);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.vehicle_tires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tire_inventory ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES FOR VEHICLE_TIRES
-- =====================================================

CREATE POLICY "Users can view vehicle tires in their organization" ON public.vehicle_tires
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can insert vehicle tires in their organization" ON public.vehicle_tires
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update vehicle tires in their organization" ON public.vehicle_tires
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete vehicle tires in their organization" ON public.vehicle_tires
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- =====================================================
-- CREATE RLS POLICIES FOR TIRE_INVENTORY
-- =====================================================

CREATE POLICY "Users can view tire inventory in their organization" ON public.tire_inventory
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can insert tire inventory in their organization" ON public.tire_inventory
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update tire inventory in their organization" ON public.tire_inventory
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete tire inventory in their organization" ON public.tire_inventory
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- =====================================================
-- CREATE UPDATED_AT TRIGGERS
-- =====================================================

-- Vehicle tires trigger
CREATE OR REPLACE FUNCTION update_vehicle_tires_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_vehicle_tires_updated_at
    BEFORE UPDATE ON public.vehicle_tires
    FOR EACH ROW
    EXECUTE FUNCTION update_vehicle_tires_updated_at();

-- Tire inventory trigger
CREATE OR REPLACE FUNCTION update_tire_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tire_inventory_updated_at
    BEFORE UPDATE ON public.tire_inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_tire_inventory_updated_at();

-- =====================================================
-- INSERT SAMPLE DATA (OPTIONAL)
-- =====================================================

-- Note: Uncomment and modify the sample data inserts below if you want to add sample data
-- Make sure to replace the UUIDs with actual values from your database

/*
-- Sample tire inventory (uncomment and modify as needed)
INSERT INTO public.tire_inventory (
    tire_brand,
    tire_model,
    tire_size,
    quantity,
    minimum_quantity,
    cost_per_tire,
    supplier,
    location,
    condition,
    organization_id
) VALUES 
(
    'Michelin',
    'XPS RIB',
    '225/75R16',
    10,
    2,
    150.00,
    'Tire Supply Co',
    'Warehouse A',
    'new',
    'your-organization-id-here'
),
(
    'Bridgestone',
    'R250',
    '245/70R19.5',
    8,
    2,
    180.00,
    'Commercial Tire',
    'Warehouse B',
    'new',
    'your-organization-id-here'
),
(
    'Goodyear',
    'G622 RSD',
    '225/75R16',
    5,
    2,
    140.00,
    'Fleet Tire Solutions',
    'Warehouse A',
    'new',
    'your-organization-id-here'
);

-- Sample vehicle tires (uncomment and modify as needed)
-- Note: You'll need to have vehicles in your database first
INSERT INTO public.vehicle_tires (
    vehicle_id,
    tire_position,
    tire_brand,
    tire_model,
    tire_size,
    serial_number,
    installation_date,
    tread_depth,
    pressure_psi,
    organization_id
) VALUES 
(
    'your-vehicle-id-here',
    'front_left',
    'Michelin',
    'XPS RIB',
    '225/75R16',
    'MIC-2024-001-FL',
    '2024-01-15',
    8.5,
    80,
    'your-organization-id-here'
);
*/
