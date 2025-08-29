-- CRITICAL SECURITY FIXES: Phase 1 - Emergency RLS Policy Corrections (Fixed)
-- Fix overly permissive policies and cross-organization data leakage

-- 1. Fix Support Tickets - Handle existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view all support tickets" ON public.support_tickets;
    DROP POLICY IF EXISTS "Anyone can view support tickets" ON public.support_tickets;
    DROP POLICY IF EXISTS "Users can view organization support tickets" ON public.support_tickets;
    DROP POLICY IF EXISTS "Users can create support tickets for their organization" ON public.support_tickets;
    DROP POLICY IF EXISTS "Admins can manage organization support tickets" ON public.support_tickets;
    
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
EXCEPTION
    WHEN undefined_table THEN
        -- Support tickets table doesn't exist, skip
        NULL;
END $$;

-- 2. Fix Schools Table - Restrict to organization relationships
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Anyone can view schools" ON public.schools;
    DROP POLICY IF EXISTS "Users can view all schools" ON public.schools;
    DROP POLICY IF EXISTS "Organization users can view schools they serve" ON public.schools;
    DROP POLICY IF EXISTS "Admins can manage schools in their service area" ON public.schools;

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
EXCEPTION
    WHEN undefined_table THEN
        -- Schools table doesn't exist, skip
        NULL;
END $$;

-- 3. Fix Vehicle Check Sessions - Strengthen access control
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can manage vehicle check sessions" ON public.vehicle_check_sessions;
    DROP POLICY IF EXISTS "Drivers can manage their own vehicle checks" ON public.vehicle_check_sessions;
    DROP POLICY IF EXISTS "Organization admins can view all vehicle checks" ON public.vehicle_check_sessions;

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
EXCEPTION
    WHEN undefined_table THEN
        -- Vehicle check sessions table doesn't exist, skip
        NULL;
END $$;

-- 4. Secure Vehicles Table
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view all vehicles" ON public.vehicles;
    DROP POLICY IF EXISTS "Organization users can view their vehicles" ON public.vehicles;
    DROP POLICY IF EXISTS "Organization admins can manage their vehicles" ON public.vehicles;

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
EXCEPTION
    WHEN undefined_table THEN
        -- Vehicles table doesn't exist, skip
        NULL;
END $$;

-- 5. Secure Routes Table
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Organization users can view their routes" ON public.routes;
    DROP POLICY IF EXISTS "Organization admins can manage their routes" ON public.routes;

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
EXCEPTION
    WHEN undefined_table THEN
        -- Routes table doesn't exist, skip
        NULL;
END $$;

-- 6. Enhanced Security Event Logging Function
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
      'timestamp', extract(epoch from now())
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