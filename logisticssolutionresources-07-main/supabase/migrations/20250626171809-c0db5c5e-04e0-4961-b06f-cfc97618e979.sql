
-- Fix critical RLS policy gaps and implement comprehensive security policies

-- First, let's fix the profiles table policies to prevent infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create a more secure function to check user roles without recursion
CREATE OR REPLACE FUNCTION public.check_user_role(user_id UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = user_id LIMIT 1;
    RETURN COALESCE(user_role, 'parent') = required_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create admin check function
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.check_user_role(user_id, 'admin') OR public.check_user_role(user_id, 'council');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Fix profiles table policies
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (public.is_admin(auth.uid()));

-- Add missing RLS policies for critical tables

-- Fix vehicles table - add proper organization isolation
DROP POLICY IF EXISTS "Admins and council can manage vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Drivers can view vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Parents can view active vehicles" ON public.vehicles;

CREATE POLICY "Organization members can view vehicles" ON public.vehicles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_organizations uo 
            WHERE uo.user_id = auth.uid() 
            AND uo.organization_id = vehicles.organization_id
            AND uo.is_active = true
        )
    );

CREATE POLICY "Admins can manage organization vehicles" ON public.vehicles
    FOR ALL USING (
        public.is_admin(auth.uid()) AND
        EXISTS (
            SELECT 1 FROM public.user_organizations uo 
            WHERE uo.user_id = auth.uid() 
            AND uo.organization_id = vehicles.organization_id
            AND uo.is_active = true
        )
    );

-- Fix driver_assignments table
ALTER TABLE public.driver_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view their assignments" ON public.driver_assignments
    FOR SELECT USING (driver_id = auth.uid());

CREATE POLICY "Admins can manage driver assignments" ON public.driver_assignments
    FOR ALL USING (public.is_admin(auth.uid()));

-- Fix vehicle_checks table
ALTER TABLE public.vehicle_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can manage their vehicle checks" ON public.vehicle_checks
    FOR ALL USING (driver_id = auth.uid());

CREATE POLICY "Admins can view all vehicle checks" ON public.vehicle_checks
    FOR SELECT USING (public.is_admin(auth.uid()));

-- Fix routes table
DROP POLICY IF EXISTS "Admins and council can manage routes" ON public.routes;
DROP POLICY IF EXISTS "Everyone can view active routes" ON public.routes;

CREATE POLICY "Organization members can view routes" ON public.routes
    FOR SELECT USING (
        is_active = true AND
        EXISTS (
            SELECT 1 FROM public.user_organizations uo 
            WHERE uo.user_id = auth.uid() 
            AND uo.organization_id = routes.organization_id
            AND uo.is_active = true
        )
    );

CREATE POLICY "Admins can manage organization routes" ON public.routes
    FOR ALL USING (
        public.is_admin(auth.uid()) AND
        EXISTS (
            SELECT 1 FROM public.user_organizations uo 
            WHERE uo.user_id = auth.uid() 
            AND uo.organization_id = routes.organization_id
            AND uo.is_active = true
        )
    );

-- Fix jobs table
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view jobs" ON public.jobs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_organizations uo 
            WHERE uo.user_id = auth.uid() 
            AND uo.organization_id = jobs.organization_id
            AND uo.is_active = true
        )
    );

CREATE POLICY "Drivers can view assigned jobs" ON public.jobs
    FOR SELECT USING (driver_id = auth.uid());

CREATE POLICY "Admins can manage organization jobs" ON public.jobs
    FOR ALL USING (
        public.is_admin(auth.uid()) AND
        EXISTS (
            SELECT 1 FROM public.user_organizations uo 
            WHERE uo.user_id = auth.uid() 
            AND uo.organization_id = jobs.organization_id
            AND uo.is_active = true
        )
    );

-- Fix documents table
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their documents" ON public.documents
    FOR SELECT USING (uploaded_by = auth.uid());

CREATE POLICY "Users can upload documents" ON public.documents
    FOR INSERT WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Admins can view organization documents" ON public.documents
    FOR SELECT USING (
        public.is_admin(auth.uid()) AND
        EXISTS (
            SELECT 1 FROM public.user_organizations uo 
            WHERE uo.user_id = auth.uid() 
            AND uo.organization_id = documents.organization_id
            AND uo.is_active = true
        )
    );

-- Fix time_entries table
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can manage their time entries" ON public.time_entries
    FOR ALL USING (driver_id = auth.uid());

CREATE POLICY "Admins can view organization time entries" ON public.time_entries
    FOR SELECT USING (
        public.is_admin(auth.uid()) AND
        EXISTS (
            SELECT 1 FROM public.user_organizations uo 
            WHERE uo.user_id = auth.uid() 
            AND uo.organization_id = time_entries.organization_id
            AND uo.is_active = true
        )
    );

-- Add audit logging table for security events
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    event_type TEXT NOT NULL,
    event_details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" ON public.security_audit_logs
    FOR SELECT USING (public.is_admin(auth.uid()));

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
    p_user_id UUID,
    p_event_type TEXT,
    p_event_details JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.security_audit_logs (user_id, event_type, event_details, ip_address, user_agent)
    VALUES (p_user_id, p_event_type, p_event_details, p_ip_address, p_user_agent);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_new_user function to be more secure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    is_main_admin BOOLEAN := FALSE;
    user_role TEXT := 'parent';
BEGIN
    -- Only allow specific admin emails for admin role
    IF NEW.email = 'transport@transentrix.com' OR 
       NEW.email = 'transport@logisticssolutionresources.com' OR 
       NEW.email = 'admin@logisticssolutionresources.com' THEN
        is_main_admin := TRUE;
        user_role := 'admin';
    ELSE
        -- Default role from metadata or parent
        user_role := COALESCE((NEW.raw_user_meta_data->>'role'), 'parent');
    END IF;
    
    -- Insert profile with appropriate defaults
    INSERT INTO public.profiles (
        id,
        email,
        first_name,
        last_name,
        role,
        employment_status,
        onboarding_status,
        is_active
    ) VALUES (
        NEW.id,
        NEW.email,
        CASE 
            WHEN is_main_admin THEN 'Transport'
            ELSE COALESCE(NEW.raw_user_meta_data->>'first_name', '')
        END,
        CASE 
            WHEN is_main_admin THEN 'Admin'
            ELSE COALESCE(NEW.raw_user_meta_data->>'last_name', '')
        END,
        user_role::user_role,
        CASE 
            WHEN is_main_admin THEN 'active'
            ELSE 'applicant'
        END,
        CASE 
            WHEN is_main_admin THEN 'completed'
            ELSE 'pending'
        END,
        true
    );
    
    -- Log the user creation event
    PERFORM public.log_security_event(
        NEW.id,
        'user_created',
        jsonb_build_object('email', NEW.email, 'role', user_role),
        NULL,
        NULL
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
