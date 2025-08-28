-- CRITICAL SECURITY FIXES: Phase 1 - Emergency RLS Policy Corrections
-- Fix overly permissive policies and cross-organization data leakage

-- 1. Fix Support Tickets - Remove dangerous 'true' policy
DROP POLICY IF EXISTS "Users can view all support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Anyone can view support tickets" ON public.support_tickets;

CREATE POLICY "Users can view organization support tickets" 
ON public.support_tickets 
FOR SELECT 
USING (organization_id = get_current_user_organization_id_safe());

CREATE POLICY "Users can create support tickets for their organization" 
ON public.support_tickets 
FOR INSERT 
WITH CHECK (organization_id = get_current_user_organization_id_safe());

CREATE POLICY "Admins can manage organization support tickets" 
ON public.support_tickets 
FOR ALL 
USING (
  organization_id = get_current_user_organization_id_safe() 
  AND is_current_user_admin_safe()
)
WITH CHECK (
  organization_id = get_current_user_organization_id_safe() 
  AND is_current_user_admin_safe()
);

-- 2. Fix Schools Table - Restrict to organization relationships
DROP POLICY IF EXISTS "Anyone can view schools" ON public.schools;
DROP POLICY IF EXISTS "Users can view all schools" ON public.schools;

CREATE POLICY "Organization users can view schools they serve" 
ON public.schools 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp 
    WHERE cp.school_id = schools.id 
    AND cp.organization_id = get_current_user_organization_id_safe()
  )
  OR is_current_user_admin_safe()
);

CREATE POLICY "Admins can manage schools in their service area" 
ON public.schools 
FOR ALL 
USING (
  is_current_user_admin_safe() 
  AND (
    organization_id = get_current_user_organization_id_safe()
    OR EXISTS (
      SELECT 1 FROM public.child_profiles cp 
      WHERE cp.school_id = schools.id 
      AND cp.organization_id = get_current_user_organization_id_safe()
    )
  )
)
WITH CHECK (
  is_current_user_admin_safe() 
  AND organization_id = get_current_user_organization_id_safe()
);

-- 3. Fix Vehicle Check Sessions - Strengthen access control
DROP POLICY IF EXISTS "Users can manage vehicle check sessions" ON public.vehicle_check_sessions;

CREATE POLICY "Drivers can manage their own vehicle checks" 
ON public.vehicle_check_sessions 
FOR ALL 
USING (
  driver_id = auth.uid() 
  AND organization_id = get_current_user_organization_id_safe()
)
WITH CHECK (
  driver_id = auth.uid() 
  AND organization_id = get_current_user_organization_id_safe()
);

CREATE POLICY "Organization admins can view all vehicle checks" 
ON public.vehicle_check_sessions 
FOR SELECT 
USING (
  organization_id = get_current_user_organization_id_safe() 
  AND is_current_user_admin_safe()
);

-- 4. Secure Vehicles Table
DROP POLICY IF EXISTS "Users can view all vehicles" ON public.vehicles;

CREATE POLICY "Organization users can view their vehicles" 
ON public.vehicles 
FOR SELECT 
USING (organization_id = get_current_user_organization_id_safe());

CREATE POLICY "Organization admins can manage their vehicles" 
ON public.vehicles 
FOR ALL 
USING (
  organization_id = get_current_user_organization_id_safe() 
  AND is_current_user_admin_safe()
)
WITH CHECK (
  organization_id = get_current_user_organization_id_safe() 
  AND is_current_user_admin_safe()
);

-- 5. Secure Routes Table
CREATE POLICY "Organization users can view their routes" 
ON public.routes 
FOR SELECT 
USING (organization_id = get_current_user_organization_id_safe());

CREATE POLICY "Organization admins can manage their routes" 
ON public.routes 
FOR ALL 
USING (
  organization_id = get_current_user_organization_id_safe() 
  AND is_current_user_admin_safe()
)
WITH CHECK (
  organization_id = get_current_user_organization_id_safe() 
  AND is_current_user_admin_safe()
);

-- 6. Secure Driver Payroll Data - HR/Admin Only Access
CREATE POLICY "HR admins can manage payroll data" 
ON public.driver_payroll 
FOR ALL 
USING (
  organization_id = get_current_user_organization_id_safe() 
  AND is_current_user_admin_safe()
)
WITH CHECK (
  organization_id = get_current_user_organization_id_safe() 
  AND is_current_user_admin_safe()
);

-- 7. Secure Employee Financial Records
CREATE POLICY "Drivers can view their own payroll" 
ON public.driver_payroll 
FOR SELECT 
USING (
  driver_id = auth.uid() 
  AND organization_id = get_current_user_organization_id_safe()
);

-- 8. Secure Incidents Table
CREATE POLICY "Organization users can manage incidents" 
ON public.incidents 
FOR ALL 
USING (organization_id = get_current_user_organization_id_safe())
WITH CHECK (organization_id = get_current_user_organization_id_safe());

-- 9. Secure Schedules
CREATE POLICY "Organization users can manage schedules" 
ON public.schedules 
FOR ALL 
USING (organization_id = get_current_user_organization_id_safe())
WITH CHECK (organization_id = get_current_user_organization_id_safe());

-- 10. Enhanced Security Event Logging
CREATE OR REPLACE FUNCTION public.log_data_access(
  table_name text,
  operation_type text,
  record_id uuid DEFAULT NULL,
  metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO admin_operation_logs (
    admin_user_id,
    operation_type,
    operation_details,
    success,
    organization_id
  ) VALUES (
    auth.uid(),
    'data_access',
    jsonb_build_object(
      'table', table_name,
      'operation', operation_type,
      'record_id', record_id,
      'metadata', metadata,
      'timestamp', extract(epoch from now()),
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
    ),
    true,
    get_current_user_organization_id_safe()
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail the main operation if logging fails
    NULL;
END;
$$;