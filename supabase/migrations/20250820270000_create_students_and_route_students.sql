-- Create students table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE,
    grade_level TEXT,
    school_name TEXT,
    parent_name TEXT,
    parent_phone TEXT,
    parent_email TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relationship TEXT,
    address TEXT,
    pickup_address TEXT,
    dropoff_address TEXT,
    medical_info TEXT,
    special_needs TEXT[],
    allergies TEXT[],
    medications TEXT[],
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create route_students table for assigning students to routes
CREATE TABLE IF NOT EXISTS public.route_students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    pickup_stop_id UUID, -- Will reference route_stops when available
    dropoff_stop_id UUID, -- Will reference route_stops when available
    pickup_time TIME,
    dropoff_time TIME,
    days_of_week INTEGER[],
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(route_id, student_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_organization ON public.students(organization_id);
CREATE INDEX IF NOT EXISTS idx_students_school ON public.students(school_name);
CREATE INDEX IF NOT EXISTS idx_students_grade ON public.students(grade_level);
CREATE INDEX IF NOT EXISTS idx_students_active ON public.students(is_active);
CREATE INDEX IF NOT EXISTS idx_route_students_route_id ON public.route_students(route_id);
CREATE INDEX IF NOT EXISTS idx_route_students_student_id ON public.route_students(student_id);

-- Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_students ENABLE ROW LEVEL SECURITY;

-- RLS Policies for students
CREATE POLICY "Organization admins can view all students" ON public.students
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

CREATE POLICY "Organization admins can insert students" ON public.students
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

CREATE POLICY "Organization admins can update students" ON public.students
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

CREATE POLICY "Organization admins can delete students" ON public.students
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'council')
        )
    );

-- RLS Policies for route_students
CREATE POLICY "Organization admins can view all route students" ON public.route_students
    FOR SELECT USING (
        route_id IN (
            SELECT r.id FROM public.routes r
            JOIN public.profiles p ON r.organization_id = p.organization_id
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'council')
        )
    );

CREATE POLICY "Organization admins can insert route students" ON public.route_students
    FOR INSERT WITH CHECK (
        route_id IN (
            SELECT r.id FROM public.routes r
            JOIN public.profiles p ON r.organization_id = p.organization_id
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'council')
        )
    );

CREATE POLICY "Organization admins can update route students" ON public.route_students
    FOR UPDATE USING (
        route_id IN (
            SELECT r.id FROM public.routes r
            JOIN public.profiles p ON r.organization_id = p.organization_id
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'council')
        )
    );

CREATE POLICY "Organization admins can delete route students" ON public.route_students
    FOR DELETE USING (
        route_id IN (
            SELECT r.id FROM public.routes r
            JOIN public.profiles p ON r.organization_id = p.organization_id
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

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_route_students_updated_at BEFORE UPDATE ON public.route_students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.route_students TO authenticated;

-- Create views for easier querying
CREATE OR REPLACE VIEW public.school_routes_with_students AS
SELECT 
    r.*,
    json_agg(
        json_build_object(
            'id', rst.id,
            'student_id', rst.student_id,
            'pickup_stop_id', rst.pickup_stop_id,
            'dropoff_stop_id', rst.dropoff_stop_id,
            'pickup_time', rst.pickup_time,
            'dropoff_time', rst.dropoff_time,
            'days_of_week', rst.days_of_week,
            'is_active', rst.is_active,
            'student', json_build_object(
                'id', s.id,
                'first_name', s.first_name,
                'last_name', s.last_name,
                'grade_level', s.grade_level,
                'parent_name', s.parent_name,
                'parent_phone', s.parent_phone,
                'parent_email', s.parent_email
            )
        )
    ) as students
FROM public.routes r
LEFT JOIN public.route_students rst ON r.id = rst.route_id
LEFT JOIN public.students s ON rst.student_id = s.id
WHERE r.route_type = 'school'
GROUP BY r.id;

-- Grant access to views
GRANT SELECT ON public.school_routes_with_students TO authenticated;
