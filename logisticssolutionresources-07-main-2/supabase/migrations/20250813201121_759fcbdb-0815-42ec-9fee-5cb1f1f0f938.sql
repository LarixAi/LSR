-- Update the secure_profile_change_prevention function to allow service_role operations
CREATE OR REPLACE FUNCTION public.secure_profile_change_prevention()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Always allow service role operations (for migrations and system operations)
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;
  
  -- Allow users to modify their own profiles (except role/org changes)
  IF OLD.id = auth.uid() THEN
    -- Prevent role/organization changes by regular users
    IF (NEW.role IS DISTINCT FROM OLD.role OR NEW.organization_id IS DISTINCT FROM OLD.organization_id) THEN
      -- Only super admins can change roles
      IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'super_admin'
      ) THEN
        RAISE EXCEPTION 'Only super administrators can modify user roles or organizations';
      END IF;
    END IF;
    RETURN NEW;
  END IF;
  
  -- Allow admins to modify profiles within their organization
  IF EXISTS (
    SELECT 1 FROM public.profiles admin_profile
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role IN ('admin', 'super_admin')
    AND admin_profile.organization_id = OLD.organization_id
  ) THEN
    RETURN NEW;
  END IF;
  
  -- Default: deny access
  RAISE EXCEPTION 'Access denied: Insufficient permissions to modify this profile';
  
  RETURN NEW;
END;
$$;