-- Fix driver creation issues by creating missing tables and updating RLS policies

-- Create memberships table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.memberships (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    organization_id uuid NOT NULL,
    role text NOT NULL CHECK (role IN ('admin', 'driver', 'mechanic', 'parent', 'council', 'compliance_officer')),
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, organization_id)
);

-- Enable RLS on memberships
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- Create memberships policies
DROP POLICY IF EXISTS "Users can view memberships in their org" ON public.memberships;
CREATE POLICY "Users can view memberships in their org"
ON public.memberships FOR SELECT
USING (organization_id = get_current_user_organization_id_safe());

DROP POLICY IF EXISTS "Admins can manage memberships in their org" ON public.memberships;
CREATE POLICY "Admins can manage memberships in their org"
ON public.memberships FOR ALL
USING (
  is_current_user_admin_safe() AND 
  organization_id = get_current_user_organization_id_safe()
)
WITH CHECK (
  is_current_user_admin_safe() AND 
  organization_id = get_current_user_organization_id_safe()
);

-- Create security_audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    user_id uuid REFERENCES auth.users(id),
    actor_id uuid REFERENCES auth.users(id),
    target_user_id uuid REFERENCES auth.users(id),
    event_type text NOT NULL,
    event_description text,
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on security_audit_logs
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create security audit logs policies
DROP POLICY IF EXISTS "Admins can view security logs in their org" ON public.security_audit_logs;
CREATE POLICY "Admins can view security logs in their org"
ON public.security_audit_logs FOR SELECT
USING (
  is_current_user_admin_safe() AND 
  organization_id = get_current_user_organization_id_safe()
);

DROP POLICY IF EXISTS "System can insert security logs" ON public.security_audit_logs;
CREATE POLICY "System can insert security logs"
ON public.security_audit_logs FOR INSERT
WITH CHECK (true); -- Allow system inserts from edge functions

-- Create password_resets table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.password_resets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    target_user_id uuid REFERENCES auth.users(id) NOT NULL,
    reset_by uuid REFERENCES auth.users(id) NOT NULL,
    reset_type text NOT NULL,
    temporary_password text,
    expires_at timestamp with time zone,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'expired')),
    notes text,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on password_resets
ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;

-- Create password resets policies
DROP POLICY IF EXISTS "Admins can manage password resets in their org" ON public.password_resets;
CREATE POLICY "Admins can manage password resets in their org"
ON public.password_resets FOR ALL
USING (
  is_current_user_admin_safe() AND 
  organization_id = get_current_user_organization_id_safe()
)
WITH CHECK (
  is_current_user_admin_safe() AND 
  organization_id = get_current_user_organization_id_safe()
);

-- Add default_organization_id to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'default_organization_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN default_organization_id uuid;
    -- Set default_organization_id to match organization_id for existing records
    UPDATE public.profiles SET default_organization_id = organization_id WHERE default_organization_id IS NULL;
  END IF;
END $$;

-- Create updated triggers for all new tables
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers if they don't exist
DO $$ 
BEGIN
  -- Memberships trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_memberships_updated_at') THEN
    CREATE TRIGGER update_memberships_updated_at
    BEFORE UPDATE ON public.memberships
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;