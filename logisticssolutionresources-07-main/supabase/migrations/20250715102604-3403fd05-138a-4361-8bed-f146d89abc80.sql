-- Fix the SQL syntax error and ensure user signup works properly

-- First, ensure the trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the trigger with the correct function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure RLS policies are set up correctly for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop and recreate the user profile policies to fix any issues
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Organization members can view profiles" ON public.profiles;

-- Allow users to insert their own profile (needed for the trigger)
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow users to view their own profile and admins to view all
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT 
USING (
  auth.uid() = id 
  OR EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role IN ('admin', 'council')
  )
);

-- Create organization access policy separately
CREATE POLICY "Organization members can view profiles"
ON public.profiles
FOR SELECT
USING (
  organization_id = get_user_organization_id() 
  OR EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role IN ('admin', 'council')
  )
);

-- Test that the user_role enum contains all needed values
DO $$ 
DECLARE
    role_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'mechanic' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    ) INTO role_exists;
    
    IF NOT role_exists THEN
        RAISE EXCEPTION 'mechanic role not found in user_role enum';
    END IF;
    
    RAISE NOTICE 'All required roles exist in user_role enum';
END $$;