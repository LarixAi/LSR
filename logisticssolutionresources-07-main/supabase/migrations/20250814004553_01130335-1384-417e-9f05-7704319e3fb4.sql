-- Fix duplicate foreign key constraints and schema issues

-- First, drop the duplicate foreign key constraint
ALTER TABLE public.driver_licenses 
DROP CONSTRAINT IF EXISTS driver_licenses_license_category_id_fkey;

-- Ensure we only have the clean named constraint
-- (Keep fk_driver_licenses_category as it's more descriptive)

-- Add missing columns to vehicles table
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS requires_maintenance BOOLEAN DEFAULT false;

-- Fix license_categories RLS policy to properly allow organization access
DROP POLICY IF EXISTS "license_categories_org_access" ON public.license_categories;

CREATE POLICY "license_categories_global_read" ON public.license_categories
FOR SELECT USING (true); -- License categories are global reference data

CREATE POLICY "license_categories_admin_manage" ON public.license_categories  
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'council')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'council')
  )
);

-- Ensure driver_licenses has proper organization_id for existing records
UPDATE public.driver_licenses 
SET organization_id = (
  SELECT p.organization_id 
  FROM public.profiles p 
  WHERE p.id = driver_licenses.driver_id
)
WHERE organization_id IS NULL;

-- Create improved indexes
DROP INDEX IF EXISTS idx_driver_licenses_organization_id;
CREATE INDEX IF NOT EXISTS idx_driver_licenses_organization_id ON public.driver_licenses(organization_id);
CREATE INDEX IF NOT EXISTS idx_driver_licenses_driver_id ON public.driver_licenses(driver_id);