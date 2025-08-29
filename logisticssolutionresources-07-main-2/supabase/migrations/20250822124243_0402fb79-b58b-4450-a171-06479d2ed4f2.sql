-- Fix emergency_contacts RLS policies with correct type casting

-- Add proper RLS policies for emergency_contacts table (child_id is bigint, not uuid)
CREATE POLICY "Parents can manage their children's emergency contacts" 
ON public.emergency_contacts 
FOR ALL 
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.child_profiles cp
    WHERE cp.id::text = emergency_contacts.child_id::text
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
    AND cp.id::text = emergency_contacts.child_id::text
  )
);

-- Create final security function with proper search path
CREATE OR REPLACE FUNCTION public.final_security_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Final security audit logging for critical operations
  IF auth.uid() IS NOT NULL THEN
    BEGIN
      INSERT INTO admin_operation_logs (
        admin_user_id,
        operation_type,
        operation_details,
        success,
        organization_id
      ) VALUES (
        auth.uid(),
        'final_security_audit',
        jsonb_build_object(
          'table', TG_TABLE_NAME,
          'operation', TG_OP,
          'timestamp', extract(epoch from now()),
          'audit_complete', true
        ),
        true,
        get_current_user_organization_id_safe()
      );
    EXCEPTION
      WHEN OTHERS THEN
        -- Continue silently if audit fails
        NULL;
    END;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;