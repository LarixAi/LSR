-- Secure the jobs and routes tables by removing unsafe public policies
-- This fixes the vulnerability where business operations data was publicly accessible

-- === JOBS TABLE SECURITY FIX ===
-- Enable RLS on jobs table (should already be enabled but let's ensure)
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Drop all unsafe policies that allow unrestricted public access
DROP POLICY IF EXISTS "jobs_select_safe" ON public.jobs;
DROP POLICY IF EXISTS "jobs_insert_safe" ON public.jobs;
DROP POLICY IF EXISTS "jobs_update_safe" ON public.jobs;

-- Drop duplicate organization policies to clean up
DROP POLICY IF EXISTS "Users can access organization jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can manage jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can manage org jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can view org jobs" ON public.jobs;
DROP POLICY IF EXISTS "jobs_auto_org_access" ON public.jobs;

-- Create secure RLS policies for jobs table
-- Policy 1: Organization members can view jobs in their organization
CREATE POLICY "jobs_org_members_select" 
ON public.jobs 
FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT profiles.organization_id 
    FROM public.profiles 
    WHERE profiles.id = auth.uid()
  )
);

-- Policy 2: Admins can manage jobs in their organization
CREATE POLICY "jobs_org_admins_manage" 
ON public.jobs 
FOR ALL
TO authenticated
USING (
  organization_id IN (
    SELECT profiles.organization_id 
    FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'council', 'super_admin')
  )
)
WITH CHECK (
  organization_id IN (
    SELECT profiles.organization_id 
    FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'council', 'super_admin')
  )
);

-- Policy 3: Users can view and update jobs assigned to them
CREATE POLICY "jobs_assigned_user_access" 
ON public.jobs 
FOR ALL
TO authenticated
USING (
  assigned_to = auth.uid() OR 
  organization_id IN (
    SELECT profiles.organization_id 
    FROM public.profiles 
    WHERE profiles.id = auth.uid()
  )
);

-- Policy 4: Service role access for system operations
CREATE POLICY "jobs_service_role_access" 
ON public.jobs 
FOR ALL
TO service_role
USING (true);

-- === ROUTES TABLE SECURITY FIX ===
-- Enable RLS on routes table (should already be enabled but let's ensure)
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- Drop all unsafe policies that allow unrestricted public access
DROP POLICY IF EXISTS "routes_select_safe" ON public.routes;
DROP POLICY IF EXISTS "routes_insert_safe" ON public.routes;
DROP POLICY IF EXISTS "routes_update_safe" ON public.routes;

-- Drop duplicate organization policies to clean up
DROP POLICY IF EXISTS "Admins can manage org routes" ON public.routes;
DROP POLICY IF EXISTS "Users can view org routes" ON public.routes;
DROP POLICY IF EXISTS "Users can view their organization's routes" ON public.routes;
DROP POLICY IF EXISTS "routes_auto_org_access" ON public.routes;

-- Create secure RLS policies for routes table
-- Policy 1: Organization members can view routes in their organization
CREATE POLICY "routes_org_members_select" 
ON public.routes 
FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT profiles.organization_id 
    FROM public.profiles 
    WHERE profiles.id = auth.uid()
  )
);

-- Policy 2: Admins can manage routes in their organization
CREATE POLICY "routes_org_admins_manage" 
ON public.routes 
FOR ALL
TO authenticated
USING (
  organization_id IN (
    SELECT profiles.organization_id 
    FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'council', 'super_admin')
  )
)
WITH CHECK (
  organization_id IN (
    SELECT profiles.organization_id 
    FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'council', 'super_admin')
  )
);

-- Policy 3: Service role access for system operations
CREATE POLICY "routes_service_role_access" 
ON public.routes 
FOR ALL
TO service_role
USING (true);

-- Create indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_jobs_organization_id ON public.jobs (organization_id);
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_to ON public.jobs (assigned_to);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs (status);
CREATE INDEX IF NOT EXISTS idx_routes_organization_id ON public.routes (organization_id);
CREATE INDEX IF NOT EXISTS idx_routes_status ON public.routes (status);

-- Log the security fix
INSERT INTO public.audit_logs (action, table_name, user_id, organization_id, new_values)
VALUES (
  'SECURITY_FIX', 
  'jobs_and_routes', 
  auth.uid(),
  (SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1),
  '{"description": "Secured jobs and routes tables by removing unsafe public policies and implementing organization-based access control", "vulnerability": "PUBLIC_BUSINESS_OPERATIONS_DATA", "tables": ["jobs", "routes"]}'::jsonb
);