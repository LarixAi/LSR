-- =====================================================
-- CREATE SCHEDULES TABLE
-- =====================================================

-- Create schedules table
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    driver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    route_id UUID REFERENCES public.routes(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    status TEXT CHECK (status IN ('draft', 'published', 'active', 'completed', 'cancelled')) DEFAULT 'draft',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    recurring_pattern JSONB,
    is_recurring BOOLEAN DEFAULT false,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_schedules_organization_id ON public.schedules(organization_id);
CREATE INDEX IF NOT EXISTS idx_schedules_driver_id ON public.schedules(driver_id);
CREATE INDEX IF NOT EXISTS idx_schedules_vehicle_id ON public.schedules(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_schedules_route_id ON public.schedules(route_id);
CREATE INDEX IF NOT EXISTS idx_schedules_start_date ON public.schedules(start_date);
CREATE INDEX IF NOT EXISTS idx_schedules_status ON public.schedules(status);
CREATE INDEX IF NOT EXISTS idx_schedules_created_by ON public.schedules(created_by);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES
-- =====================================================

CREATE POLICY "Users can view schedules in their organization" ON public.schedules
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can insert schedules in their organization" ON public.schedules
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        ) AND
        created_by = auth.uid()
    );

CREATE POLICY "Users can update schedules they created or are assigned to" ON public.schedules
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        ) AND (
            created_by = auth.uid() OR 
            driver_id = auth.uid()
        )
    );

CREATE POLICY "Admins can update any schedule in their organization" ON public.schedules
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

CREATE POLICY "Users can delete schedules they created" ON public.schedules
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        ) AND
        created_by = auth.uid()
    );

CREATE POLICY "Admins can delete schedules in their organization" ON public.schedules
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

-- =====================================================
-- CREATE UPDATED_AT TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION update_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_schedules_updated_at
    BEFORE UPDATE ON public.schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_schedules_updated_at();
