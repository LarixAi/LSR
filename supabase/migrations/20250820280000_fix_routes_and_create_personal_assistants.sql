-- Add missing columns to routes table if they don't exist
DO $$ 
BEGIN
    -- Add school_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routes' AND column_name = 'school_name') THEN
        ALTER TABLE public.routes ADD COLUMN school_name TEXT;
    END IF;
    
    -- Add grade_levels column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routes' AND column_name = 'grade_levels') THEN
        ALTER TABLE public.routes ADD COLUMN grade_levels TEXT;
    END IF;
    
    -- Add contact_person column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routes' AND column_name = 'contact_person') THEN
        ALTER TABLE public.routes ADD COLUMN contact_person TEXT;
    END IF;
    
    -- Add contact_phone column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routes' AND column_name = 'contact_phone') THEN
        ALTER TABLE public.routes ADD COLUMN contact_phone TEXT;
    END IF;
    
    -- Add contact_email column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routes' AND column_name = 'contact_email') THEN
        ALTER TABLE public.routes ADD COLUMN contact_email TEXT;
    END IF;
    
    -- Add notes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routes' AND column_name = 'notes') THEN
        ALTER TABLE public.routes ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Create personal_assistants table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.personal_assistants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    date_of_birth DATE,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relationship TEXT,
    qualifications TEXT[],
    certifications TEXT[],
    experience_years INTEGER DEFAULT 0,
    hourly_rate DECIMAL(10,2),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
    background_check_status TEXT DEFAULT 'pending' CHECK (background_check_status IN ('pending', 'passed', 'failed')),
    background_check_date DATE,
    availability_schedule JSONB DEFAULT '{}',
    specializations TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for personal_assistants
CREATE INDEX IF NOT EXISTS idx_personal_assistants_organization ON public.personal_assistants(organization_id);
CREATE INDEX IF NOT EXISTS idx_personal_assistants_status ON public.personal_assistants(status);
CREATE INDEX IF NOT EXISTS idx_personal_assistants_background_check ON public.personal_assistants(background_check_status);

-- Enable RLS for personal_assistants
ALTER TABLE public.personal_assistants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for personal_assistants
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'personal_assistants' AND policyname = 'Organization admins can view all personal assistants') THEN
        CREATE POLICY "Organization admins can view all personal assistants" ON public.personal_assistants
            FOR SELECT USING (
                organization_id IN (
                    SELECT organization_id FROM public.profiles
                    WHERE id = auth.uid() AND role IN ('admin', 'council')
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'personal_assistants' AND policyname = 'Organization admins can insert personal assistants') THEN
        CREATE POLICY "Organization admins can insert personal assistants" ON public.personal_assistants
            FOR INSERT WITH CHECK (
                organization_id IN (
                    SELECT organization_id FROM public.profiles
                    WHERE id = auth.uid() AND role IN ('admin', 'council')
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'personal_assistants' AND policyname = 'Organization admins can update personal assistants') THEN
        CREATE POLICY "Organization admins can update personal assistants" ON public.personal_assistants
            FOR UPDATE USING (
                organization_id IN (
                    SELECT organization_id FROM public.profiles
                    WHERE id = auth.uid() AND role IN ('admin', 'council')
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'personal_assistants' AND policyname = 'Organization admins can delete personal assistants') THEN
        CREATE POLICY "Organization admins can delete personal assistants" ON public.personal_assistants
            FOR DELETE USING (
                organization_id IN (
                    SELECT organization_id FROM public.profiles
                    WHERE id = auth.uid() AND role IN ('admin', 'council')
                )
            );
    END IF;
END $$;

-- Create updated_at trigger for personal_assistants
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_personal_assistants_updated_at') THEN
        CREATE TRIGGER update_personal_assistants_updated_at BEFORE UPDATE ON public.personal_assistants
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.personal_assistants TO authenticated;

-- Insert some sample personal assistants (only if organizations exist)
INSERT INTO public.personal_assistants (
    organization_id,
    first_name,
    last_name,
    email,
    phone,
    qualifications,
    experience_years,
    hourly_rate,
    status,
    background_check_status
) 
SELECT 
    org.id,
    'Sarah',
    'Johnson',
    'sarah.johnson@example.com',
    '+44 20 7123 4567',
    ARRAY['Child Care', 'First Aid', 'Special Needs Support'],
    5,
    15.50,
    'active',
    'passed'
FROM public.organizations org LIMIT 1;

INSERT INTO public.personal_assistants (
    organization_id,
    first_name,
    last_name,
    email,
    phone,
    qualifications,
    experience_years,
    hourly_rate,
    status,
    background_check_status
) 
SELECT 
    org.id,
    'Michael',
    'Chen',
    'michael.chen@example.com',
    '+44 20 7123 4568',
    ARRAY['Child Care', 'Behavioral Support', 'Autism Awareness'],
    3,
    14.00,
    'active',
    'passed'
FROM public.organizations org LIMIT 1;

