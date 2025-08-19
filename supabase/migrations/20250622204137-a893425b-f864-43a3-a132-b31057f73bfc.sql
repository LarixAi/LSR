
-- Drop existing policies that might be causing recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create simple, non-recursive policies for the profiles table
CREATE POLICY "Enable read access for users based on user_id" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);
