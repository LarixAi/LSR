-- Fix Multiple Permissive Policies on weekly_rest table
-- This script resolves the issue with multiple permissive policies for the authenticator role

-- First, let's check what policies exist on the weekly_rest table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'weekly_rest';

-- Drop all existing policies on weekly_rest table
DROP POLICY IF EXISTS "Drivers can view their own weekly rest" ON public.weekly_rest;
DROP POLICY IF EXISTS "Drivers can insert their own weekly rest" ON public.weekly_rest;
DROP POLICY IF EXISTS "Drivers can update their own weekly rest" ON public.weekly_rest;
DROP POLICY IF EXISTS "Drivers can delete their own weekly rest" ON public.weekly_rest;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.weekly_rest;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.weekly_rest;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.weekly_rest;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.weekly_rest;

-- Create a single, comprehensive policy for drivers
CREATE POLICY "secure_drivers_weekly_rest_access" 
ON public.weekly_rest 
FOR ALL
TO authenticated
USING (
  driver_id = auth.uid()::text OR 
  driver_id = auth.uid()
)
WITH CHECK (
  driver_id = auth.uid()::text OR 
  driver_id = auth.uid()
);

-- Create a policy for service role access (for system operations)
CREATE POLICY "service_role_weekly_rest_access" 
ON public.weekly_rest 
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create a policy for admin access
CREATE POLICY "admin_weekly_rest_access" 
ON public.weekly_rest 
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Verify the policies were created correctly
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'weekly_rest'
ORDER BY policyname;

-- Display summary
SELECT 'Weekly Rest Policies Fixed Successfully!' as status;
SELECT 'Policies created:' as info;
SELECT 
  policyname,
  cmd,
  array_to_string(roles, ', ') as roles
FROM pg_policies 
WHERE tablename = 'weekly_rest'
ORDER BY policyname;
