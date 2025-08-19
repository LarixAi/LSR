-- Tachograph Card Reader and Analog Chart Management System
-- Comprehensive migration for digital card reading and analog chart storage

-- =====================================================
-- FIX PROFILES RLS RECURSION ISSUE
-- =====================================================

DO $$
BEGIN
    -- Drop all existing policies on profiles table
    DROP ALL POLICIES ON public.profiles;
    
    -- Temporarily disable RLS
    ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
    
    -- Re-enable RLS
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    
    -- Create simple, non-recursive policies
    CREATE POLICY "profiles_own_access" ON public.profiles
        FOR ALL USING (id = auth.uid());
    
    CREATE POLICY "profiles_service_role_access" ON public.profiles
        FOR ALL USING (auth.role() = 'service_role');
    
    CREATE POLICY "profiles_insert_own" ON public.profiles
        FOR INSERT WITH CHECK (id = auth.uid());
        
    RAISE NOTICE 'Successfully recreated profiles RLS policies';
END $$;

-- =====================================================
-- MECHANIC ORGANIZATION SYSTEM
-- =====================================================

-- Create mechanic_organizations table for mechanics to work with multiple organizations
CREATE TABLE IF NOT EXISTS public.mechanic_organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mechanic_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    role_in_org TEXT DEFAULT 'mechanic' CHECK (role_in_org IN ('mechanic', 'lead_mechanic', 'supervisor')),
    is_active BOOLEAN DEFAULT true,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES public.profiles(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(mechanic_id, organization_id)
);

-- Enable RLS on mechanic_organizations
ALTER TABLE public.mechanic_organizations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for mechanic_organizations
DROP POLICY IF EXISTS "Mechanics can view their organization assignments" ON public.mechanic_organizations;
CREATE POLICY "Mechanics can view their organization assignments" ON public.mechanic_organizations
    FOR SELECT USING (mechanic_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage mechanic organizations" ON public.mechanic_organizations;
CREATE POLICY "Admins can manage mechanic organizations" ON public.mechanic_organizations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'council')
        )
    );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_mechanic_organizations_mechanic_id ON public.mechanic_organizations(mechanic_id);
CREATE INDEX IF NOT EXISTS idx_mechanic_organizations_organization_id ON public.mechanic_organizations(organization_id);

-- =====================================================
-- MECHANIC ORGANIZATION REQUESTS SYSTEM
-- =====================================================

-- Create mechanic organization requests table
CREATE TABLE IF NOT EXISTS public.mechanic_organization_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mechanic_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL CHECK (request_type IN ('mechanic_to_org', 'org_to_mechanic')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'terminated')),
    requested_by UUID NOT NULL REFERENCES public.profiles(id),
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    terminated_by UUID REFERENCES public.profiles(id),
    terminated_at TIMESTAMP WITH TIME ZONE,
    termination_reason TEXT,
    message TEXT,
    response_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(mechanic_id, organization_id)
);

-- Create indexes for mechanic organization requests
CREATE INDEX IF NOT EXISTS idx_mechanic_org_requests_mechanic_id ON public.mechanic_organization_requests(mechanic_id);
CREATE INDEX IF NOT EXISTS idx_mechanic_org_requests_organization_id ON public.mechanic_organization_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_mechanic_org_requests_status ON public.mechanic_organization_requests(status);

-- Enable RLS on mechanic_organization_requests
ALTER TABLE public.mechanic_organization_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mechanic_organization_requests
CREATE POLICY "Mechanics can view their own requests" ON public.mechanic_organization_requests
    FOR SELECT USING (mechanic_id = auth.uid());

CREATE POLICY "Admins can view requests for their organizations" ON public.mechanic_organization_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'council')
            AND organization_id = mechanic_organization_requests.organization_id
        )
    );

CREATE POLICY "Users can create requests" ON public.mechanic_organization_requests
    FOR INSERT WITH CHECK (requested_by = auth.uid());

CREATE POLICY "Admins can update requests for their organizations" ON public.mechanic_organization_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'council')
            AND organization_id = mechanic_organization_requests.organization_id
        )
    );

