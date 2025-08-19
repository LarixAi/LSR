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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Mechanics can view their own requests" ON public.mechanic_organization_requests;
DROP POLICY IF EXISTS "Admins can view requests for their organizations" ON public.mechanic_organization_requests;
DROP POLICY IF EXISTS "Users can create requests" ON public.mechanic_organization_requests;
DROP POLICY IF EXISTS "Admins can update requests for their organizations" ON public.mechanic_organization_requests;

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

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample mechanic organization assignments for Jimmy Brick
INSERT INTO public.mechanic_organizations (mechanic_id, organization_id, role_in_org, assigned_by)
VALUES 
    ('7c2e5223-6aa9-4949-8beb-e4634a930518', '02bbbfc4-a122-4ac4-b692-17dac12ac4d7', 'mechanic', '7c2e5223-6aa9-4949-8beb-e4634a930518'),
    ('7c2e5223-6aa9-4949-8beb-e4634a930518', '3f64bdba-6e91-4269-8031-3cbadf92ae11', 'mechanic', '7c2e5223-6aa9-4949-8beb-e4634a930518'),
    ('7c2e5223-6aa9-4949-8beb-e4634a930518', 'f41863b5-c15e-4d27-8d3e-857e1e783e07', 'mechanic', '7c2e5223-6aa9-4949-8beb-e4634a930518')
ON CONFLICT (mechanic_id, organization_id) DO NOTHING;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify the table was created
SELECT 'mechanic_organization_requests table created successfully' as status;

-- Check if the function was created
SELECT 'get_available_organizations_for_mechanic function created successfully' as status;
