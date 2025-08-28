-- COMPREHENSIVE SECURITY FIX IMPLEMENTATION
-- Based on actual table structures

-- PHASE 1: CRITICAL DATA EXPOSURE FIXES

-- 1. Fix Support Tickets Table (uses requester_id, not driver_id)
DROP POLICY IF EXISTS "Anyone can create support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Drivers can view their support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Support staff can manage all tickets" ON public.support_tickets;

-- Create secure policies for support tickets
CREATE POLICY "Authenticated users can create support tickets" 
ON public.support_tickets FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND requester_id = auth.uid()
  AND organization_id = get_current_user_organization_id_safe()
);

CREATE POLICY "Users can view own support tickets" 
ON public.support_tickets FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND (requester_id = auth.uid() OR assigned_to = auth.uid())
);

CREATE POLICY "Support staff can view org tickets" 
ON public.support_tickets FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND organization_id = get_current_user_organization_id_safe()
  AND is_current_user_admin_safe()
);

CREATE POLICY "Support staff can update org tickets" 
ON public.support_tickets FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND organization_id = get_current_user_organization_id_safe()
  AND is_current_user_admin_safe()
);

-- 2. Fix Vehicle Checks Table - Remove public SELECT access
DROP POLICY IF EXISTS "Enable public read access for vehicle_checks" ON public.vehicle_checks;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.vehicle_checks;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.vehicle_checks;

-- Create secure policies for vehicle checks
CREATE POLICY "Organization members can view vehicle checks" 
ON public.vehicle_checks FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND organization_id = get_current_user_organization_id_safe()
);

CREATE POLICY "Drivers can create vehicle checks" 
ON public.vehicle_checks FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND driver_id = auth.uid()
  AND organization_id = get_current_user_organization_id_safe()
);

CREATE POLICY "Drivers can update own vehicle checks" 
ON public.vehicle_checks FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND driver_id = auth.uid()
  AND organization_id = get_current_user_organization_id_safe()
);

-- 3. Fix Vehicle Check Sessions - Remove public access
DROP POLICY IF EXISTS "Enable read access for all users" ON public.vehicle_check_sessions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.vehicle_check_sessions;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.vehicle_check_sessions;

-- Create secure policies for vehicle check sessions
CREATE POLICY "Organization members can view check sessions" 
ON public.vehicle_check_sessions FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND organization_id = get_current_user_organization_id_safe()
);

CREATE POLICY "Drivers can create check sessions" 
ON public.vehicle_check_sessions FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND driver_id = auth.uid()
  AND organization_id = get_current_user_organization_id_safe()
);

CREATE POLICY "Drivers can update own check sessions" 
ON public.vehicle_check_sessions FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND driver_id = auth.uid()
  AND organization_id = get_current_user_organization_id_safe()
);

-- 4. Fix Orders Table (check actual columns)
-- First check if orders table has any dangerous policies
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'orders' AND schemaname = 'public'
  ) THEN
    DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
    DROP POLICY IF EXISTS "Drivers can view their orders" ON public.orders;
    DROP POLICY IF EXISTS "Transport managers can manage all orders" ON public.orders;
  END IF;
END $$;

-- 5. Fix Inventory Alerts - Remove public INSERT
DROP POLICY IF EXISTS "Anyone can create inventory alerts" ON public.inventory_alerts;
DROP POLICY IF EXISTS "Organization members can view inventory alerts" ON public.inventory_alerts;
DROP POLICY IF EXISTS "Admins can manage inventory alerts" ON public.inventory_alerts;

-- Create secure policies for inventory alerts
CREATE POLICY "System can create inventory alerts" 
ON public.inventory_alerts FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND organization_id = get_current_user_organization_id_safe()
);

CREATE POLICY "Organization members can view alerts" 
ON public.inventory_alerts FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND organization_id = get_current_user_organization_id_safe()
);

CREATE POLICY "Admins can update alerts" 
ON public.inventory_alerts FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND organization_id = get_current_user_organization_id_safe()
  AND is_current_user_admin_safe()
);

-- 6. Fix Mobile Auth Logs (no organization_id, uses user_id)
DROP POLICY IF EXISTS "Users can insert their own mobile auth logs" ON public.mobile_auth_logs;
DROP POLICY IF EXISTS "Users can view their own mobile auth logs" ON public.mobile_auth_logs;

-- Create secure policies for mobile auth logs
CREATE POLICY "Users can view own auth logs" 
ON public.mobile_auth_logs FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
);

-- 7. Fix Notification Delivery Logs (uses user_id)
DROP POLICY IF EXISTS "Users can insert notification delivery logs" ON public.notification_delivery_logs;
DROP POLICY IF EXISTS "Users can view their notification delivery logs" ON public.notification_delivery_logs;

-- Create secure policies for notification delivery logs
CREATE POLICY "Users can view own delivery logs" 
ON public.notification_delivery_logs FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
);

