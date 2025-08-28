
-- Fix RLS policies for organizations table to allow creation during signup
DROP POLICY IF EXISTS "Users can view their own organization" ON public.organizations;
DROP POLICY IF EXISTS "Admins can update their organization" ON public.organizations;

-- Allow users to view their own organization
CREATE POLICY "Users can view their own organization"
ON public.organizations
FOR SELECT
USING (id = get_user_organization_id());

-- Allow admins to update their organization
CREATE POLICY "Admins can update their organization"
ON public.organizations
FOR UPDATE
USING (id = get_user_organization_id() AND is_organization_admin());

-- Allow authenticated users to create organizations (needed for signup flow)
CREATE POLICY "Authenticated users can create organizations"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow admins and council to manage organizations
CREATE POLICY "Admins can manage organizations"
ON public.organizations
FOR ALL
USING (is_organization_admin() OR auth.uid() IN (
  SELECT id FROM profiles WHERE role IN ('admin', 'council')
));