-- Function to get available organizations for mechanics
CREATE OR REPLACE FUNCTION get_available_organizations_for_mechanic(mechanic_uuid UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    type TEXT,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT o.id, o.name, o.slug, o.type, o.is_active
    FROM public.organizations o
    WHERE o.is_active = true
    AND o.id NOT IN (
        SELECT mor.organization_id 
        FROM public.mechanic_organization_requests mor
        WHERE mor.mechanic_id = mechanic_uuid
        AND mor.status IN ('pending', 'approved', 'active')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ORGANIZATIONS TABLE UPDATES
-- =====================================================

-- Add slug column to organizations if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' 
        AND table_schema = 'public' 
        AND column_name = 'slug'
    ) THEN
        ALTER TABLE public.organizations ADD COLUMN slug TEXT UNIQUE;
        RAISE NOTICE 'Added slug column to organizations table';
    END IF;
END $$;

-- Add type column to organizations if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' 
        AND table_schema = 'public' 
        AND column_name = 'type'
    ) THEN
        ALTER TABLE public.organizations ADD COLUMN type TEXT DEFAULT 'transport_company';
        RAISE NOTICE 'Added type column to organizations table';
    END IF;
END $$;

-- Create sample organizations
INSERT INTO public.organizations (id, name, slug, is_active)
VALUES 
    ('02bbbfc4-a122-4ac4-b692-17dac12ac4d7', 'ABC Transport Ltd', 'abc-transport-ltd', true),
    ('3f64bdba-6e91-4269-8031-3cbadf92ae11', 'City Fleet Services', 'city-fleet-services', true),
    ('f41863b5-c15e-4d27-8d3e-857e1e783e07', 'XYZ Logistics', 'xyz-logistics', true)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    is_active = EXCLUDED.is_active;

-- Insert sample mechanic organization assignments for Jimmy Brick
INSERT INTO public.mechanic_organizations (mechanic_id, organization_id, role_in_org, assigned_by)
VALUES 
    ('7c2e5223-6aa9-4949-8beb-e4634a930518', '02bbbfc4-a122-4ac4-b692-17dac12ac4d7', 'mechanic', '7c2e5223-6aa9-4949-8beb-e4634a930518'),
    ('7c2e5223-6aa9-4949-8beb-e4634a930518', '3f64bdba-6e91-4269-8031-3cbadf92ae11', 'mechanic', '7c2e5223-6aa9-4949-8beb-e4634a930518'),
    ('7c2e5223-6aa9-4949-8beb-e4634a930518', 'f41863b5-c15e-4d27-8d3e-857e1e783e07', 'mechanic', '7c2e5223-6aa9-4949-8beb-e4634a930518')
ON CONFLICT (mechanic_id, organization_id) DO NOTHING;

-- =====================================================
-- TACHOGRAPH CARD READER SYSTEM
-- =====================================================

-- Create tachograph card readers table
CREATE TABLE IF NOT EXISTS public.tachograph_card_readers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reader_name TEXT NOT NULL,
    reader_type TEXT NOT NULL CHECK (reader_type IN ('driver_card', 'vehicle_card', 'workshop_card')),
    serial_number TEXT UNIQUE,
    manufacturer TEXT,
    model TEXT,
    firmware_version TEXT,
    last_calibration_date TIMESTAMP WITH TIME ZONE,
    next_calibration_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'faulty')),
    location TEXT,
    assigned_mechanic_id UUID REFERENCES public.profiles(id),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on tachograph card readers
ALTER TABLE public.tachograph_card_readers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tachograph card readers
DROP POLICY IF EXISTS "Users can view organization's card readers" ON public.tachograph_card_readers;
CREATE POLICY "Users can view organization's card readers" ON public.tachograph_card_readers
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins can manage organization's card readers" ON public.tachograph_card_readers;
CREATE POLICY "Admins can manage organization's card readers" ON public.tachograph_card_readers
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

-- Create tachograph download sessions table
CREATE TABLE IF NOT EXISTS public.tachograph_download_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_name TEXT NOT NULL,
    card_reader_id UUID REFERENCES public.tachograph_card_readers(id) ON DELETE SET NULL,
    card_type TEXT NOT NULL CHECK (card_type IN ('driver_card', 'vehicle_card', 'workshop_card')),
    card_serial_number TEXT,
    download_start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    download_end_time TIMESTAMP WITH TIME ZONE,
    download_status TEXT DEFAULT 'in_progress' CHECK (download_status IN ('in_progress', 'completed', 'failed', 'cancelled')),
    data_file_path TEXT,
    download_notes TEXT,
    performed_by UUID REFERENCES public.profiles(id),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on tachograph download sessions
