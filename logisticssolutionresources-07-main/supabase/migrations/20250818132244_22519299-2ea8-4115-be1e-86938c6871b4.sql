-- Phase 1: Core Security Infrastructure
-- Create memberships table for proper multi-tenant role management
CREATE TABLE public.memberships (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'driver', 'mechanic', 'parent', 'council', 'compliance_officer', 'super_admin')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Ensure unique user-organization-role combination
    UNIQUE(user_id, organization_id, role),
    -- Index for performance
    INDEX (user_id, organization_id),
    INDEX (organization_id, role)
);

-- Enable RLS on memberships
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- Create default_organization_id column in profiles for UX
ALTER TABLE public.profiles ADD COLUMN default_organization_id UUID REFERENCES public.organizations(id);

-- Create password management tracking
CREATE TABLE public.password_resets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES auth.users(id),
    reset_type TEXT NOT NULL DEFAULT 'admin_reset' CHECK (reset_type IN ('admin_reset', 'bulk_reset', 'force_change', 'self_reset')),
    temporary_password TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    used_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'expired', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;

-- Create audit log table for security events
CREATE TABLE public.security_audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    user_id UUID REFERENCES auth.users(id),
    actor_id UUID REFERENCES auth.users(id),
    event_type TEXT NOT NULL,
    event_description TEXT,
    target_user_id UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Migrate existing profiles to memberships
INSERT INTO public.memberships (user_id, organization_id, role, status, joined_at, created_at, updated_at)
SELECT 
    id as user_id,
    organization_id,
    role::TEXT,
    CASE 
        WHEN is_active THEN 'active'
        ELSE 'inactive'
    END as status,
    created_at as joined_at,
    created_at,
    updated_at
FROM public.profiles 
WHERE organization_id IS NOT NULL;

-- Set default organization for existing users
UPDATE public.profiles 
SET default_organization_id = organization_id 
WHERE organization_id IS NOT NULL;

-- Update security definer functions for membership-based access
CREATE OR REPLACE FUNCTION public.get_user_organizations()
RETURNS SETOF UUID
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT organization_id 
    FROM public.memberships 
    WHERE user_id = auth.uid() 
    AND status = 'active';
$$;

CREATE OR REPLACE FUNCTION public.get_user_roles_in_organization(org_id UUID)
RETURNS SETOF TEXT
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role 
    FROM public.memberships 
    WHERE user_id = auth.uid() 
    AND organization_id = org_id 
    AND status = 'active';
$$;

CREATE OR REPLACE FUNCTION public.has_role_in_organization(org_id UUID, required_role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.memberships 
        WHERE user_id = auth.uid() 
        AND organization_id = org_id 
        AND role = required_role 
        AND status = 'active'
    );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_in_any_organization()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.memberships 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'super_admin', 'council') 
        AND status = 'active'
    );
$$;

-- Create RLS policies for memberships
CREATE POLICY "Users can view their own memberships" 
ON public.memberships FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage organization memberships" 
ON public.memberships FOR ALL 
USING (
    has_role_in_organization(organization_id, 'admin') OR 
    has_role_in_organization(organization_id, 'super_admin')
);

-- Update password_resets policies
CREATE POLICY "Admins can manage password resets in their organization" 
ON public.password_resets FOR ALL 
USING (has_role_in_organization(organization_id, 'admin') OR has_role_in_organization(organization_id, 'super_admin'));

CREATE POLICY "Users can view their own password resets" 
ON public.password_resets FOR SELECT 
USING (user_id = auth.uid());

-- Update security audit logs policies
CREATE POLICY "Admins can view organization audit logs" 
ON public.security_audit_logs FOR SELECT 
USING (has_role_in_organization(organization_id, 'admin') OR has_role_in_organization(organization_id, 'super_admin'));

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON public.memberships
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_password_resets_updated_at BEFORE UPDATE ON public.password_resets
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();