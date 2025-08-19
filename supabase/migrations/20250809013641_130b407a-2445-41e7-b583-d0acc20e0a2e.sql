-- Fix recursive RLS causing 500 on profiles fetch and implement safe role-based access
-- 1) Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2) Drop existing policies on profiles to remove recursive ones
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', r.policyname);
  END LOOP;
END $$;

-- 3) Create minimal, non-recursive policies
-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid() OR user_id = auth.uid());

-- Users can insert their own profile (in case upsert runs without service role)
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid() OR user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid() OR user_id = auth.uid());

-- Admins can view all profiles (uses SECURITY DEFINER function to avoid recursion)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin_user(auth.uid()));

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.is_admin_user(auth.uid()));
