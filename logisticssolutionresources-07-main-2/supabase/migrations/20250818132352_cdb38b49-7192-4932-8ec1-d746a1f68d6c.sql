-- Fix Critical Security Issues from Previous Migration

-- Create security definer functions for membership-based access
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

CREATE OR REPLACE FUNCTION public.get_user_primary_organization()
RETURNS UUID
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT default_organization_id 
    FROM public.profiles 
    WHERE id = auth.uid();
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

-- Create RLS policies for password_resets
CREATE POLICY "Admins can manage password resets in their organization" 
ON public.password_resets FOR ALL 
USING (has_role_in_organization(organization_id, 'admin') OR has_role_in_organization(organization_id, 'super_admin'));

CREATE POLICY "Users can view their own password resets" 
ON public.password_resets FOR SELECT 
USING (user_id = auth.uid());

-- Create RLS policies for security audit logs
CREATE POLICY "Admins can view organization audit logs" 
ON public.security_audit_logs FOR SELECT 
USING (has_role_in_organization(organization_id, 'admin') OR has_role_in_organization(organization_id, 'super_admin'));

-- Create triggers for updated_at
CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON public.memberships
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_password_resets_updated_at BEFORE UPDATE ON public.password_resets
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();