-- Fix emergency_contacts RLS policies with correct column: child_id

-- Add proper RLS policies for emergency_contacts table
CREATE POLICY "Parents can manage their children's emergency contacts" 
ON public.emergency_contacts 
FOR ALL 
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.child_profiles cp
    WHERE cp.id = emergency_contacts.child_id
    AND cp.parent_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all emergency contacts in organization" 
ON public.emergency_contacts 
FOR ALL 
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.child_profiles cp ON cp.organization_id = p.organization_id
    WHERE p.id = auth.uid()
    AND p.role IN ('admin', 'council', 'super_admin')
    AND cp.id = emergency_contacts.child_id
  )
);

-- Create final comprehensive security audit function
CREATE OR REPLACE FUNCTION public.comprehensive_security_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Comprehensive security auditing for all sensitive operations
  IF auth.uid() IS NOT NULL AND TG_TABLE_NAME IN (
    'emergency_contacts', 'child_profiles', 'support_tickets', 
    'vehicle_checks', 'driver_licenses', 'profiles'
  ) THEN
    INSERT INTO admin_operation_logs (
      admin_user_id,
      operation_type,
      operation_details,
      success,
      organization_id
    ) VALUES (
      auth.uid(),
      'comprehensive_security_audit',
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'record_id', COALESCE(NEW.id, OLD.id),
        'timestamp', extract(epoch from now()),
        'audit_level', 'comprehensive',
        'security_context', 'enhanced_monitoring'
      ),
      true,
      get_current_user_organization_id_safe()
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
EXCEPTION
  WHEN OTHERS THEN
    -- Fail silently to avoid breaking operations
    RETURN COALESCE(NEW, OLD);
END;
$function$;