-- Fix emergency_contacts RLS policies with correct column names

-- First check what columns exist and create appropriate policies
-- Add RLS policies for emergency_contacts table using correct column structure

CREATE POLICY "Users can manage their emergency contacts" 
ON public.emergency_contacts 
FOR ALL 
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND (
      -- Allow if user owns the contact or is admin in same org
      p.id = emergency_contacts.profile_id OR
      (p.role IN ('admin', 'council', 'super_admin') AND 
       p.organization_id = (
         SELECT organization_id FROM public.profiles 
         WHERE id = emergency_contacts.profile_id
       ))
    )
  )
);

-- Create enhanced security monitoring function with proper search path
CREATE OR REPLACE FUNCTION public.enhanced_security_monitoring()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Enhanced security monitoring for sensitive operations
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO admin_operation_logs (
      admin_user_id,
      operation_type,
      operation_details,
      success,
      organization_id
    ) VALUES (
      auth.uid(),
      'enhanced_table_access',
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'record_id', COALESCE(NEW.id, OLD.id),
        'timestamp', extract(epoch from now()),
        'security_level', 'enhanced'
      ),
      true,
      get_current_user_organization_id_safe()
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
EXCEPTION
  WHEN OTHERS THEN
    -- Continue operation even if logging fails
    RETURN COALESCE(NEW, OLD);
END;
$function$;