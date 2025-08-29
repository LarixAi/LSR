-- Create missing tables for DriverDetail page functionality

-- Training Modules table
CREATE TABLE IF NOT EXISTS public.training_modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    duration INTEGER DEFAULT 0, -- in minutes
    is_required BOOLEAN DEFAULT false,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training Assignments table
CREATE TABLE IF NOT EXISTS public.training_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    driver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    training_module_id UUID REFERENCES public.training_modules(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'overdue')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    completed_at TIMESTAMP WITH TIME ZONE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training Completions table
CREATE TABLE IF NOT EXISTS public.training_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    driver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    training_module_id UUID REFERENCES public.training_modules(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    score INTEGER CHECK (score >= 0 AND score <= 100),
    certificate_url TEXT,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- License Renewals table (if not exists)
CREATE TABLE IF NOT EXISTS public.license_renewals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    driver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100),
    license_type VARCHAR(100),
    expiry_date DATE NOT NULL,
    reminder_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'acknowledged', 'completed')),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_training_modules_org ON public.training_modules(organization_id);
CREATE INDEX IF NOT EXISTS idx_training_assignments_driver ON public.training_assignments(driver_id);
CREATE INDEX IF NOT EXISTS idx_training_assignments_org ON public.training_assignments(organization_id);
CREATE INDEX IF NOT EXISTS idx_training_completions_driver ON public.training_completions(driver_id);
CREATE INDEX IF NOT EXISTS idx_training_completions_org ON public.training_completions(organization_id);
CREATE INDEX IF NOT EXISTS idx_license_renewals_driver ON public.license_renewals(driver_id);
CREATE INDEX IF NOT EXISTS idx_license_renewals_org ON public.license_renewals(organization_id);
CREATE INDEX IF NOT EXISTS idx_license_renewals_expiry ON public.license_renewals(expiry_date);

-- Enable Row Level Security
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_renewals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Training Modules policies
CREATE POLICY "Users can view training modules in their organization" ON public.training_modules
    FOR SELECT USING (organization_id = auth.jwt() ->> 'organization_id'::text);

CREATE POLICY "Admins can manage training modules in their organization" ON public.training_modules
    FOR ALL USING (organization_id = auth.jwt() ->> 'organization_id'::text);

-- Training Assignments policies
CREATE POLICY "Users can view training assignments in their organization" ON public.training_assignments
    FOR SELECT USING (organization_id = auth.jwt() ->> 'organization_id'::text);

CREATE POLICY "Admins can manage training assignments in their organization" ON public.training_assignments
    FOR ALL USING (organization_id = auth.jwt() ->> 'organization_id'::text);

-- Training Completions policies
CREATE POLICY "Users can view training completions in their organization" ON public.training_completions
    FOR SELECT USING (organization_id = auth.jwt() ->> 'organization_id'::text);

CREATE POLICY "Admins can manage training completions in their organization" ON public.training_completions
    FOR ALL USING (organization_id = auth.jwt() ->> 'organization_id'::text);

-- License Renewals policies
CREATE POLICY "Users can view license renewals in their organization" ON public.license_renewals
    FOR SELECT USING (organization_id = auth.jwt() ->> 'organization_id'::text);

CREATE POLICY "Admins can manage license renewals in their organization" ON public.license_renewals
    FOR ALL USING (organization_id = auth.jwt() ->> 'organization_id'::text);

-- Insert some sample data for testing
INSERT INTO public.training_modules (name, description, category, duration, is_required, organization_id) VALUES
    ('Defensive Driving', 'Learn defensive driving techniques and safety protocols', 'Safety', 120, true, (SELECT id FROM public.organizations LIMIT 1)),
    ('Vehicle Maintenance', 'Basic vehicle maintenance and inspection procedures', 'Maintenance', 90, true, (SELECT id FROM public.organizations LIMIT 1)),
    ('Route Planning', 'Efficient route planning and navigation skills', 'Operations', 60, false, (SELECT id FROM public.organizations LIMIT 1)),
    ('Customer Service', 'Professional customer service and communication', 'Soft Skills', 45, false, (SELECT id FROM public.organizations LIMIT 1))
ON CONFLICT DO NOTHING;

-- Insert sample license renewals
INSERT INTO public.license_renewals (driver_id, document_type, document_name, license_number, license_type, expiry_date, reminder_date, organization_id) VALUES
    ((SELECT id FROM public.profiles WHERE role = 'driver' LIMIT 1), 'Driver License', 'UK Driver License', 'DL123456789', 'Category C', '2024-12-31', '2024-11-30', (SELECT id FROM public.organizations LIMIT 1)),
    ((SELECT id FROM public.profiles WHERE role = 'driver' LIMIT 1), 'Medical Certificate', 'Driver Medical Certificate', 'MC987654321', 'Medical Certificate', '2024-10-15', '2024-09-15', (SELECT id FROM public.organizations LIMIT 1))
ON CONFLICT DO NOTHING;