ALTER TABLE public.tachograph_download_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tachograph download sessions
CREATE POLICY "Users can view organization's download sessions" ON public.tachograph_download_sessions
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage organization's download sessions" ON public.tachograph_download_sessions
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

-- =====================================================
-- ANALOG TACHOGRAPH SYSTEM
-- =====================================================

-- Create analog tachograph charts table
CREATE TABLE IF NOT EXISTS public.analog_tachograph_charts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chart_number TEXT NOT NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    chart_date DATE NOT NULL,
    chart_type TEXT NOT NULL CHECK (chart_type IN ('daily', 'weekly', 'monthly')),
    chart_image_path TEXT,
    chart_status TEXT DEFAULT 'uploaded' CHECK (chart_status IN ('uploaded', 'analyzed', 'archived', 'flagged')),
    analysis_notes TEXT,
    violations_found TEXT[],
    analyzed_by UUID REFERENCES public.profiles(id),
    analyzed_at TIMESTAMP WITH TIME ZONE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on analog tachograph charts
ALTER TABLE public.analog_tachograph_charts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for analog tachograph charts
CREATE POLICY "Users can view organization's analog charts" ON public.analog_tachograph_charts
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage organization's analog charts" ON public.analog_tachograph_charts
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

-- Create analog chart analysis sessions table
CREATE TABLE IF NOT EXISTS public.analog_chart_analysis_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_name TEXT NOT NULL,
    chart_id UUID REFERENCES public.analog_tachograph_charts(id) ON DELETE CASCADE,
    analysis_type TEXT NOT NULL CHECK (analysis_type IN ('manual', 'automated', 'hybrid')),
    analysis_start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    analysis_end_time TIMESTAMP WITH TIME ZONE,
    analysis_status TEXT DEFAULT 'in_progress' CHECK (analysis_status IN ('in_progress', 'completed', 'failed')),
    analysis_results JSONB,
    performed_by UUID REFERENCES public.profiles(id),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on analog chart analysis sessions
ALTER TABLE public.analog_chart_analysis_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for analog chart analysis sessions
CREATE POLICY "Users can view organization's analysis sessions" ON public.analog_chart_analysis_sessions
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage organization's analysis sessions" ON public.analog_chart_analysis_sessions
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

-- Create analog chart storage table
CREATE TABLE IF NOT EXISTS public.analog_chart_storage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storage_location TEXT NOT NULL,
    storage_type TEXT NOT NULL CHECK (storage_type IN ('physical', 'digital', 'hybrid')),
    storage_conditions JSONB,
    access_notes TEXT,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on analog chart storage
ALTER TABLE public.analog_chart_storage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for analog chart storage
CREATE POLICY "Users can view organization's chart storage" ON public.analog_chart_storage
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage organization's chart storage" ON public.analog_chart_storage
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

-- =====================================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================

-- Tachograph card readers indexes
CREATE INDEX IF NOT EXISTS idx_tachograph_card_readers_organization_id ON public.tachograph_card_readers(organization_id);
CREATE INDEX IF NOT EXISTS idx_tachograph_card_readers_assigned_mechanic_id ON public.tachograph_card_readers(assigned_mechanic_id);
CREATE INDEX IF NOT EXISTS idx_tachograph_card_readers_status ON public.tachograph_card_readers(status);

-- Tachograph download sessions indexes
CREATE INDEX IF NOT EXISTS idx_tachograph_download_sessions_organization_id ON public.tachograph_download_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_tachograph_download_sessions_card_reader_id ON public.tachograph_download_sessions(card_reader_id);
CREATE INDEX IF NOT EXISTS idx_tachograph_download_sessions_download_status ON public.tachograph_download_sessions(download_status);