-- PHASE 2: COMPETITIVE INTELLIGENCE PROTECTION

-- 8. Fix Subscription Plans (no organization_id)
DROP POLICY IF EXISTS "Public can view active subscription plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Admins can manage subscription plans" ON public.subscription_plans;

-- Create secure policies for subscription plans
CREATE POLICY "Authenticated users can view active plans" 
ON public.subscription_plans FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND is_active = true
);

CREATE POLICY "Super admins can manage plans" 
ON public.subscription_plans FOR ALL 
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  )
);

-- 9. Fix Notification Templates - Add organization isolation
DROP POLICY IF EXISTS "Public can view active notification templates" ON public.notification_templates;
DROP POLICY IF EXISTS "Admins can manage notification templates" ON public.notification_templates;

-- Create secure policies for notification templates
CREATE POLICY "Organization members can view active templates" 
ON public.notification_templates FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND is_active = true
  AND (
    organization_id IS NULL -- System templates
    OR organization_id = get_current_user_organization_id_safe()
  )
);

CREATE POLICY "Admins can manage org templates" 
ON public.notification_templates FOR ALL 
USING (
  auth.uid() IS NOT NULL 
  AND is_current_user_admin_safe()
  AND (
    organization_id IS NULL -- Super admin for system templates
    OR organization_id = get_current_user_organization_id_safe()
  )
);

-- 10. Fix User Agreements (no organization_id)
DROP POLICY IF EXISTS "Public can view active user agreements" ON public.user_agreements;
DROP POLICY IF EXISTS "Admins can manage user agreements" ON public.user_agreements;

-- Create secure policies for user agreements
CREATE POLICY "Authenticated users can view active agreements" 
ON public.user_agreements FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND is_active = true
);

CREATE POLICY "Super admins can manage agreements" 
ON public.user_agreements FOR ALL 
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  )
);

-- 11. Fix Vehicle Inspections - Add proper authentication
DROP POLICY IF EXISTS "Enable read access for all users" ON public.vehicle_inspections;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.vehicle_inspections;
DROP POLICY IF EXISTS "Enable update for users based on driver_id" ON public.vehicle_inspections;

-- Create secure policies for vehicle inspections
CREATE POLICY "Organization members can view inspections" 
ON public.vehicle_inspections FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND organization_id = get_current_user_organization_id_safe()
);

CREATE POLICY "Drivers can create inspections" 
ON public.vehicle_inspections FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND driver_id = auth.uid()
  AND organization_id = get_current_user_organization_id_safe()
);

CREATE POLICY "Drivers can update own inspections" 
ON public.vehicle_inspections FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND driver_id = auth.uid()
  AND organization_id = get_current_user_organization_id_safe()
);

-- PHASE 3: Check and fix inspection_responses if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'inspection_responses'
  ) THEN
    -- Fix Inspection Responses - Add authentication
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.inspection_responses;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.inspection_responses;
    DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.inspection_responses;

    -- Create secure policies for inspection responses
    EXECUTE 'CREATE POLICY "Organization members can view responses" 
    ON public.inspection_responses FOR SELECT 
    USING (
      auth.uid() IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM vehicle_inspections vi
        WHERE vi.id = inspection_id
        AND vi.organization_id = get_current_user_organization_id_safe()
      )
    )';

    EXECUTE 'CREATE POLICY "Drivers can create responses" 
    ON public.inspection_responses FOR INSERT 
    WITH CHECK (
      auth.uid() IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM vehicle_inspections vi
        WHERE vi.id = inspection_id
        AND vi.driver_id = auth.uid()
        AND vi.organization_id = get_current_user_organization_id_safe()
      )
    )';

    EXECUTE 'CREATE POLICY "Drivers can update own responses" 
    ON public.inspection_responses FOR UPDATE 
    USING (
      auth.uid() IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM vehicle_inspections vi
        WHERE vi.id = inspection_id
        AND vi.driver_id = auth.uid()
        AND vi.organization_id = get_current_user_organization_id_safe()
      )
    )';
  END IF;
END $$;

-- Log the security fix implementation
INSERT INTO admin_operation_logs (
  admin_user_id,
  operation_type,
  operation_details,
  success,
  organization_id
) VALUES (
  auth.uid(),
  'security_fix_implementation',
  jsonb_build_object(
    'phase', 'critical_security_fixes',
    'tables_fixed', ARRAY[
      'support_tickets',
      'vehicle_checks',
      'vehicle_check_sessions',
      'inventory_alerts',
      'mobile_auth_logs',
      'notification_delivery_logs',
      'subscription_plans',
      'notification_templates',
      'user_agreements',
      'vehicle_inspections'
    ],
    'timestamp', extract(epoch from now()),
    'notes', 'Fixed critical data exposure vulnerabilities'
  ),
  true,
  get_current_user_organization_id_safe()
);