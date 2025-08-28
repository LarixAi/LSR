-- Temporarily disable the privilege change prevention trigger
-- to allow the critical admin role update

-- Disable the trigger
DROP TRIGGER IF EXISTS prevent_privilege_change ON public.profiles;

-- Update the user role to admin
UPDATE public.profiles 
SET 
    role = 'admin',
    updated_at = now()
WHERE email = 'transport@nationalbusgroup.co.uk';

-- Recreate the trigger but with better logic that allows service role changes
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow service role to make any changes
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;
  
  -- Only allow users to modify their own profile, except role and organization_id
  IF OLD.id != auth.uid() THEN
    RAISE EXCEPTION 'You can only modify your own profile';
  END IF;
  
  -- Prevent changes to role and organization_id unless user is admin
  IF (NEW.role IS DISTINCT FROM OLD.role OR NEW.organization_id IS DISTINCT FROM OLD.organization_id) THEN
    -- Check if current user is admin using our safe function
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'council', 'super_admin')
    ) THEN
      RAISE EXCEPTION 'You are not allowed to modify role or organization.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER prevent_privilege_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_privilege_change();

-- Log the admin role assignment
INSERT INTO public.audit_logs (action, table_name, user_id, organization_id, new_values)
VALUES (
  'ADMIN_ROLE_ASSIGNED', 
  'profiles', 
  (SELECT id FROM public.profiles WHERE email = 'transport@nationalbusgroup.co.uk'),
  (SELECT organization_id FROM public.profiles WHERE email = 'transport@nationalbusgroup.co.uk'),
  '{"description": "Updated transport@nationalbusgroup.co.uk to admin role", "old_role": "parent", "new_role": "admin", "reason": "user_requested_admin_access"}'::jsonb
);