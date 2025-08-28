-- Phase 1: Core Security Infrastructure (Fixed)
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
    UNIQUE(user_id, organization_id, role)
);

-- Create indexes for performance
CREATE INDEX idx_memberships_user_org ON public.memberships(user_id, organization_id);
CREATE INDEX idx_memberships_org_role ON public.memberships(organization_id, role);

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