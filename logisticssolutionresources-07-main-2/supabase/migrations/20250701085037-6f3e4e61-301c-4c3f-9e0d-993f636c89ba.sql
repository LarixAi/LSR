
-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Drivers can view their own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Drivers can insert their own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Admins can view all time entries in their organization" ON public.time_entries;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can create notifications in their organization" ON public.notifications;
DROP POLICY IF EXISTS "Users can view vehicle checks in their organization" ON public.vehicle_checks;
DROP POLICY IF EXISTS "Drivers and mechanics can create vehicle checks" ON public.vehicle_checks;
DROP POLICY IF EXISTS "Users can view incidents in their organization" ON public.incidents;
DROP POLICY IF EXISTS "Users can create incidents in their organization" ON public.incidents;

-- Create organizations table for multi-tenant support
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  subscription_status TEXT DEFAULT 'active',
  max_users INTEGER DEFAULT 100,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT
);

-- Add organization_id to profiles table if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='organization_id') THEN
        ALTER TABLE public.profiles ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create index for performance if not exists
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON public.profiles(organization_id);

-- Add organization_id to all relevant tables
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vehicles' AND column_name='organization_id_new') THEN
        ALTER TABLE public.vehicles ADD COLUMN organization_id_new UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='jobs' AND column_name='organization_id') THEN
        ALTER TABLE public.jobs ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='routes' AND column_name='organization_id') THEN
        ALTER TABLE public.routes ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='incidents' AND column_name='organization_id') THEN
        ALTER TABLE public.incidents ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='time_entries' AND column_name='organization_id') THEN
        ALTER TABLE public.time_entries ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='time_off_requests' AND column_name='organization_id') THEN
        ALTER TABLE public.time_off_requests ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vehicle_checks' AND column_name='organization_id') THEN
        ALTER TABLE public.vehicle_checks ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='compliance_violations' AND column_name='organization_id') THEN
        ALTER TABLE public.compliance_violations ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='organization_id') THEN
        ALTER TABLE public.notifications ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='organization_id') THEN
        ALTER TABLE public.documents ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='driver_assignments' AND column_name='organization_id') THEN
        ALTER TABLE public.driver_assignments ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='driver_licenses' AND column_name='organization_id') THEN
        ALTER TABLE public.driver_licenses ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create security definer function to get user's organization
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id 
  FROM public.profiles 
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- Create function to check if user is admin of their organization
CREATE OR REPLACE FUNCTION public.is_organization_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
    AND organization_id IS NOT NULL
  );
$$;

-- Enable RLS on organizations table
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- RLS policy for organizations - users can only see their own organization
DROP POLICY IF EXISTS "Users can view their own organization" ON public.organizations;
CREATE POLICY "Users can view their own organization"
ON public.organizations
FOR SELECT
USING (id = public.get_user_organization_id());

-- RLS policy for organizations - only admins can update their organization
DROP POLICY IF EXISTS "Admins can update their organization" ON public.organizations;
CREATE POLICY "Admins can update their organization"
ON public.organizations
FOR UPDATE
USING (id = public.get_user_organization_id() AND public.is_organization_admin());

-- Update existing RLS policies to include organization_id checks
-- Profiles table
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles in their organization" ON public.profiles;

CREATE POLICY "Users can view profiles in their organization"
ON public.profiles
FOR SELECT
USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Admins can update profiles in their organization"
ON public.profiles
FOR UPDATE
USING (organization_id = public.get_user_organization_id() AND public.is_organization_admin());

-- Vehicles table policies
DROP POLICY IF EXISTS "Users can view vehicles in their organization" ON public.vehicles;
DROP POLICY IF EXISTS "Admins can manage vehicles in their organization" ON public.vehicles;

CREATE POLICY "Users can view vehicles in their organization"
ON public.vehicles
FOR SELECT
USING (organization_id_new = public.get_user_organization_id());

CREATE POLICY "Admins can manage vehicles in their organization"
ON public.vehicles
FOR ALL
USING (organization_id_new = public.get_user_organization_id() AND public.is_organization_admin());

-- Jobs table policies
DROP POLICY IF EXISTS "Users can view jobs in their organization" ON public.jobs;
DROP POLICY IF EXISTS "Drivers can view their assigned jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can manage jobs in their organization" ON public.jobs;

CREATE POLICY "Users can view jobs in their organization"
ON public.jobs
FOR SELECT
USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Drivers can view their assigned jobs"
ON public.jobs
FOR SELECT
USING (assigned_driver_id = auth.uid() AND organization_id = public.get_user_organization_id());

CREATE POLICY "Admins can manage jobs in their organization"
ON public.jobs
FOR ALL
USING (organization_id = public.get_user_organization_id() AND public.is_organization_admin());

