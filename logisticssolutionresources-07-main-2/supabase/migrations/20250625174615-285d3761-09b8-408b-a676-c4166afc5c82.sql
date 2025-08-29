
-- Drop all existing policies that might be causing recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Drop the existing function that might be causing issues
DROP FUNCTION IF EXISTS public.get_current_user_role();

-- Create a simple, non-recursive security definer function
CREATE OR REPLACE FUNCTION public.get_user_role_safe(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = user_id LIMIT 1;
    RETURN COALESCE(user_role, 'parent');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create simple, non-recursive policies
CREATE POLICY "Enable read access for own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable insert access for own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update access for own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable delete access for own profile" ON public.profiles
    FOR DELETE USING (auth.uid() = id);

-- Create admin policies using the safe function
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.get_user_role_safe(auth.uid()) = 'admin');

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (public.get_user_role_safe(auth.uid()) = 'admin');
