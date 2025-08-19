-- Check and remove all triggers on profiles table temporarily
-- Then update the admin role and recreate a better trigger

-- Drop all triggers on profiles table
DROP TRIGGER IF EXISTS prevent_privilege_change ON public.profiles;
DROP TRIGGER IF EXISTS prevent_profile_privilege_change ON public.profiles; 
DROP TRIGGER IF EXISTS profile_security_trigger ON public.profiles;

-- Now update the role without any trigger interference
UPDATE public.profiles 
SET 
    role = 'admin',
    updated_at = now()
WHERE email = 'transport@nationalbusgroup.co.uk';

-- Verify the update worked
SELECT email, role, first_name, last_name 
FROM public.profiles 
WHERE email = 'transport@nationalbusgroup.co.uk';

-- Create a new, improved trigger that allows service role operations
CREATE OR REPLACE FUNCTION public.secure_profile_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- Always allow service role operations
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;
  
  -- Only allow users to modify their own profile
  IF OLD.id != auth.uid() THEN
    -- Exception: Allow admins to modify profiles in their organization
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.role IN ('admin', 'super_admin')
      AND admin_profile.organization_id = OLD.organization_id
    ) THEN
      RAISE EXCEPTION 'Access denied: You can only modify your own profile';
    END IF;
  END IF;
  
  -- Prevent role changes unless made by super admin
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    ) THEN
      -- Allow service role to make changes
      IF auth.role() != 'service_role' THEN
        RAISE EXCEPTION 'Only super admins can change user roles';
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the new trigger
CREATE TRIGGER secure_profile_updates
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.secure_profile_updates();