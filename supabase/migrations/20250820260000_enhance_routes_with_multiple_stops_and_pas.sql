-- Enhance school routes with multiple stops and personal assistants
-- Add personal assistants table
CREATE TABLE IF NOT EXISTS public.personal_assistants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    date_of_birth DATE,
    address TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relationship TEXT,
    qualifications TEXT[],
    certifications TEXT[],
    experience_years INTEGER DEFAULT 0,
    specializations TEXT[],
    availability_schedule JSONB,
    hourly_rate DECIMAL(10,2),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
    background_check_date DATE,
    background_check_status TEXT DEFAULT 'pending' CHECK (background_check_status IN ('pending', 'passed', 'failed')),
    training_completed TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add route stops table for multiple pickup/dropoff points
CREATE TABLE IF NOT EXISTS public.route_stops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE,
    stop_name TEXT NOT NULL,
    stop_type TEXT NOT NULL CHECK (stop_type IN ('pickup', 'dropoff', 'both')),
    address TEXT NOT NULL,
    coordinates POINT,
    estimated_time TIME,
    actual_time TIME,
    stop_order INTEGER NOT NULL,
    passenger_count INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add route personal assistants assignment table
CREATE TABLE IF NOT EXISTS public.route_personal_assistants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE,
    personal_assistant_id UUID REFERENCES public.personal_assistants(id) ON DELETE CASCADE,
    assignment_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(route_id, personal_assistant_id, assignment_date)
);

-- Add rail replacement stops table
CREATE TABLE IF NOT EXISTS public.rail_replacement_stops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_id UUID REFERENCES public.rail_replacement_services(id) ON DELETE CASCADE,
    stop_name TEXT NOT NULL,
    stop_type TEXT NOT NULL CHECK (stop_type IN ('pickup', 'dropoff', 'both')),
    address TEXT NOT NULL,
    coordinates POINT,
    estimated_time TIME,
    actual_time TIME,
    stop_order INTEGER NOT NULL,
    passenger_count INTEGER DEFAULT 0,
    rail_station_name TEXT,
    rail_line TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_personal_assistants_organization ON public.personal_assistants(organization_id);
CREATE INDEX IF NOT EXISTS idx_personal_assistants_status ON public.personal_assistants(status);
CREATE INDEX IF NOT EXISTS idx_route_stops_route_id ON public.route_stops(route_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_stop_order ON public.route_stops(route_id, stop_order);
CREATE INDEX IF NOT EXISTS idx_route_personal_assistants_route_id ON public.route_personal_assistants(route_id);
CREATE INDEX IF NOT EXISTS idx_route_personal_assistants_pa_id ON public.route_personal_assistants(personal_assistant_id);
CREATE INDEX IF NOT EXISTS idx_rail_replacement_stops_service_id ON public.rail_replacement_stops(service_id);
CREATE INDEX IF NOT EXISTS idx_rail_replacement_stops_stop_order ON public.rail_replacement_stops(service_id, stop_order);

-- Enable RLS
ALTER TABLE public.personal_assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_personal_assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rail_replacement_stops ENABLE ROW LEVEL SECURITY;

-- RLS Policies for personal_assistants
CREATE POLICY "Organization admins can view all personal assistants" ON public.personal_assistants
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

CREATE POLICY "Organization admins can insert personal assistants" ON public.personal_assistants
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

CREATE POLICY "Organization admins can update personal assistants" ON public.personal_assistants
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

CREATE POLICY "Organization admins can delete personal assistants" ON public.personal_assistants
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

-- RLS Policies for route_stops
CREATE POLICY "Organization admins can view all route stops" ON public.route_stops
    FOR SELECT USING (
        route_id IN (
            SELECT r.id FROM public.routes r
            JOIN public.profiles p ON r.organization_id = p.organization_id
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'council')
        )
    );

CREATE POLICY "Organization admins can insert route stops" ON public.route_stops
    FOR INSERT WITH CHECK (
        route_id IN (
            SELECT r.id FROM public.routes r
            JOIN public.profiles p ON r.organization_id = p.organization_id
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'council')
        )
    );

CREATE POLICY "Organization admins can update route stops" ON public.route_stops
    FOR UPDATE USING (
        route_id IN (
            SELECT r.id FROM public.routes r
            JOIN public.profiles p ON r.organization_id = p.organization_id
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'council')
        )
    );

CREATE POLICY "Organization admins can delete route stops" ON public.route_stops
    FOR DELETE USING (
        route_id IN (
            SELECT r.id FROM public.routes r
            JOIN public.profiles p ON r.organization_id = p.organization_id
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'council')
        )
    );

