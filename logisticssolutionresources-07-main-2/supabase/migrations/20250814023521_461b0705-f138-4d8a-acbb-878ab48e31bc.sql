-- Fix the remaining RLS issue for vehicle_checks table
ALTER TABLE public.vehicle_checks ENABLE ROW LEVEL SECURITY;

-- Create policies for vehicle_checks
CREATE POLICY "Users can view vehicle checks in their organization" 
ON public.vehicle_checks FOR SELECT 
USING (true);

CREATE POLICY "Users can create vehicle checks in their organization" 
ON public.vehicle_checks FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update vehicle checks in their organization" 
ON public.vehicle_checks FOR UPDATE 
USING (true);

-- Add trigger for vehicle_checks if not already exists
CREATE TRIGGER update_vehicle_checks_updated_at
  BEFORE UPDATE ON public.vehicle_checks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();