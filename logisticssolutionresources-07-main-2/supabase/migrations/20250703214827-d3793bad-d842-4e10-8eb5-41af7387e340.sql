-- Enhanced admin access function for RLS policies
CREATE OR REPLACE FUNCTION public.is_admin_user(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
    IF user_uuid IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN (
        SELECT COALESCE(role = 'admin', FALSE)
        FROM public.profiles 
        WHERE id = user_uuid 
        LIMIT 1
    );
END;
$$;

-- Enhanced admin or council check
CREATE OR REPLACE FUNCTION public.has_admin_privileges(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
    IF user_uuid IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN (
        SELECT COALESCE(role IN ('admin', 'council'), FALSE)
        FROM public.profiles 
        WHERE id = user_uuid 
        LIMIT 1
    );
END;
$$;

-- Update existing admin policies to use new functions
-- Vehicles table
DROP POLICY IF EXISTS "Admins can manage all vehicles" ON public.vehicles;
CREATE POLICY "Admins can manage all vehicles" 
ON public.vehicles 
FOR ALL 
TO authenticated 
USING (public.is_admin_user());

-- Documents table  
DROP POLICY IF EXISTS "Admins can manage all documents" ON public.documents;
CREATE POLICY "Admins can manage all documents"
ON public.documents
FOR ALL
TO authenticated
USING (public.is_admin_user());

-- Jobs table
DROP POLICY IF EXISTS "Admins can manage all jobs" ON public.jobs;
CREATE POLICY "Admins can manage all jobs"
ON public.jobs
FOR ALL  
TO authenticated
USING (public.is_admin_user());

-- Routes table
DROP POLICY IF EXISTS "Admins can manage all routes" ON public.routes;
CREATE POLICY "Admins can manage all routes"
ON public.routes
FOR ALL
TO authenticated
USING (public.is_admin_user());

-- Profiles table - admins can view/manage all profiles
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (public.is_admin_user());

-- Organizations table
DROP POLICY IF EXISTS "Admins can manage all organizations" ON public.organizations;
CREATE POLICY "Admins can manage all organizations"
ON public.organizations
FOR ALL
TO authenticated
USING (public.is_admin_user());

-- Vehicle checks table
DROP POLICY IF EXISTS "Admins can manage all vehicle checks" ON public.vehicle_checks;
CREATE POLICY "Admins can manage all vehicle checks"
ON public.vehicle_checks
FOR ALL
TO authenticated
USING (public.is_admin_user());

-- Time entries table
DROP POLICY IF EXISTS "Admins can manage all time entries" ON public.time_entries;
CREATE POLICY "Admins can manage all time entries"
ON public.time_entries
FOR ALL
TO authenticated
USING (public.is_admin_user());

-- Incidents table
DROP POLICY IF EXISTS "Admins can manage all incidents" ON public.incidents;
CREATE POLICY "Admins can manage all incidents"
ON public.incidents
FOR ALL
TO authenticated
USING (public.is_admin_user());

-- Inventory tables
DROP POLICY IF EXISTS "Admins can manage all inventory items" ON public.inventory_items;
CREATE POLICY "Admins can manage all inventory items"
ON public.inventory_items
FOR ALL
TO authenticated
USING (public.is_admin_user());

DROP POLICY IF EXISTS "Admins can manage all inventory transactions" ON public.inventory_transactions;
CREATE POLICY "Admins can manage all inventory transactions"
ON public.inventory_transactions
FOR ALL
TO authenticated
USING (public.is_admin_user());

-- Notifications table
DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;
CREATE POLICY "Admins can manage all notifications"
ON public.notifications
FOR ALL
TO authenticated
USING (public.is_admin_user());

-- Driver assignments
DROP POLICY IF EXISTS "Admins can manage all driver assignments" ON public.driver_assignments;
CREATE POLICY "Admins can manage all driver assignments"
ON public.driver_assignments
FOR ALL
TO authenticated
USING (public.is_admin_user());

-- Support tickets
DROP POLICY IF EXISTS "Admins can manage all support tickets" ON public.support_tickets;
CREATE POLICY "Admins can manage all support tickets"
ON public.support_tickets
FOR ALL
TO authenticated
USING (public.is_admin_user());

-- User permissions
DROP POLICY IF EXISTS "Admins can manage all user permissions" ON public.user_permissions;
CREATE POLICY "Admins can manage all user permissions"
ON public.user_permissions
FOR ALL
TO authenticated
USING (public.is_admin_user());

-- Audit logs - admins can view all audit logs
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs
FOR ALL
TO authenticated
USING (public.is_admin_user());