-- RLS Policies for route_personal_assistants
CREATE POLICY "Organization admins can view all route PA assignments" ON public.route_personal_assistants
    FOR SELECT USING (
        route_id IN (
            SELECT r.id FROM public.routes r
            JOIN public.profiles p ON r.organization_id = p.organization_id
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'council')
        )
    );

CREATE POLICY "Organization admins can insert route PA assignments" ON public.route_personal_assistants
    FOR INSERT WITH CHECK (
        route_id IN (
            SELECT r.id FROM public.routes r
            JOIN public.profiles p ON r.organization_id = p.organization_id
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'council')
        )
    );

CREATE POLICY "Organization admins can update route PA assignments" ON public.route_personal_assistants
    FOR UPDATE USING (
        route_id IN (
            SELECT r.id FROM public.routes r
            JOIN public.profiles p ON r.organization_id = p.organization_id
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'council')
        )
    );

CREATE POLICY "Organization admins can delete route PA assignments" ON public.route_personal_assistants
    FOR DELETE USING (
        route_id IN (
            SELECT r.id FROM public.routes r
            JOIN public.profiles p ON r.organization_id = p.organization_id
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'council')
        )
    );

-- RLS Policies for rail_replacement_stops
CREATE POLICY "Organization admins can view all rail replacement stops" ON public.rail_replacement_stops
    FOR SELECT USING (
        service_id IN (
            SELECT rs.id FROM public.rail_replacement_services rs
            JOIN public.profiles p ON rs.organization_id = p.organization_id
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'council')
        )
    );

CREATE POLICY "Organization admins can insert rail replacement stops" ON public.rail_replacement_stops
    FOR INSERT WITH CHECK (
        service_id IN (
            SELECT rs.id FROM public.rail_replacement_services rs
            JOIN public.profiles p ON rs.organization_id = p.organization_id
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'council')
        )
    );

CREATE POLICY "Organization admins can update rail replacement stops" ON public.rail_replacement_stops
    FOR UPDATE USING (
        service_id IN (
            SELECT rs.id FROM public.rail_replacement_services rs
            JOIN public.profiles p ON rs.organization_id = p.organization_id
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'council')
        )
    );

CREATE POLICY "Organization admins can delete rail replacement stops" ON public.rail_replacement_stops
    FOR DELETE USING (
        service_id IN (
            SELECT rs.id FROM public.rail_replacement_services rs
            JOIN public.profiles p ON rs.organization_id = p.organization_id
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'council')
        )
    );

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_personal_assistants_updated_at BEFORE UPDATE ON public.personal_assistants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_route_stops_updated_at BEFORE UPDATE ON public.route_stops
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_route_personal_assistants_updated_at BEFORE UPDATE ON public.route_personal_assistants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rail_replacement_stops_updated_at BEFORE UPDATE ON public.rail_replacement_stops
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.personal_assistants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.route_stops TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.route_personal_assistants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rail_replacement_stops TO authenticated;

-- Create views for easier querying
CREATE OR REPLACE VIEW public.school_routes_with_stops AS
SELECT 
    r.*,
    json_agg(
        json_build_object(
            'id', rs.id,
            'stop_name', rs.stop_name,
            'stop_type', rs.stop_type,
            'address', rs.address,
            'estimated_time', rs.estimated_time,
            'stop_order', rs.stop_order,
            'passenger_count', rs.passenger_count
        ) ORDER BY rs.stop_order
    ) as stops
FROM public.routes r
LEFT JOIN public.route_stops rs ON r.id = rs.route_id
WHERE r.route_type = 'school'
GROUP BY r.id;

CREATE OR REPLACE VIEW public.rail_replacement_with_stops AS
SELECT 
    rrs.*,
    json_agg(
        json_build_object(
            'id', rrs_stops.id,
            'stop_name', rrs_stops.stop_name,
            'stop_type', rrs_stops.stop_type,
            'address', rrs_stops.address,
            'estimated_time', rrs_stops.estimated_time,
            'stop_order', rrs_stops.stop_order,
            'passenger_count', rrs_stops.passenger_count,
            'rail_station_name', rrs_stops.rail_station_name,
            'rail_line', rrs_stops.rail_line
        ) ORDER BY rrs_stops.stop_order
    ) as stops
FROM public.rail_replacement_services rrs
LEFT JOIN public.rail_replacement_stops rrs_stops ON rrs.id = rrs_stops.service_id
GROUP BY rrs.id;

-- Grant access to views
GRANT SELECT ON public.school_routes_with_stops TO authenticated;
GRANT SELECT ON public.rail_replacement_with_stops TO authenticated;