-- Analog tachograph charts indexes
CREATE INDEX IF NOT EXISTS idx_analog_tachograph_charts_organization_id ON public.analog_tachograph_charts(organization_id);
CREATE INDEX IF NOT EXISTS idx_analog_tachograph_charts_vehicle_id ON public.analog_tachograph_charts(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_analog_tachograph_charts_driver_id ON public.analog_tachograph_charts(driver_id);
CREATE INDEX IF NOT EXISTS idx_analog_tachograph_charts_chart_date ON public.analog_tachograph_charts(chart_date);
CREATE INDEX IF NOT EXISTS idx_analog_tachograph_charts_chart_status ON public.analog_tachograph_charts(chart_status);

-- Analog chart analysis sessions indexes
CREATE INDEX IF NOT EXISTS idx_analog_chart_analysis_sessions_organization_id ON public.analog_chart_analysis_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_analog_chart_analysis_sessions_chart_id ON public.analog_chart_analysis_sessions(chart_id);
CREATE INDEX IF NOT EXISTS idx_analog_chart_analysis_sessions_analysis_status ON public.analog_chart_analysis_sessions(analysis_status);

-- Analog chart storage indexes
CREATE INDEX IF NOT EXISTS idx_analog_chart_storage_organization_id ON public.analog_chart_storage(organization_id);
CREATE INDEX IF NOT EXISTS idx_analog_chart_storage_storage_type ON public.analog_chart_storage(storage_type);

-- =====================================================
-- CREATE STORAGE BUCKETS FOR FILES
-- =====================================================

-- Note: Storage buckets need to be created via Supabase Dashboard or CLI
-- The following are the bucket names that should be created:
-- - 'tachograph-files' (for digital tachograph data files)
-- - 'analog-charts' (for analog tachograph chart images)
-- - 'tachograph-reports' (for analysis reports and exports)

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample tachograph card readers
INSERT INTO public.tachograph_card_readers (reader_name, reader_type, serial_number, manufacturer, model, status, organization_id)
VALUES 
    ('Main Workshop Reader', 'workshop_card', 'TCR-001-WS', 'Tachosys', 'DigiVu Pro', 'active', '02bbbfc4-a122-4ac4-b692-17dac12ac4d7'),
    ('Vehicle 1 Reader', 'vehicle_card', 'TCR-002-VH', 'Tachosys', 'DigiVu Lite', 'active', '02bbbfc4-a122-4ac4-b692-17dac12ac4d7'),
    ('Driver Card Reader', 'driver_card', 'TCR-003-DR', 'Tachosys', 'DigiVu Mobile', 'active', '02bbbfc4-a122-4ac4-b692-17dac12ac4d7')
ON CONFLICT (serial_number) DO NOTHING;

-- Insert sample analog tachograph charts
INSERT INTO public.analog_tachograph_charts (chart_number, vehicle_id, driver_id, chart_date, chart_type, chart_status, organization_id)
VALUES 
    ('CHART-2024-001', NULL, NULL, CURRENT_DATE - INTERVAL '1 day', 'daily', 'uploaded', '02bbbfc4-a122-4ac4-b692-17dac12ac4d7'),
    ('CHART-2024-002', NULL, NULL, CURRENT_DATE - INTERVAL '2 days', 'daily', 'uploaded', '02bbbfc4-a122-4ac4-b692-17dac12ac4d7'),
    ('CHART-2024-003', NULL, NULL, CURRENT_DATE - INTERVAL '3 days', 'daily', 'analyzed', '02bbbfc4-a122-4ac4-b692-17dac12ac4d7')
ON CONFLICT (chart_number) DO NOTHING;

-- Insert sample analog chart storage
INSERT INTO public.analog_chart_storage (storage_location, storage_type, storage_conditions, organization_id)
VALUES 
    ('Main Office - Filing Cabinet A', 'physical', '{"temperature": "20C", "humidity": "45%", "security": "locked"}', '02bbbfc4-a122-4ac4-b692-17dac12ac4d7'),
    ('Digital Archive - Cloud Storage', 'digital', '{"encryption": "AES-256", "backup": "daily", "access": "role-based"}', '02bbbfc4-a122-4ac4-b692-17dac12ac4d7')
ON CONFLICT DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log successful migration
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully: Tachograph card reader and analog system with mechanic organization requests';
    RAISE NOTICE 'Created tables: mechanic_organizations, mechanic_organization_requests, tachograph_card_readers, tachograph_download_sessions, analog_tachograph_charts, analog_chart_analysis_sessions, analog_chart_storage';
    RAISE NOTICE 'Created indexes and RLS policies for all tables';
    RAISE NOTICE 'Created helper function: get_available_organizations_for_mechanic';
    RAISE NOTICE 'Inserted sample data for testing';
END $$;
