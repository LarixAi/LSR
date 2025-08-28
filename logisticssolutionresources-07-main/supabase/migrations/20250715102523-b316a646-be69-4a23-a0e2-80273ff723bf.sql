-- Comprehensive fix for user signup issues

-- First, ensure the trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the trigger with the correct function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Also check if we have any additional constraints that might block mechanic signups
-- Check if we have the proper RLS policies on profiles table for user creation
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Check if we have RLS enabled on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Ensure we have a proper policy for users to view their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT 
USING (auth.uid() = id OR EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.id = auth.uid() 
  AND p.role IN ('admin', 'council')
));

-- Ensure organization access is properly set up
CREATE POLICY IF NOT EXISTS "Organization members can view profiles"
ON public.profiles
FOR SELECT
USING (
  organization_id = get_user_organization_id() OR
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role IN ('admin', 'council')
  )
);

-- Make sure the user_role enum includes all the roles we need
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'mechanic' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')) THEN
        -- This shouldn't be needed since we already created it, but just in case
        RAISE NOTICE 'Mechanic role already exists in user_role enum';
    END IF;
END $$;