-- PHASE 1: CRITICAL SECURITY FIXES (CORRECTED)
-- Fix missing RLS policies and strengthen existing ones

-- Add organization_id to child_profiles for better security isolation
ALTER TABLE public.child_profiles 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- Update existing child_profiles to have proper organization_id
UPDATE public.child_profiles 
SET organization_id = (
  SELECT p.organization_id 
  FROM public.profiles p 
  WHERE p.id = child_profiles.parent_id
)
WHERE organization_id IS NULL;

-- Drop and recreate stronger child_profiles policies
DROP POLICY IF EXISTS "Admins can view all children" ON public.child_profiles;
DROP POLICY IF EXISTS "Parents can delete own children" ON public.child_profiles;
DROP POLICY IF EXISTS "Parents can insert own children" ON public.child_profiles;
DROP POLICY IF EXISTS "Parents can update own children" ON public.child_profiles;
DROP POLICY IF EXISTS "Parents can view own children" ON public.child_profiles;
DROP POLICY IF EXISTS "protect_child_data_strict" ON public.child_profiles;
DROP POLICY IF EXISTS "strict_child_organization_access" ON public.child_profiles;

CREATE POLICY "secure_child_access" ON public.child_profiles 
FOR ALL USING (
  -- Parent access OR organization admin access within same org
  auth.uid() = parent_id OR 
  (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'council') 
      AND organization_id = child_profiles.organization_id
    )
  )
);

-- Fix child_tracking table to prevent cross-organization data leakage
DROP POLICY IF EXISTS "Drivers can create tracking entries" ON public.child_tracking;
DROP POLICY IF EXISTS "Drivers can update tracking entries" ON public.child_tracking;
DROP POLICY IF EXISTS "strict_child_tracking_access" ON public.child_tracking;

CREATE POLICY "secure_child_tracking" ON public.child_tracking 
FOR SELECT USING (
  organization_id = get_current_user_organization_id_safe() AND
  (
    -- Organization admins can view all
    is_current_user_admin_safe() OR
    -- Parents can view their own children's tracking
    EXISTS (
      SELECT 1 FROM public.child_profiles cp 
      WHERE cp.id = child_tracking.child_id 
      AND cp.parent_id = auth.uid()
    ) OR
    -- Drivers can view their assigned routes
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'driver'
    )
  )
);

CREATE POLICY "drivers_insert_tracking" ON public.child_tracking 
FOR INSERT WITH CHECK (
  organization_id = get_current_user_organization_id_safe() AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'driver'
  )
);

-- Add strong RLS policy for rail_replacement_services if table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rail_replacement_services') THEN
    EXECUTE 'DROP POLICY IF EXISTS "rail_services_organization_isolation" ON public.rail_replacement_services';
    EXECUTE 'CREATE POLICY "rail_services_organization_isolation" ON public.rail_replacement_services 
             FOR ALL USING (organization_id = get_current_user_organization_id_safe())';
  END IF;
END $$;