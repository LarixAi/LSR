
-- Drop existing policies for admins and council on vehicle_checks
DROP POLICY IF EXISTS "Admins and council can view organization vehicle checks" ON public.vehicle_checks;

-- Create comprehensive policies for admins and council
CREATE POLICY "Admins and council can manage all vehicle checks" 
  ON public.vehicle_checks 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'council')
    )
  );

-- Ensure drivers can still view and manage their own checks
-- (The existing driver policies should remain as they are)
