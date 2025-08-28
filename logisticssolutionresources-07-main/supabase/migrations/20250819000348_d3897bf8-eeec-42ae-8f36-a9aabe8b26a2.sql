-- Phase 1: Critical Security Fixes (Fixed)
-- Fix RLS policies for sensitive tables and security definer view

-- Drop dependent objects first to fix the cascade issue
DROP VIEW IF EXISTS public.work_order_summary CASCADE;
DROP VIEW IF EXISTS public.combined_defects CASCADE;

-- Enable RLS on all critical tables that might be missing it
ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analog_tachograph_charts ENABLE ROW LEVEL SECURITY;

-- Fix child_profiles RLS - ensure proper organization isolation
DROP POLICY IF EXISTS "Parents can manage their own children" ON public.child_profiles;
DROP POLICY IF EXISTS "Organization members can view children" ON public.child_profiles;

CREATE POLICY "Parents can manage their own children" 
ON public.child_profiles 
FOR ALL
USING (parent_id = auth.uid())
WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Organization admins can manage children" 
ON public.child_profiles 
FOR ALL
USING (
  organization_id = get_current_user_organization_id_safe() 
  AND is_current_user_admin_safe()
)
WITH CHECK (
  organization_id = get_current_user_organization_id_safe() 
  AND is_current_user_admin_safe()
);

-- Fix customer_profiles RLS - add organization isolation
DROP POLICY IF EXISTS "Admins can manage customer profiles in their organization" ON public.customer_profiles;
DROP POLICY IF EXISTS "Users can view customer profiles in their organization" ON public.customer_profiles;

CREATE POLICY "Users can manage customer profiles in their organization" 
ON public.customer_profiles 
FOR ALL
USING (organization_id = get_current_user_organization_id_safe())
WITH CHECK (organization_id = get_current_user_organization_id_safe());

-- Fix driver_locations RLS - ensure data isolation
DROP POLICY IF EXISTS "Drivers can insert their own location data" ON public.driver_locations;
DROP POLICY IF EXISTS "Users can view driver locations in their organization" ON public.driver_locations;

CREATE POLICY "Drivers can insert their own location data" 
ON public.driver_locations 
FOR INSERT
WITH CHECK (
  driver_id = auth.uid() 
  AND organization_id = get_current_user_organization_id_safe()
);

CREATE POLICY "Organization members can view driver locations" 
ON public.driver_locations 
FOR SELECT
USING (
  organization_id = get_current_user_organization_id_safe() 
  AND (driver_id = auth.uid() OR is_current_user_admin_safe())
);

-- Add missing RLS policies for analog_tachograph_charts
DROP POLICY IF EXISTS "Users can manage organization's analog charts" ON public.analog_tachograph_charts;
DROP POLICY IF EXISTS "Users can view organization's analog charts" ON public.analog_tachograph_charts;

CREATE POLICY "Users can manage organization's analog charts" 
ON public.analog_tachograph_charts 
FOR ALL
USING (organization_id = get_current_user_organization_id_safe())
WITH CHECK (organization_id = get_current_user_organization_id_safe());

-- Add input validation function for secure operations
CREATE OR REPLACE FUNCTION public.validate_organization_access(target_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT target_org_id = get_current_user_organization_id_safe();
$$;