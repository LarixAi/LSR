-- Fix Critical Security Vulnerabilities
-- Drop overly permissive policies and create role-based restrictions

-- 1. FIX CUSTOMER PROFILES - Restrict to admin/council only
DROP POLICY IF EXISTS "customer_profiles_org_access" ON public.customer_profiles;

CREATE POLICY "Admins can manage customer profiles" ON public.customer_profiles
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'council', 'super_admin')
  )
);

-- 2. FIX CHILD PROFILES - Restrict to admin/council/parents only
DROP POLICY IF EXISTS "child_profiles_org_access" ON public.child_profiles;

CREATE POLICY "Admins can manage child profiles" ON public.child_profiles
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'council', 'super_admin')
  )
);

CREATE POLICY "Parents can view their own children" ON public.child_profiles
FOR SELECT USING (
  parent_id = auth.uid()
);

CREATE POLICY "Parents can update their own children" ON public.child_profiles
FOR UPDATE USING (
  parent_id = auth.uid()
) WITH CHECK (
  parent_id = auth.uid()
);

-- 3. FIX DRIVER LOCATIONS - Restrict viewing all locations to admin/council only
DROP POLICY IF EXISTS "Users can view org driver locations" ON public.driver_locations;
DROP POLICY IF EXISTS "driver_locations_auto_org_access" ON public.driver_locations;

CREATE POLICY "Drivers can view their own locations" ON public.driver_locations
FOR SELECT USING (
  driver_id = auth.uid()
);

-- Keep existing admin and insert policies as they are already secure

-- 4. FIX FUEL TRANSACTIONS - Restrict comprehensive access
DROP POLICY IF EXISTS "Users can view org fuel transactions" ON public.fuel_transactions;
DROP POLICY IF EXISTS "fuel_transactions_comprehensive" ON public.fuel_transactions;

CREATE POLICY "Drivers can view their own fuel transactions" ON public.fuel_transactions
FOR SELECT USING (
  driver_id = auth.uid()
);

-- Keep existing admin policy as it's already secure

-- 5. ENHANCE VEHICLE INSPECTIONS - Add more restrictive delete policy
DROP POLICY IF EXISTS "Staff can delete vehicle inspections" ON public.vehicle_inspections;

CREATE POLICY "Only admins can delete vehicle inspections" ON public.vehicle_inspections
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin') 
    AND organization_id = vehicle_inspections.organization_id
  )
);

-- Add audit logging for sensitive data access
CREATE TABLE IF NOT EXISTS public.sensitive_data_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  table_name text NOT NULL,
  action text NOT NULL,
  record_id uuid,
  organization_id uuid,
  accessed_at timestamp with time zone DEFAULT now(),
  ip_address inet,
  user_agent text
);

ALTER TABLE public.sensitive_data_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view access logs" ON public.sensitive_data_access_log
FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'council', 'super_admin')
  )
);

-- Create function to log sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_access(
  p_table_name text,
  p_action text,
  p_record_id uuid DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_org_id uuid;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO v_org_id 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  -- Log the access
  INSERT INTO public.sensitive_data_access_log (
    user_id, table_name, action, record_id, organization_id
  ) VALUES (
    auth.uid(), p_table_name, p_action, p_record_id, v_org_id
  );
END;
$$;