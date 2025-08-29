-- CRITICAL SECURITY FIX: Emergency RLS Policy Hardening - Targeted Fix
-- This migration addresses only the most critical overly permissive RLS policies

-- 1. Fix tachograph_records - only if overly permissive policy exists
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.tachograph_records;

-- Only create if it doesn't already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tachograph_records' 
        AND policyname = 'Organization users can manage their tachograph records'
    ) THEN
        CREATE POLICY "Organization users can manage their tachograph records"
        ON public.tachograph_records
        FOR ALL
        TO authenticated
        USING (organization_id = get_current_user_organization_id_safe())
        WITH CHECK (organization_id = get_current_user_organization_id_safe());
    END IF;
END $$;

-- 2. Fix support_tickets - only if overly permissive policy exists
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.support_tickets;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'support_tickets' 
        AND policyname = 'Organization users can manage their support tickets'
    ) THEN
        CREATE POLICY "Organization users can manage their support tickets"
        ON public.support_tickets
        FOR ALL
        TO authenticated
        USING (organization_id = get_current_user_organization_id_safe())
        WITH CHECK (organization_id = get_current_user_organization_id_safe());
    END IF;
END $$;

-- 3. Fix vehicle_checks - critical vehicle safety data
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.vehicle_checks;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'vehicle_checks' 
        AND policyname = 'Organization users can manage their vehicle checks'
    ) THEN
        CREATE POLICY "Organization users can manage their vehicle checks"
        ON public.vehicle_checks
        FOR ALL  
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.vehicles v 
            WHERE v.id = vehicle_checks.vehicle_id 
            AND v.organization_id = get_current_user_organization_id_safe()
          )
        )
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.vehicles v 
            WHERE v.id = vehicle_checks.vehicle_id 
            AND v.organization_id = get_current_user_organization_id_safe()
          )
        );
    END IF;
END $$;

-- 4. CRITICAL: Fix student_pickups - CHILD SAFETY DATA PROTECTION
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.student_pickups;

-- Create child safety policies
DO $$
BEGIN
    -- Parents can view their children's pickup records
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'student_pickups' 
        AND policyname = 'Parents can view their children pickup records'
    ) THEN
        CREATE POLICY "Parents can view their children pickup records"
        ON public.student_pickups
        FOR SELECT
        TO authenticated
        USING (
          student_id IN (
            SELECT cp.id 
            FROM child_profiles cp 
            WHERE cp.parent_id = auth.uid()
          )
        );
    END IF;

    -- Drivers can manage pickup records
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'student_pickups' 
        AND policyname = 'Drivers can manage pickup records'
    ) THEN
        CREATE POLICY "Drivers can manage pickup records"
        ON public.student_pickups
        FOR ALL
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'driver'
            AND p.organization_id = get_current_user_organization_id_safe()
          )
        )
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'driver'
            AND p.organization_id = get_current_user_organization_id_safe()
          )
        );
    END IF;

    -- Admins can manage all pickup records in their organization
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'student_pickups' 
        AND policyname = 'Admins can manage org pickup records'
    ) THEN
        CREATE POLICY "Admins can manage org pickup records"
        ON public.student_pickups
        FOR ALL
        TO authenticated
        USING (
          is_current_user_admin_safe() 
          AND EXISTS (
            SELECT 1 FROM child_profiles cp 
            WHERE cp.id = student_pickups.student_id 
            AND cp.organization_id = get_current_user_organization_id_safe()
          )
        )
        WITH CHECK (
          is_current_user_admin_safe() 
          AND EXISTS (
            SELECT 1 FROM child_profiles cp 
            WHERE cp.id = student_pickups.student_id 
            AND cp.organization_id = get_current_user_organization_id_safe()
          )
        );
    END IF;
END $$;

-- 5. Add audit logging for child data access
CREATE OR REPLACE FUNCTION log_child_data_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if we have a valid auth context
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO admin_operation_logs (
      admin_user_id,
      operation_type,
      operation_details,
      success,
      organization_id
    ) VALUES (
      auth.uid(),
      'child_data_access',
      jsonb_build_object(
        'table_name', TG_TABLE_NAME,
        'operation', TG_OP,
        'child_id', COALESCE(NEW.child_id, NEW.student_id, OLD.child_id, OLD.student_id),
        'timestamp', extract(epoch from now())
      ),
      true,
      get_current_user_organization_id_safe()
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit logging to child-related tables
DROP TRIGGER IF EXISTS log_child_profiles_access ON public.child_profiles;
CREATE TRIGGER log_child_profiles_access
  AFTER INSERT OR UPDATE OR DELETE ON public.child_profiles
  FOR EACH ROW EXECUTE FUNCTION log_child_data_access();

-- 6. Create security validation function
CREATE OR REPLACE FUNCTION validate_organization_access(target_org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_org_id uuid;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO user_org_id
  FROM profiles
  WHERE id = auth.uid();
  
  -- Check if user belongs to target organization
  IF user_org_id IS NULL OR target_org_id IS NULL OR user_org_id != target_org_id THEN
    -- Log potential security violation only if we have valid data
    IF auth.uid() IS NOT NULL THEN
      PERFORM create_security_alert(
        'cross_organization_access_attempt',
        'high',
        jsonb_build_object(
          'user_org', user_org_id,
          'target_org', target_org_id,
          'user_id', auth.uid()
        )
      );
    END IF;
    
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;