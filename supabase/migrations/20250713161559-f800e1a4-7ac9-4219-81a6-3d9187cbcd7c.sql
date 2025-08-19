-- Add missing columns to vehicles table for PSV compliance
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS insurance_expiry date,
ADD COLUMN IF NOT EXISTS assigned_driver_id uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS vehicle_type text DEFAULT 'bus',
ADD COLUMN IF NOT EXISTS psv_license_number text,
ADD COLUMN IF NOT EXISTS psv_license_expiry date,
ADD COLUMN IF NOT EXISTS last_inspection_date date,
ADD COLUMN IF NOT EXISTS next_inspection_due date;

-- Create vehicle_compliance_logs table
CREATE TABLE IF NOT EXISTS public.vehicle_compliance_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    driver_id uuid REFERENCES public.profiles(id),
    inspection_date date NOT NULL DEFAULT CURRENT_DATE,
    inspection_type text NOT NULL DEFAULT 'daily_check',
    inspection_passed boolean NOT NULL DEFAULT true,
    defects_found text[],
    notes text,
    signed_by uuid REFERENCES public.profiles(id),
    document_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id)
);

-- Enable RLS on vehicle_compliance_logs
ALTER TABLE public.vehicle_compliance_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vehicle_compliance_logs
CREATE POLICY "Users can view compliance logs in their organization" 
ON public.vehicle_compliance_logs 
FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Drivers and admins can create compliance logs" 
ON public.vehicle_compliance_logs 
FOR INSERT 
WITH CHECK (
    organization_id = get_user_organization_id() 
    AND (
        signed_by = auth.uid() 
        OR is_organization_admin()
    )
);

CREATE POLICY "Admins can manage all compliance logs" 
ON public.vehicle_compliance_logs 
FOR ALL 
USING (
    (organization_id = get_user_organization_id() AND is_organization_admin())
    OR is_admin_user()
);

-- Create schedules table
CREATE TABLE IF NOT EXISTS public.schedules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id uuid NOT NULL REFERENCES public.profiles(id),
    vehicle_id uuid NOT NULL REFERENCES public.vehicles(id),
    route_id uuid REFERENCES public.routes(id),
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    job_type text NOT NULL DEFAULT 'school_run',
    status text NOT NULL DEFAULT 'scheduled',
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id),
    created_by uuid REFERENCES public.profiles(id)
);

-- Enable RLS on schedules
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for schedules
CREATE POLICY "Users can view schedules in their organization" 
ON public.schedules 
FOR SELECT 
USING (organization_id = get_user_organization_id());

CREATE POLICY "Drivers can view their own schedules" 
ON public.schedules 
FOR SELECT 
USING (driver_id = auth.uid());

CREATE POLICY "Admins can manage schedules in their organization" 
ON public.schedules 
FOR ALL 
USING (
    (organization_id = get_user_organization_id() AND is_organization_admin())
    OR is_admin_user()
);

-- Create user_permissions table for RBAC
CREATE TABLE IF NOT EXISTS public.user_permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    permission text NOT NULL,
    resource text,
    organization_id uuid NOT NULL REFERENCES public.organizations(id),
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, permission, resource, organization_id)
);

-- Enable RLS on user_permissions
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for user_permissions
CREATE POLICY "Users can view their own permissions" 
ON public.user_permissions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage permissions" 
ON public.user_permissions 
FOR ALL 
USING (is_admin_user() OR (organization_id = get_user_organization_id() AND is_organization_admin()));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vehicle_compliance_logs_vehicle_id ON public.vehicle_compliance_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_compliance_logs_date ON public.vehicle_compliance_logs(inspection_date);
CREATE INDEX IF NOT EXISTS idx_schedules_driver_id ON public.schedules(driver_id);
CREATE INDEX IF NOT EXISTS idx_schedules_vehicle_id ON public.schedules(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_schedules_start_time ON public.schedules(start_time);
CREATE INDEX IF NOT EXISTS idx_vehicles_assigned_driver ON public.vehicles(assigned_driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_mot_expiry ON public.vehicles(mot_expiry);
CREATE INDEX IF NOT EXISTS idx_vehicles_insurance_expiry ON public.vehicles(insurance_expiry);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vehicle_compliance_logs_updated_at 
    BEFORE UPDATE ON public.vehicle_compliance_logs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at 
    BEFORE UPDATE ON public.schedules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();