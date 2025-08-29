-- Create audit logs table for tracking all changes to driver records
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL, -- INSERT, UPDATE, DELETE, ARCHIVE
  old_values JSONB,
  new_values JSONB,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  organization_id UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create support tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other', -- it_support, bug, feature_request, access_issue, other
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
  status TEXT NOT NULL DEFAULT 'open', -- open, in_progress, waiting, resolved, rejected
  created_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  organization_id UUID NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ticket comments table
CREATE TABLE IF NOT EXISTS public.ticket_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  is_internal BOOLEAN NOT NULL DEFAULT false,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user permissions table for granular access control
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL,
  permission_type TEXT NOT NULL, -- module name like 'jobs', 'vehicle_checks', 'reports', etc.
  can_view BOOLEAN NOT NULL DEFAULT false,
  can_create BOOLEAN NOT NULL DEFAULT false,
  can_edit BOOLEAN NOT NULL DEFAULT false,
  can_delete BOOLEAN NOT NULL DEFAULT false,
  granted_by UUID NOT NULL REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, organization_id, permission_type)
);

-- Add archived status and audit fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS archived_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS archive_reason TEXT,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS consent_given BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS consent_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS data_retention_until DATE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON public.audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON public.audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_at ON public.audit_logs(changed_at);
CREATE INDEX IF NOT EXISTS idx_support_tickets_organization_id ON public.support_tickets(organization_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_by ON public.support_tickets(created_by);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON public.ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON public.user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_organization_id ON public.user_permissions(organization_id);

-- Enable RLS on new tables
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_logs
CREATE POLICY "Users can view audit logs in their organization" ON public.audit_logs
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage audit logs in their organization" ON public.audit_logs
  FOR ALL USING ((organization_id = get_user_organization_id()) AND is_organization_admin());

-- RLS Policies for support_tickets
CREATE POLICY "Users can view their own tickets" ON public.support_tickets
  FOR SELECT USING ((created_by = auth.uid()) OR (assigned_to = auth.uid()) OR is_organization_admin());

CREATE POLICY "Users can create tickets in their organization" ON public.support_tickets
  FOR INSERT WITH CHECK ((organization_id = get_user_organization_id()) AND (created_by = auth.uid()));

CREATE POLICY "Admins can manage all tickets in their organization" ON public.support_tickets
  FOR ALL USING ((organization_id = get_user_organization_id()) AND is_organization_admin());

CREATE POLICY "Assigned users can update their tickets" ON public.support_tickets
  FOR UPDATE USING ((assigned_to = auth.uid()) OR (created_by = auth.uid()) OR is_organization_admin());

-- RLS Policies for ticket_comments
CREATE POLICY "Users can view comments on their tickets" ON public.ticket_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets st 
      WHERE st.id = ticket_comments.ticket_id 
      AND ((st.created_by = auth.uid()) OR (st.assigned_to = auth.uid()) OR is_organization_admin())
    )
  );

CREATE POLICY "Users can create comments on accessible tickets" ON public.ticket_comments
  FOR INSERT WITH CHECK (
    (created_by = auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.support_tickets st 
      WHERE st.id = ticket_comments.ticket_id 
      AND ((st.created_by = auth.uid()) OR (st.assigned_to = auth.uid()) OR is_organization_admin())
    )
  );

-- RLS Policies for user_permissions
CREATE POLICY "Users can view their own permissions" ON public.user_permissions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage permissions in their organization" ON public.user_permissions
  FOR ALL USING ((organization_id = get_user_organization_id()) AND is_organization_admin());

-- Create function to generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
  ticket_num TEXT;
BEGIN
  SELECT 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('ticket_number_seq')::TEXT, 4, '0')
  INTO ticket_num;
  RETURN ticket_num;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for ticket numbers
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START 1;

-- Create function to log audit trail
CREATE OR REPLACE FUNCTION log_audit_trail(
  p_table_name TEXT,
  p_record_id UUID,
  p_action TEXT,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  audit_id UUID;
  user_org_id UUID;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO user_org_id
  FROM profiles WHERE id = auth.uid();
  
  INSERT INTO public.audit_logs (
    table_name,
    record_id,
    action,
    old_values,
    new_values,
    changed_by,
    organization_id,
    notes
  ) VALUES (
    p_table_name,
    p_record_id,
    p_action,
    p_old_values,
    p_new_values,
    auth.uid(),
    user_org_id,
    p_notes
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function for automatic audit logging on profiles
CREATE OR REPLACE FUNCTION audit_profiles_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_audit_trail('profiles', NEW.id, 'INSERT', NULL, to_jsonb(NEW), 'Profile created');
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM log_audit_trail('profiles', NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), 'Profile updated');
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_audit_trail('profiles', OLD.id, 'DELETE', to_jsonb(OLD), NULL, 'Profile deleted');
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profiles audit
DROP TRIGGER IF EXISTS profiles_audit_trigger ON public.profiles;
CREATE TRIGGER profiles_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION audit_profiles_changes();

-- Create function to archive driver (soft delete)
CREATE OR REPLACE FUNCTION archive_driver(
  p_driver_id UUID,
  p_reason TEXT DEFAULT 'Removed from company'
) RETURNS BOOLEAN AS $$
DECLARE
  user_org_id UUID;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO user_org_id
  FROM profiles WHERE id = auth.uid();
  
  -- Verify the driver belongs to the same organization
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = p_driver_id 
    AND organization_id = user_org_id
    AND role = 'driver'
  ) THEN
    RAISE EXCEPTION 'Driver not found in your organization';
  END IF;
  
  -- Archive the driver
  UPDATE public.profiles 
  SET 
    is_archived = true,
    archived_at = now(),
    archived_by = auth.uid(),
    archive_reason = p_reason,
    is_active = false,
    employment_status = 'terminated'
  WHERE id = p_driver_id 
  AND organization_id = user_org_id;
  
  -- Log the archive action
  PERFORM log_audit_trail('profiles', p_driver_id, 'ARCHIVE', NULL, NULL, p_reason);
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to update ticket updated_at
CREATE OR REPLACE FUNCTION update_ticket_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_ticket_updated_at();