-- Critical Security Fixes - Phase 1: Database Security

-- 1. Add organization_id to child_profiles table for proper isolation
ALTER TABLE public.child_profiles 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

-- 2. Update existing child_profiles with organization_id from their parents
UPDATE public.child_profiles 
SET organization_id = profiles.organization_id
FROM public.profiles 
WHERE child_profiles.parent_id = profiles.id;

-- 3. Make organization_id NOT NULL after data migration
ALTER TABLE public.child_profiles 
ALTER COLUMN organization_id SET NOT NULL;

-- 4. Create proper RLS policies for child_profiles with organization isolation
DROP POLICY IF EXISTS "Parents can view own children" ON public.child_profiles;
DROP POLICY IF EXISTS "Parents can insert own children" ON public.child_profiles;
DROP POLICY IF EXISTS "Parents can update own children" ON public.child_profiles;
DROP POLICY IF EXISTS "Parents can delete own children" ON public.child_profiles;
DROP POLICY IF EXISTS "Admins can view all children" ON public.child_profiles;

CREATE POLICY "Parents can view own children in organization" 
ON public.child_profiles 
FOR SELECT 
USING (
  auth.uid() = parent_id 
  AND organization_id = get_current_user_organization_id_safe()
);

CREATE POLICY "Parents can insert own children in organization" 
ON public.child_profiles 
FOR INSERT 
WITH CHECK (
  auth.uid() = parent_id 
  AND organization_id = get_current_user_organization_id_safe()
);

CREATE POLICY "Parents can update own children in organization" 
ON public.child_profiles 
FOR UPDATE 
USING (
  auth.uid() = parent_id 
  AND organization_id = get_current_user_organization_id_safe()
);

CREATE POLICY "Parents can delete own children in organization" 
ON public.child_profiles 
FOR DELETE 
USING (
  auth.uid() = parent_id 
  AND organization_id = get_current_user_organization_id_safe()
);

CREATE POLICY "Admins can manage all children in organization" 
ON public.child_profiles 
FOR ALL 
USING (
  organization_id = get_current_user_organization_id_safe() 
  AND is_current_user_admin_safe()
)
WITH CHECK (
  organization_id = get_current_user_organization_id_safe() 
  AND is_current_user_admin_safe()
);

-- 5. Enable RLS on tables that are missing it
ALTER TABLE public.child_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_registration_steps ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for child_documents
CREATE POLICY "Parents can manage their children's documents" 
ON public.child_documents 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp 
    WHERE cp.id = child_documents.child_id::uuid 
    AND cp.parent_id = auth.uid()
    AND cp.organization_id = get_current_user_organization_id_safe()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp 
    WHERE cp.id = child_documents.child_id::uuid 
    AND cp.parent_id = auth.uid()
    AND cp.organization_id = get_current_user_organization_id_safe()
  )
);

CREATE POLICY "Admins can manage all child documents in organization" 
ON public.child_documents 
FOR ALL 
USING (
  is_current_user_admin_safe() 
  AND EXISTS (
    SELECT 1 FROM public.child_profiles cp 
    WHERE cp.id = child_documents.child_id::uuid 
    AND cp.organization_id = get_current_user_organization_id_safe()
  )
)
WITH CHECK (
  is_current_user_admin_safe() 
  AND EXISTS (
    SELECT 1 FROM public.child_profiles cp 
    WHERE cp.id = child_documents.child_id::uuid 
    AND cp.organization_id = get_current_user_organization_id_safe()
  )
);

-- 7. Create RLS policies for child_registration_steps
CREATE POLICY "Parents can manage their children's registration steps" 
ON public.child_registration_steps 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp 
    WHERE cp.id = child_registration_steps.child_id::uuid 
    AND cp.parent_id = auth.uid()
    AND cp.organization_id = get_current_user_organization_id_safe()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.child_profiles cp 
    WHERE cp.id = child_registration_steps.child_id::uuid 
    AND cp.parent_id = auth.uid()
    AND cp.organization_id = get_current_user_organization_id_safe()
  )
);

CREATE POLICY "Admins can manage all registration steps in organization" 
ON public.child_registration_steps 
FOR ALL 
USING (
  is_current_user_admin_safe() 
  AND EXISTS (
    SELECT 1 FROM public.child_profiles cp 
    WHERE cp.id = child_registration_steps.child_id::uuid 
    AND cp.organization_id = get_current_user_organization_id_safe()
  )
)
WITH CHECK (
  is_current_user_admin_safe() 
  AND EXISTS (
    SELECT 1 FROM public.child_profiles cp 
    WHERE cp.id = child_registration_steps.child_id::uuid 
    AND cp.organization_id = get_current_user_organization_id_safe()
  )
);

-- 8. Add security monitoring trigger for child data access
CREATE OR REPLACE FUNCTION public.log_child_data_access_enhanced()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if we have a valid auth context
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO admin_operation_logs (
      admin_user_id,
      operation_type,
      operation_details,
      success,
      organization_id
    ) VALUES (
      auth.uid(),
      'child_data_access',
      jsonb_build_object(
        'table_name', TG_TABLE_NAME,
        'operation', TG_OP,
        'child_id', COALESCE(NEW.id, NEW.child_id, OLD.id, OLD.child_id),
        'timestamp', extract(epoch from now()),
        'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for'
      ),
      true,
      get_current_user_organization_id_safe()
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add triggers for child data access monitoring
DROP TRIGGER IF EXISTS child_profiles_access_log ON public.child_profiles;
CREATE TRIGGER child_profiles_access_log
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.child_profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_child_data_access_enhanced();

DROP TRIGGER IF EXISTS child_documents_access_log ON public.child_documents;
CREATE TRIGGER child_documents_access_log
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.child_documents
  FOR EACH ROW EXECUTE FUNCTION public.log_child_data_access_enhanced();