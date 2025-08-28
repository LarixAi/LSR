-- First, let's check and fix the vehicles table RLS policies

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view organization vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can manage organization vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Admins can manage organization vehicles" ON public.vehicles;

-- Create proper RLS policies for vehicles table
CREATE POLICY "Users can view organization vehicles" 
ON public.vehicles 
FOR SELECT 
USING (organization_id IN (
  SELECT organization_id 
  FROM profiles 
  WHERE id = auth.uid()
));

CREATE POLICY "Users can create vehicles in their organization" 
ON public.vehicles 
FOR INSERT 
WITH CHECK (organization_id IN (
  SELECT organization_id 
  FROM profiles 
  WHERE id = auth.uid()
));

CREATE POLICY "Admins can update organization vehicles" 
ON public.vehicles 
FOR UPDATE 
USING (organization_id IN (
  SELECT organization_id 
  FROM profiles 
  WHERE id = auth.uid() 
  AND role IN ('admin', 'council')
));

CREATE POLICY "Admins can delete organization vehicles" 
ON public.vehicles 
FOR DELETE 
USING (organization_id IN (
  SELECT organization_id 
  FROM profiles 
  WHERE id = auth.uid() 
  AND role IN ('admin', 'council')
));

-- Also clean up any vehicles that might be from test organizations
DELETE FROM public.vehicles 
WHERE organization_id IN (
  SELECT id FROM organizations 
  WHERE name ILIKE '%test%' OR name ILIKE '%sample%' OR name ILIKE '%bus group%'
);