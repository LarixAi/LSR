-- Phase 1: Critical RLS Policy Fixes (URGENT) - Fixed version

-- 2. Fix tachograph_records - remove overly permissive policies
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.tachograph_records;

-- Create proper tachograph access policies if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tachograph_records' 
        AND policyname = 'Users can manage tachograph records in their organization'
    ) THEN
        CREATE POLICY "Users can manage tachograph records in their organization" 
        ON public.tachograph_records 
        FOR ALL 
        USING (organization_id = get_current_user_organization_id_safe())
        WITH CHECK (organization_id = get_current_user_organization_id_safe());
    END IF;
END $$;

-- 3. Fix support_tickets - remove overly permissive policies  
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.support_tickets;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'support_tickets' 
        AND policyname = 'Users can manage support tickets in their organization'
    ) THEN
        CREATE POLICY "Users can manage support tickets in their organization" 
        ON public.support_tickets 
        FOR ALL 
        USING (organization_id = get_current_user_organization_id_safe())
        WITH CHECK (organization_id = get_current_user_organization_id_safe());
    END IF;
END $$;

-- 4. Fix vehicle_check_sessions - remove overly permissive policies
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.vehicle_check_sessions;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'vehicle_check_sessions' 
        AND policyname = 'Users can manage vehicle checks in their organization'
    ) THEN
        CREATE POLICY "Users can manage vehicle checks in their organization" 
        ON public.vehicle_check_sessions 
        FOR ALL 
        USING (organization_id = get_current_user_organization_id_safe())
        WITH CHECK (organization_id = get_current_user_organization_id_safe());
    END IF;
END $$;

-- 5. Fix daily_rest - replace overly permissive policies
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.daily_rest;

-- Replace with proper organization-based policy
DO $$
BEGIN
    -- Drop the existing overly permissive policy
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.daily_rest;
    
    -- Create organization-based policy if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'daily_rest' 
        AND policyname = 'Users can manage daily rest in their organization'
    ) THEN
        CREATE POLICY "Users can manage daily rest in their organization" 
        ON public.daily_rest 
        FOR ALL 
        USING (organization_id = get_current_user_organization_id_safe())
        WITH CHECK (organization_id = get_current_user_organization_id_safe());
    END IF;
END $$;

-- 6. Enhanced child data protection - replace existing policies
DROP POLICY IF EXISTS "Admins can view all documents" ON public.child_documents;
DROP POLICY IF EXISTS "Parents can manage their children's documents" ON public.child_documents;

-- Create secure child document policies
CREATE POLICY "Parents can manage their children's documents in same organization" 
ON public.child_documents 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM child_profiles cp 
  WHERE cp.id = child_documents.child_id 
  AND cp.parent_id = auth.uid() 
  AND cp.organization_id = get_current_user_organization_id_safe()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM child_profiles cp 
  WHERE cp.id = child_documents.child_id 
  AND cp.parent_id = auth.uid() 
  AND cp.organization_id = get_current_user_organization_id_safe()
));

CREATE POLICY "Organization admins can view child documents in their organization" 
ON public.child_documents 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM child_profiles cp 
  WHERE cp.id = child_documents.child_id 
  AND cp.organization_id = get_current_user_organization_id_safe() 
  AND is_current_user_admin_safe()
));

-- 7. Create enhanced security monitoring function
CREATE OR REPLACE FUNCTION public.enhanced_security_monitor()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_org_id uuid;
  target_org_id uuid;
  user_role text;
BEGIN
  -- Skip logging for service role operations
  IF current_setting('role') = 'service_role' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Get user's organization and role
  SELECT organization_id, role INTO user_org_id, user_role
  FROM profiles WHERE id = auth.uid();
  
  -- Extract organization ID from the record being accessed
  IF TG_TABLE_NAME = 'organizations' THEN
    target_org_id := COALESCE(NEW.id, OLD.id);
  ELSIF TG_TABLE_NAME = 'child_profiles' THEN
    target_org_id := COALESCE(NEW.organization_id, OLD.organization_id);
  ELSIF TG_TABLE_NAME = 'vehicles' THEN
    target_org_id := COALESCE(NEW.organization_id, OLD.organization_id);
  ELSIF TG_TABLE_NAME = 'defect_reports' THEN
    target_org_id := COALESCE(NEW.organization_id, OLD.organization_id);
  END IF;
  
  -- Log suspicious cross-organization access attempts
  IF user_org_id IS NOT NULL AND target_org_id IS NOT NULL AND user_org_id != target_org_id THEN
    -- Insert security alert with error handling
    BEGIN
      INSERT INTO admin_operation_logs (
        admin_user_id,
        operation_type,
        operation_details,
        success,
        organization_id
      ) VALUES (
        auth.uid(),
        'security_alert',
        jsonb_build_object(
          'alert_type', 'cross_organization_access_attempt',
          'table', TG_TABLE_NAME,
          'user_org', user_org_id,
          'target_org', target_org_id,
          'user_role', user_role,
          'operation', TG_OP,
          'timestamp', extract(epoch from now()),
          'severity', 'high'
        ),
        false,
        user_org_id
      );
    EXCEPTION
      WHEN OTHERS THEN
        -- Continue operation even if logging fails
        NULL;
    END;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;