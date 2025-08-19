-- =====================================================
-- CREATE MECHANICS AND MAINTENANCE REQUESTS TABLES
-- =====================================================

-- Create mechanics table
CREATE TABLE IF NOT EXISTS public.mechanics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    mechanic_name TEXT,
    mechanic_license_number TEXT UNIQUE,
    specializations TEXT[] DEFAULT '{}',
    certification_level TEXT CHECK (certification_level IN ('apprentice', 'journeyman', 'master', 'certified_technician')),
    hourly_rate DECIMAL(10,2),
    availability_schedule JSONB,
    is_available BOOLEAN DEFAULT true,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create maintenance_requests table
CREATE TABLE IF NOT EXISTS public.maintenance_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    mechanic_id UUID REFERENCES public.mechanics(id) ON DELETE SET NULL,
    requested_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT,
    description TEXT NOT NULL,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    parts_needed TEXT[] DEFAULT '{}',
    scheduled_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================

-- Mechanics indexes
CREATE INDEX IF NOT EXISTS idx_mechanics_organization_id ON public.mechanics(organization_id);
CREATE INDEX IF NOT EXISTS idx_mechanics_profile_id ON public.mechanics(profile_id);
CREATE INDEX IF NOT EXISTS idx_mechanics_is_available ON public.mechanics(is_available);

-- Maintenance requests indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_organization_id ON public.maintenance_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_vehicle_id ON public.maintenance_requests(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_mechanic_id ON public.maintenance_requests(mechanic_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_requested_by ON public.maintenance_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON public.maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_priority ON public.maintenance_requests(priority);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_scheduled_date ON public.maintenance_requests(scheduled_date);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.mechanics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES FOR MECHANICS
-- =====================================================

CREATE POLICY "Users can view mechanics in their organization" ON public.mechanics
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Admins can insert mechanics in their organization" ON public.mechanics
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

CREATE POLICY "Admins can update mechanics in their organization" ON public.mechanics
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

CREATE POLICY "Admins can delete mechanics in their organization" ON public.mechanics
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

-- =====================================================
-- CREATE RLS POLICIES FOR MAINTENANCE REQUESTS
-- =====================================================

CREATE POLICY "Users can view maintenance requests in their organization" ON public.maintenance_requests
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can insert maintenance requests in their organization" ON public.maintenance_requests
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        ) AND
        requested_by = auth.uid()
    );

CREATE POLICY "Users can update maintenance requests they created or are assigned to" ON public.maintenance_requests
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        ) AND (
            requested_by = auth.uid() OR 
            mechanic_id IN (
                SELECT id FROM public.mechanics WHERE profile_id = auth.uid()
            )
        )
    );

CREATE POLICY "Admins can update any maintenance request in their organization" ON public.maintenance_requests
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

CREATE POLICY "Admins can delete maintenance requests in their organization" ON public.maintenance_requests
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

-- =====================================================
-- CREATE UPDATED_AT TRIGGERS
-- =====================================================

-- Mechanics trigger
CREATE OR REPLACE FUNCTION update_mechanics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_mechanics_updated_at
    BEFORE UPDATE ON public.mechanics
    FOR EACH ROW
    EXECUTE FUNCTION update_mechanics_updated_at();

-- Maintenance requests trigger
CREATE OR REPLACE FUNCTION update_maintenance_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_maintenance_requests_updated_at
    BEFORE UPDATE ON public.maintenance_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_maintenance_requests_updated_at();

-- =====================================================
-- INSERT SAMPLE DATA (OPTIONAL)
-- =====================================================

-- Note: Uncomment and modify the sample data inserts below if you want to add sample data
-- Make sure to replace the UUIDs with actual values from your database

/*
-- Sample mechanics (uncomment and modify as needed)
INSERT INTO public.mechanics (
    mechanic_name,
    mechanic_license_number,
    specializations,
    certification_level,
    hourly_rate,
    is_available,
    organization_id
) VALUES 
(
    'John Smith',
    'MECH-2024-001',
    ARRAY['Engine Repair', 'Brake Systems', 'Electrical'],
    'master',
    45.00,
    true,
    'your-organization-id-here'
),
(
    'Sarah Johnson',
    'MECH-2024-002',
    ARRAY['Transmission', 'Suspension', 'Diagnostics'],
    'journeyman',
    35.00,
    true,
    'your-organization-id-here'
),
(
    'Mike Davis',
    'MECH-2024-003',
    ARRAY['HVAC Systems', 'Fuel Systems', 'General Maintenance'],
    'certified_technician',
    40.00,
    false,
    'your-organization-id-here'
);

-- Sample maintenance requests (uncomment and modify as needed)
-- Note: You'll need to have vehicles and profiles in your database first
INSERT INTO public.maintenance_requests (
    vehicle_id,
    requested_by,
    title,
    description,
    priority,
    status,
    estimated_hours,
    estimated_cost,
    parts_needed,
    organization_id
) VALUES 
(
    'your-vehicle-id-here',
    'your-profile-id-here',
    'Engine Performance Issue',
    'Vehicle experiencing reduced power and unusual engine noise',
    'high',
    'pending',
    4.0,
    300.00,
    ARRAY['Air Filter', 'Fuel Filter', 'Spark Plugs'],
    'your-organization-id-here'
);
*/