-- Routes table policies
DROP POLICY IF EXISTS "Users can view routes in their organization" ON public.routes;
DROP POLICY IF EXISTS "Admins can manage routes in their organization" ON public.routes;

CREATE POLICY "Users can view routes in their organization"
ON public.routes
FOR SELECT
USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Admins can manage routes in their organization"
ON public.routes
FOR ALL
USING (organization_id = public.get_user_organization_id() AND public.is_organization_admin());

-- Time entries table policies
CREATE POLICY "Drivers can view their own time entries"
ON public.time_entries
FOR SELECT
USING (driver_id = auth.uid() AND organization_id = public.get_user_organization_id());

CREATE POLICY "Drivers can insert their own time entries"
ON public.time_entries
FOR INSERT
WITH CHECK (driver_id = auth.uid() AND organization_id = public.get_user_organization_id());

CREATE POLICY "Admins can view all time entries in their organization"
ON public.time_entries
FOR SELECT
USING (organization_id = public.get_user_organization_id() AND public.is_organization_admin());

-- Notifications table policies
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (user_id = auth.uid() AND organization_id = public.get_user_organization_id());

CREATE POLICY "Admins can create notifications in their organization"
ON public.notifications
FOR INSERT
WITH CHECK (organization_id = public.get_user_organization_id() AND public.is_organization_admin());

-- Vehicle checks table policies
CREATE POLICY "Users can view vehicle checks in their organization"
ON public.vehicle_checks
FOR SELECT
USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Drivers and mechanics can create vehicle checks"
ON public.vehicle_checks
FOR INSERT
WITH CHECK (organization_id = public.get_user_organization_id() AND driver_id = auth.uid());

-- Incidents table policies
CREATE POLICY "Users can view incidents in their organization"
ON public.incidents
FOR SELECT
USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can create incidents in their organization"
ON public.incidents
FOR INSERT
WITH CHECK (organization_id = public.get_user_organization_id() AND reported_by = auth.uid());

-- Update the handle_new_user function to support organization assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_admin_email BOOLEAN := FALSE;
    user_role TEXT := 'parent';
    requires_password_change BOOLEAN := FALSE;
    target_org_id UUID;
BEGIN
    -- Check if this is a pre-approved admin email
    IF NEW.email IN (
        'transport@transentrix.com',
        'transport@logisticssolutionresources.com',
        'admin@logisticssolutionresources.com'
    ) THEN
        is_admin_email := TRUE;
        user_role := 'admin';
        
        -- Create organization for admin users
        INSERT INTO public.organizations (name, slug, contact_email)
        VALUES (
            COALESCE(NEW.raw_user_meta_data->>'company_name', 'Transport Company'),
            LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'company_name', 'transport-company'), ' ', '-')),
            NEW.email
        )
        RETURNING id INTO target_org_id;
    ELSE
        user_role := COALESCE((NEW.raw_user_meta_data->>'role'), 'parent');
        target_org_id := (NEW.raw_user_meta_data->>'organization_id')::UUID;
        
        -- If role is driver and created by admin, require password change
        IF user_role = 'driver' AND (NEW.raw_user_meta_data->>'created_by_admin')::boolean = TRUE THEN
            requires_password_change := TRUE;
        END IF;
    END IF;
    
    -- Insert profile with organization assignment
    INSERT INTO public.profiles (
        id,
        email,
        first_name,
        last_name,
        phone,
        address,
        city,
        state,
        zip_code,
        role,
        employment_status,
        onboarding_status,
        cdl_number,
        medical_card_expiry,
        must_change_password,
        password_changed_at,
        organization_id
    ) VALUES (
        NEW.id,
        NEW.email,
        CASE 
            WHEN is_admin_email THEN 'Transport'
            ELSE COALESCE(NEW.raw_user_meta_data->>'first_name', '')
        END,
        CASE 
            WHEN is_admin_email THEN 'Admin'
            ELSE COALESCE(NEW.raw_user_meta_data->>'last_name', '')
        END,
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'address',
        NEW.raw_user_meta_data->>'city',
        NEW.raw_user_meta_data->>'state',
        NEW.raw_user_meta_data->>'zip_code',
        user_role,
        CASE 
            WHEN is_admin_email THEN 'active'
            ELSE 'applicant'
        END,
        CASE 
            WHEN is_admin_email THEN 'completed'
            ELSE 'pending'
        END,
        NEW.raw_user_meta_data->>'cdl_number',
        CASE 
            WHEN NEW.raw_user_meta_data->>'medical_card_expiry' IS NOT NULL 
            THEN (NEW.raw_user_meta_data->>'medical_card_expiry')::DATE
            ELSE NULL
        END,
        requires_password_change,
        CASE 
            WHEN requires_password_change THEN NULL
            ELSE NOW()
        END,
        target_org_id
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;
