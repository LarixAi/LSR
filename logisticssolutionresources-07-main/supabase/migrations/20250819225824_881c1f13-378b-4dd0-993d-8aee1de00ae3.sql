-- CRITICAL SECURITY FIXES: Targeted RLS Policy Corrections
-- Fix only verified overly permissive policies based on actual table structure

-- 1. Fix Support Tickets (if table exists with organization_id)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'support_tickets'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'support_tickets' 
        AND column_name = 'organization_id'
    ) THEN
        DROP POLICY IF EXISTS "Users can view all support tickets" ON public.support_tickets;
        DROP POLICY IF EXISTS "Anyone can view support tickets" ON public.support_tickets;
        
        CREATE POLICY "Organization users can view support tickets" 
        ON public.support_tickets 
        FOR SELECT 
        USING (organization_id = get_current_user_organization_id_safe());
    END IF;
END $$;

-- 2. Fix Vehicle Check Sessions (verified exists)
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

-- 3. Secure Vehicles Table (if exists)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'vehicles'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'vehicles' 
        AND column_name = 'organization_id'
    ) THEN
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
    END IF;
END $$;

-- 4. Secure Routes Table (if exists)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'routes'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'routes' 
        AND column_name = 'organization_id'
    ) THEN
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
    END IF;
END $$;

-- 5. Fix Schools Table - Use proper child_profiles relationship
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'schools'
    ) THEN
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
    END IF;
END $$;

-- 6. Secure Driver Payroll (if exists)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'driver_payroll'
    ) THEN
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

        CREATE POLICY "Drivers can view their own payroll" 
        ON public.driver_payroll 
        FOR SELECT 
        USING (
          driver_id = auth.uid() 
          AND organization_id = get_current_user_organization_id_safe()
        );
    END IF;
END $$;

-- 7. Enhanced Security Event Logging Function
CREATE OR REPLACE FUNCTION public.log_security_access(
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
DECLARE
  user_org_id uuid;
BEGIN
  -- Get user's organization safely
  SELECT organization_id INTO user_org_id
  FROM profiles
  WHERE id = auth.uid()
  LIMIT 1;
  
  -- Log the security event
  INSERT INTO admin_operation_logs (
    admin_user_id,
    operation_type,
    operation_details,
    success,
    organization_id
  ) VALUES (
    auth.uid(),
    'security_access',
    jsonb_build_object(
      'table', table_name,
      'operation', operation_type,
      'record_id', record_id,
      'metadata', metadata,
      'timestamp', extract(epoch from now()),
      'user_role', (SELECT role FROM profiles WHERE id = auth.uid())
    ),
    true,
    user_org_id
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail the main operation if logging fails
    NULL;
END;
$$;