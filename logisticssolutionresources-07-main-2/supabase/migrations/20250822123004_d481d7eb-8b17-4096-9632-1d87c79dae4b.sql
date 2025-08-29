-- CRITICAL SECURITY FIXES
-- Phase 1: Fix PII Exposure and Database Security

-- 1. Fix Support Tickets PII Exposure - Add RLS and proper policies
ALTER TABLE IF EXISTS public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Drop any existing overly permissive policies
DROP POLICY IF EXISTS "Support tickets are publicly readable" ON public.support_tickets;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.support_tickets;

-- Create secure policies for support tickets
CREATE POLICY "Users can view their own support tickets" 
ON public.support_tickets 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid() OR 
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
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
    user_id = auth.uid() OR 
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
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

-- 5. Fix Function Search Path Issues - Add SET search_path to security definer functions
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_notification_delivery()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert delivery log entries for each channel
  INSERT INTO public.notification_delivery_logs (
    notification_id,
    recipient_id,
    channel,
    status,
    sent_at
  )
  SELECT 
    NEW.id,
    COALESCE(NEW.recipient_id, p.id),
    unnest(NEW.channels),
    'pending',
    CASE 
      WHEN NEW.scheduled_for IS NOT NULL THEN NEW.scheduled_for
      ELSE NOW()
    END
  FROM public.profiles p
  WHERE (NEW.recipient_id IS NOT NULL AND p.id = NEW.recipient_id)
     OR (NEW.recipient_role IS NOT NULL AND p.role = NEW.recipient_role AND p.organization_id = NEW.organization_id);
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_unread_notification_count(user_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.notification_messages
    WHERE (recipient_id = user_uuid OR 
           (recipient_role IS NOT NULL AND EXISTS (
             SELECT 1 FROM public.profiles 
             WHERE id = user_uuid 
             AND role = notification_messages.recipient_role
             AND organization_id = notification_messages.organization_id
           )))
    AND read_at IS NULL
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_profile_exists(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = user_id);
$function$;

CREATE OR REPLACE FUNCTION public.repair_auth_users()
RETURNS TABLE(profile_id uuid, email text, status text, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    profile_record RECORD;
BEGIN
    -- Loop through profiles that might not have corresponding auth users
    FOR profile_record IN 
        SELECT p.id, p.email, p.first_name, p.last_name
        FROM profiles p
        WHERE p.email IS NOT NULL
        ORDER BY p.created_at DESC
    LOOP
        -- Check if auth user exists
        IF NOT EXISTS (
            SELECT 1 FROM auth.users au
            WHERE au.email = profile_record.email
        ) THEN
            -- Profile exists but no auth user - this indicates a problem
            RETURN QUERY SELECT 
                profile_record.id,
                profile_record.email,
                'missing_auth_user'::text,
                'Profile exists but no corresponding auth user found'::text;
        ELSE
            -- Both exist - this is good
            RETURN QUERY SELECT 
                profile_record.id,
                profile_record.email,
                'ok'::text,
                'Profile and auth user both exist'::text;
        END IF;
    END LOOP;
    
    RETURN;
END;
$function$;