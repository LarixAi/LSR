-- Secure the organizations table to prevent public access to company information
-- This fixes the security vulnerability where competitors could access company data

-- Enable RLS on organizations table if not already enabled
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Drop all unsafe policies that allow public access to organizations
DROP POLICY IF EXISTS "organizations_select_safe" ON public.organizations;
DROP POLICY IF EXISTS "organizations_update_safe" ON public.organizations;
DROP POLICY IF EXISTS "organizations_insert_safe" ON public.organizations;

-- Drop duplicate policies to clean up
DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;
DROP POLICY IF EXISTS "Org members can view their organization" ON public.organizations;
DROP POLICY IF EXISTS "organizations_own_access" ON public.organizations;
DROP POLICY IF EXISTS "organizations_select_own" ON public.organizations;

-- Create secure RLS policies for organizations table

-- Policy 1: Users can only view their own organization
CREATE POLICY "organizations_member_select" 
ON public.organizations 
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT profiles.organization_id 
    FROM public.profiles 
    WHERE profiles.id = auth.uid()
  )
);

-- Policy 2: Admins can manage their own organization
CREATE POLICY "organizations_admin_manage" 
ON public.organizations 
FOR ALL
TO authenticated
USING (
  id IN (
    SELECT profiles.organization_id 
    FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  id IN (
    SELECT profiles.organization_id 
    FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- Policy 3: Super admins can create new organizations
CREATE POLICY "organizations_super_admin_create" 
ON public.organizations 
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  )
);

-- Policy 4: Service role access for system operations
CREATE POLICY "organizations_service_role_access" 
ON public.organizations 
FOR ALL
TO service_role
USING (true);

-- Clean up the existing admin policy if it uses public role instead of authenticated
DROP POLICY IF EXISTS "Admins can manage organizations" ON public.organizations;

-- Recreate admin policy with proper role restriction
CREATE POLICY "organizations_system_admin_manage" 
ON public.organizations 
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('super_admin')
  )
);

-- Create index for performance on organization lookups if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_organizations_active ON public.organizations (is_active);

-- Log the security fix
INSERT INTO public.audit_logs (action, table_name, user_id, organization_id, new_values)
VALUES (
  'SECURITY_FIX', 
  'organizations', 
  auth.uid(),
  (SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1),
  '{"description": "Implemented RLS policies to secure organization data from public access", "vulnerability": "PUBLIC_ORGANIZATION_DATA"}'::jsonb
);