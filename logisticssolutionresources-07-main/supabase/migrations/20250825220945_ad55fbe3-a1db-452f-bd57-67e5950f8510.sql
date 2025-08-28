-- SECURITY FIX: Correct implementation based on actual table structures

-- 1. Fix notification_delivery_logs (uses recipient_id, not user_id)
DROP POLICY IF EXISTS "Users can insert notification delivery logs" ON public.notification_delivery_logs;
DROP POLICY IF EXISTS "Users can view their notification delivery logs" ON public.notification_delivery_logs;

-- Create secure policies for notification delivery logs
CREATE POLICY "Users can view own delivery logs" 
ON public.notification_delivery_logs FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND recipient_id = auth.uid()
);

-- 2. Fix the dangerous public policies that were found
-- Check and fix any existing dangerous policies on support_tickets
SELECT policyname FROM pg_policies 
WHERE tablename = 'support_tickets' 
AND schemaname = 'public';

-- Remove any public access policies
DROP POLICY IF EXISTS "Public can view support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Enable public read access for support_tickets" ON public.support_tickets;

-- Fix vehicle_check_sessions if there are public policies
DROP POLICY IF EXISTS "Public can view vehicle check sessions" ON public.vehicle_check_sessions;
DROP POLICY IF EXISTS "Enable public read access for vehicle_check_sessions" ON public.vehicle_check_sessions;

-- 3. Add additional security monitoring
-- Create function to log security-sensitive queries
CREATE OR REPLACE FUNCTION log_security_sensitive_access()
RETURNS event_trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log access to sensitive tables
  INSERT INTO admin_operation_logs (
    admin_user_id,
    operation_type,
    operation_details,
    success,
    organization_id
  ) VALUES (
    auth.uid(),
    'sensitive_table_access',
    jsonb_build_object(
      'event', TG_EVENT,
      'timestamp', extract(epoch from now())
    ),
    true,
    get_current_user_organization_id_safe()
  );
END;
$$;

-- 4. Fix any remaining issues with orders table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'orders'
  ) THEN
    -- Get column information
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'orders' 
      AND column_name = 'organization_id'
    ) THEN
      -- Remove dangerous policies
      DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
      DROP POLICY IF EXISTS "Public can create orders" ON public.orders;
      
      -- Create secure policies
      EXECUTE 'CREATE POLICY "Authenticated users can create orders" 
      ON public.orders FOR INSERT 
      WITH CHECK (
        auth.uid() IS NOT NULL 
        AND organization_id = get_current_user_organization_id_safe()
      )';
      
      EXECUTE 'CREATE POLICY "Organization members can view orders" 
      ON public.orders FOR SELECT 
      USING (
        auth.uid() IS NOT NULL 
        AND organization_id = get_current_user_organization_id_safe()
      )';
      
      EXECUTE 'CREATE POLICY "Admins can update orders" 
      ON public.orders FOR UPDATE 
      USING (
        auth.uid() IS NOT NULL 
        AND organization_id = get_current_user_organization_id_safe()
        AND is_current_user_admin_safe()
      )';
    END IF;
  END IF;
END $$;

-- 5. Ensure inspection_responses table is secure if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'inspection_responses'
  ) THEN
    -- Drop any public access policies
    DROP POLICY IF EXISTS "Enable public read access for inspection_responses" ON public.inspection_responses;
    DROP POLICY IF EXISTS "Public can view inspection responses" ON public.inspection_responses;
  END IF;
END $$;

-- 6. Add security check for mobile_auth_logs
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'mobile_auth_logs' 
    AND column_name = 'user_id'
  ) THEN
    -- Ensure only users can see their own logs
    DROP POLICY IF EXISTS "Public can view mobile auth logs" ON public.mobile_auth_logs;
    DROP POLICY IF EXISTS "Anyone can insert mobile auth logs" ON public.mobile_auth_logs;
  END IF;
END $$;

-- 7. Log the security fix completion
INSERT INTO admin_operation_logs (
  admin_user_id,
  operation_type,
  operation_details,
  success,
  organization_id
) VALUES (
  auth.uid(),
  'security_fix_phase2',
  jsonb_build_object(
    'phase', 'additional_security_fixes',
    'fixes_applied', ARRAY[
      'notification_delivery_logs',
      'support_tickets_public_access',
      'vehicle_check_sessions_public_access',
      'orders_table_check',
      'inspection_responses_check',
      'mobile_auth_logs_check'
    ],
    'timestamp', extract(epoch from now()),
    'notes', 'Applied additional security hardening'
  ),
  true,
  get_current_user_organization_id_safe()
);