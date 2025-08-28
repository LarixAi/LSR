-- Add RLS policies for vehicle_inspections table (only the ones that don't exist)
DO $$ 
BEGIN
  -- Check if policies exist before creating them
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vehicle_inspections' AND policyname = 'Organization members can view vehicle inspections') THEN
    CREATE POLICY "Organization members can view vehicle inspections" 
    ON public.vehicle_inspections 
    FOR SELECT 
    USING (
      organization_id IN (
        SELECT organization_id 
        FROM public.profiles 
        WHERE id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vehicle_inspections' AND policyname = 'Drivers can view their own inspections') THEN
    CREATE POLICY "Drivers can view their own inspections" 
    ON public.vehicle_inspections 
    FOR SELECT 
    USING (driver_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vehicle_inspections' AND policyname = 'Organization staff can manage vehicle inspections') THEN
    CREATE POLICY "Organization staff can manage vehicle inspections" 
    ON public.vehicle_inspections 
    FOR ALL 
    USING (
      organization_id IN (
        SELECT organization_id 
        FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'council', 'driver', 'mechanic')
      )
    );
  END IF;
END $$;