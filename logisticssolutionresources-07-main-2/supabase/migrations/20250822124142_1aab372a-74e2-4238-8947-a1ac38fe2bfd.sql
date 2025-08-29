-- Fix final issues: Add missing RLS policy for emergency_contacts table

-- Add RLS policies for emergency_contacts table  
CREATE POLICY "Organization users can manage emergency contacts" 
ON public.emergency_contacts 
FOR ALL 
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.organization_id = (
      SELECT organization_id FROM public.profiles 
      WHERE id = emergency_contacts.user_id
    )
  )
);

-- Add insert policy for emergency contacts
CREATE POLICY "Users can create their own emergency contacts" 
ON public.emergency_contacts 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
);

-- Add select policy for emergency contacts  
CREATE POLICY "Users can view own emergency contacts" 
ON public.emergency_contacts 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'council', 'super_admin')
      AND p.organization_id = (
        SELECT organization_id FROM public.profiles 
        WHERE id = emergency_contacts.user_id
      )
    )
  )
);

-- Create audit function for enhanced monitoring
CREATE OR REPLACE FUNCTION public.enhanced_audit_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log all sensitive table operations for security monitoring
  IF TG_TABLE_NAME IN ('support_tickets', 'vehicle_checks', 'emergency_contacts', 'driver_licenses') THEN
    INSERT INTO admin_operation_logs (
      admin_user_id,
      operation_type,
      operation_details,
      success,
      organization_id
    ) VALUES (
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
      'table_access',
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'record_id', COALESCE(NEW.id, OLD.id),
        'timestamp', extract(epoch from now()),
        'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
      ),
      true,
      COALESCE(
        NEW.organization_id, 
        OLD.organization_id,
        get_current_user_organization_id_safe()
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
EXCEPTION
  WHEN OTHERS THEN
    -- Continue operation even if logging fails
    RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Add audit triggers to sensitive tables
CREATE TRIGGER enhanced_audit_emergency_contacts
    AFTER INSERT OR UPDATE OR DELETE
    ON public.emergency_contacts
    FOR EACH ROW
    EXECUTE FUNCTION public.enhanced_audit_log();