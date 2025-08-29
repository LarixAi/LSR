-- CRITICAL SECURITY FIXES - CORRECTED
-- Phase 1: Fix PII Exposure and Database Security

-- 1. Fix Support Tickets PII Exposure - Add RLS and proper policies
ALTER TABLE IF EXISTS public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Drop any existing overly permissive policies
DROP POLICY IF EXISTS "Support tickets are publicly readable" ON public.support_tickets;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.support_tickets;

-- Create secure policies for support tickets (using correct column names)
CREATE POLICY "Users can view their own support tickets" 
ON public.support_tickets 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    requester_id = auth.uid() OR 
    requester_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

CREATE POLICY "Admins can manage all support tickets" 
ON public.support_tickets 
FOR ALL 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'council', 'super_admin')
  )
);

CREATE POLICY "Users can create support tickets" 
ON public.support_tickets 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    requester_id = auth.uid() OR 
    requester_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- 2. Fix Vehicle Checks Data Exposure - Add RLS  
ALTER TABLE IF EXISTS public.vehicle_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization users can manage vehicle checks" 
ON public.vehicle_checks 
FOR ALL 
USING (
  auth.uid() IS NOT NULL AND 
  organization_id = get_current_user_organization_id_safe()
);

-- 3. Fix Subscription Plans - Restrict to authenticated users
ALTER TABLE IF EXISTS public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view subscription plans" 
ON public.subscription_plans 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage subscription plans" 
ON public.subscription_plans 
FOR ALL 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- 4. Fix Notification Templates - Restrict to authenticated users
ALTER TABLE IF EXISTS public.notification_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization users can view notification templates" 
ON public.notification_templates 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    organization_id IS NULL OR 
    organization_id = get_current_user_organization_id_safe()
  )
);

CREATE POLICY "Admins can manage notification templates" 
ON public.notification_templates 
FOR ALL 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'council', 'super_admin')
  )
);

-- 5. Add security monitoring trigger for support tickets
CREATE OR REPLACE FUNCTION public.log_support_ticket_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log access to support tickets for security monitoring
  INSERT INTO admin_operation_logs (
    admin_user_id,
    operation_type,
    operation_details,
    success,
    organization_id
  ) VALUES (
    auth.uid(),
    'support_ticket_access',
    jsonb_build_object(
      'ticket_id', COALESCE(NEW.id, OLD.id),
      'operation', TG_OP,
      'ticket_number', COALESCE(NEW.ticket_number, OLD.ticket_number),
      'timestamp', extract(epoch from now())
    ),
    true,
    COALESCE(NEW.organization_id, OLD.organization_id)
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Add trigger for support ticket access logging
DROP TRIGGER IF EXISTS trigger_log_support_ticket_access ON public.support_tickets;
CREATE TRIGGER trigger_log_support_ticket_access
    AFTER SELECT OR INSERT OR UPDATE OR DELETE
    ON public.support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.log_support_ticket_access();