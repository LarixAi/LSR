-- Create core organizational and operational tables for the transport management system

-- Organizations table (multi-tenant foundation)
CREATE TABLE public.organizations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    license_number TEXT,
    tax_id TEXT,
    settings JSONB DEFAULT '{}',
    subscription_tier TEXT DEFAULT 'basic',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Vehicles table
CREATE TABLE public.vehicles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    vehicle_number TEXT NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    license_plate TEXT NOT NULL,
    vin TEXT,
    capacity INTEGER,
    vehicle_type TEXT DEFAULT 'truck',
    fuel_type TEXT DEFAULT 'diesel',
    status TEXT DEFAULT 'active',
    inspection_due TIMESTAMP WITH TIME ZONE,
    insurance_expiry TIMESTAMP WITH TIME ZONE,
    mot_expiry TIMESTAMP WITH TIME ZONE,
    mileage INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(organization_id, vehicle_number),
    UNIQUE(organization_id, license_plate)
);

-- Jobs/Routes table
CREATE TABLE public.jobs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    job_number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    customer_email TEXT,
    pickup_address TEXT,
    delivery_address TEXT,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    estimated_duration INTEGER, -- minutes
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    assigned_driver_id UUID REFERENCES public.profiles(id),
    assigned_vehicle_id UUID REFERENCES public.vehicles(id),
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Vehicle Inspections table
CREATE TABLE public.vehicle_inspections (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
    inspector_id UUID REFERENCES public.profiles(id) NOT NULL,
    inspection_type TEXT DEFAULT 'daily_check',
    inspection_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    status TEXT DEFAULT 'pending',
    defects_found INTEGER DEFAULT 0,
    maintenance_required BOOLEAN DEFAULT false,
    compliance_score DECIMAL(3,2),
    inspection_data JSONB DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Security audit logs table
CREATE TABLE public.security_audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    organization_id UUID REFERENCES public.organizations(id),
    event_type TEXT NOT NULL,
    event_details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    severity TEXT DEFAULT 'low',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Time tracking table
CREATE TABLE public.time_entries (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    job_id UUID REFERENCES public.jobs(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    entry_type TEXT DEFAULT 'work',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for organizations
CREATE POLICY "Admins can manage all organizations" ON public.organizations FOR ALL USING (public.is_admin());
CREATE POLICY "Users can view their organization" ON public.organizations FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND organization_id = organizations.id)
);

-- Create RLS policies for vehicles
CREATE POLICY "Organization members can view vehicles" ON public.vehicles FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND organization_id = vehicles.organization_id)
);
CREATE POLICY "Admins can manage vehicles" ON public.vehicles FOR ALL USING (
    public.is_admin() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND organization_id = vehicles.organization_id AND role IN ('admin', 'manager'))
);

-- Create RLS policies for jobs
CREATE POLICY "Organization members can view jobs" ON public.jobs FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND organization_id = jobs.organization_id)
);
CREATE POLICY "Managers can manage jobs" ON public.jobs FOR ALL USING (
    public.is_admin() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND organization_id = jobs.organization_id AND role IN ('admin', 'manager'))
);
CREATE POLICY "Drivers can update assigned jobs" ON public.jobs FOR UPDATE USING (assigned_driver_id = auth.uid());

-- Create RLS policies for vehicle inspections
CREATE POLICY "Organization members can view inspections" ON public.vehicle_inspections FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND organization_id = vehicle_inspections.organization_id)
);
CREATE POLICY "Drivers and managers can create inspections" ON public.vehicle_inspections FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND organization_id = vehicle_inspections.organization_id AND role IN ('admin', 'manager', 'driver', 'mechanic'))
);

-- Create RLS policies for security logs
CREATE POLICY "Admins can view all security logs" ON public.security_audit_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "Users can view their own security logs" ON public.security_audit_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can insert security logs" ON public.security_audit_logs FOR INSERT WITH CHECK (true);

-- Create RLS policies for time entries
CREATE POLICY "Users can manage their time entries" ON public.time_entries FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Managers can view organization time entries" ON public.time_entries FOR SELECT USING (
    public.is_admin() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND organization_id = time_entries.organization_id AND role IN ('admin', 'manager'))
);

-- Create essential database functions
CREATE OR REPLACE FUNCTION public.log_security_event(
    p_user_id UUID DEFAULT NULL,
    p_event_type TEXT DEFAULT NULL,
    p_event_details JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.security_audit_logs (user_id, event_type, event_details, organization_id)
    VALUES (
        p_user_id,
        p_event_type,
        p_event_details,
        (SELECT organization_id FROM public.profiles WHERE id = p_user_id LIMIT 1)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.log_security_event_enhanced(
    p_user_id UUID DEFAULT NULL,
    p_event_type TEXT DEFAULT NULL,
    p_event_details JSONB DEFAULT '{}',
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.security_audit_logs (user_id, event_type, event_details, ip_address, user_agent, organization_id, severity)
    VALUES (
        p_user_id,
        p_event_type,
        p_event_details,
        p_ip_address::INET,
        p_user_agent,
        (SELECT organization_id FROM public.profiles WHERE id = p_user_id LIMIT 1),
        COALESCE(p_event_details->>'severity', 'low')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.validate_password_complexity(password TEXT)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    errors TEXT[] := '{}';
BEGIN
    -- Check length
    IF length(password) < 8 THEN
        errors := array_append(errors, 'Password must be at least 8 characters long');
    END IF;
    
    -- Check for uppercase letter
    IF password !~ '[A-Z]' THEN
        errors := array_append(errors, 'Password must contain at least one uppercase letter');
    END IF;
    
    -- Check for lowercase letter
    IF password !~ '[a-z]' THEN
        errors := array_append(errors, 'Password must contain at least one lowercase letter');
    END IF;
    
    -- Check for digit
    IF password !~ '[0-9]' THEN
        errors := array_append(errors, 'Password must contain at least one number');
    END IF;
    
    -- Check for special character
    IF password !~ '[!@#$%^&*(),.?":{}|<>]' THEN
        errors := array_append(errors, 'Password must contain at least one special character');
    END IF;
    
    result := jsonb_build_object(
        'valid', array_length(errors, 1) IS NULL,
        'errors', to_jsonb(errors)
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create update triggers for timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vehicle_inspections_updated_at BEFORE UPDATE ON public.vehicle_inspections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON public.time_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample organization for testing
INSERT INTO public.organizations (name, slug, email) 
VALUES ('Demo Transport Company', 'demo-transport', 'admin@demo-transport.com')
ON CONFLICT (slug) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_vehicles_organization_id ON public.vehicles(organization_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON public.vehicles(status);
CREATE INDEX IF NOT EXISTS idx_jobs_organization_id ON public.jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_driver ON public.jobs(assigned_driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_organization_id ON public.vehicle_inspections(organization_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_vehicle_id ON public.vehicle_inspections(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON public.security_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON public.security_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON public.time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_organization_id ON public.time_entries(organization_id);