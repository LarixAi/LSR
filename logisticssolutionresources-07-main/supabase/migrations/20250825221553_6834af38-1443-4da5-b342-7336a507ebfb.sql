-- SECURITY FIX: Critical vulnerability patches without authentication requirement

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

-- 2. Remove any public access policies on support_tickets
DROP POLICY IF EXISTS "Public can view support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Enable public read access for support_tickets" ON public.support_tickets;

-- 3. Remove public access on vehicle_check_sessions
DROP POLICY IF EXISTS "Public can view vehicle check sessions" ON public.vehicle_check_sessions;
DROP POLICY IF EXISTS "Enable public read access for vehicle_check_sessions" ON public.vehicle_check_sessions;

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

-- 7. Create secure function to log security events (with auth check)
CREATE OR REPLACE FUNCTION log_security_event(
  p_operation_type TEXT,
  p_details JSONB
)
RETURNS VOID AS $$
BEGIN
  -- Only log if user is authenticated
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO admin_operation_logs (
      admin_user_id,
      operation_type,
      operation_details,
      success,
      organization_id
    ) VALUES (
      auth.uid(),
      p_operation_type,
      p_details,
      true,
      get_current_user_organization_id_safe()
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;