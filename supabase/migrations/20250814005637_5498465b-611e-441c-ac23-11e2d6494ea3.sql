-- Fix license_categories security issue by restricting access to authenticated org members

-- Drop the overly permissive global read policy
DROP POLICY IF EXISTS "license_categories_global_read" ON public.license_categories;

-- Create proper org-based access policy for license categories
CREATE POLICY "license_categories_org_members_read" ON public.license_categories
FOR SELECT 
TO authenticated
USING (
  -- Allow authenticated users who are members of any organization to read license categories
  -- License categories are reference data needed by all org members
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND organization_id IS NOT NULL
    AND is_active = true
  )
);

-- Keep admin management policy for create/update/delete operations
-- The existing "license_categories_admin_manage" policy should handle admin operations

-- Update the existing admin policy to be more specific
DROP POLICY IF EXISTS "license_categories_admin_manage" ON public.license_categories;

CREATE POLICY "license_categories_admin_create_update_delete" ON public.license_categories  
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'council')
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'council')
    AND is_active = true
  )
);