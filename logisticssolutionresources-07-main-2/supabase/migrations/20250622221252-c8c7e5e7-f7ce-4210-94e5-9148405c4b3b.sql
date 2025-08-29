
-- Create vehicle_checks table
CREATE TABLE public.vehicle_checks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid REFERENCES auth.users NOT NULL,
  vehicle_id uuid REFERENCES public.vehicles(id) NOT NULL,
  organization_id uuid REFERENCES public.organizations(id),
  check_date date NOT NULL DEFAULT CURRENT_DATE,
  check_time time NOT NULL DEFAULT CURRENT_TIME,
  status text NOT NULL DEFAULT 'completed',
  
  -- Vehicle condition checks
  engine_condition text NOT NULL DEFAULT 'good',
  brakes_condition text NOT NULL DEFAULT 'good',
  tires_condition text NOT NULL DEFAULT 'good',
  lights_condition text NOT NULL DEFAULT 'good',
  interior_condition text NOT NULL DEFAULT 'good',
  exterior_condition text NOT NULL DEFAULT 'good',
  
  -- Additional checks
  fuel_level integer CHECK (fuel_level >= 0 AND fuel_level <= 100),
  mileage integer,
  notes text,
  
  -- Issues and maintenance
  issues_reported text[],
  requires_maintenance boolean DEFAULT false,
  maintenance_priority text DEFAULT 'low' CHECK (maintenance_priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Photos/documentation
  photo_urls text[],
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.vehicle_checks ENABLE ROW LEVEL SECURITY;

-- Drivers can view their own checks
CREATE POLICY "Drivers can view their own vehicle checks" 
  ON public.vehicle_checks 
  FOR SELECT 
  USING (auth.uid() = driver_id);

-- Drivers can create their own checks
CREATE POLICY "Drivers can create vehicle checks" 
  ON public.vehicle_checks 
  FOR INSERT 
  WITH CHECK (auth.uid() = driver_id);

-- Drivers can update their own checks
CREATE POLICY "Drivers can update their own vehicle checks" 
  ON public.vehicle_checks 
  FOR UPDATE 
  USING (auth.uid() = driver_id);

-- Admins and council can view all checks in their organization
CREATE POLICY "Admins and council can view organization vehicle checks" 
  ON public.vehicle_checks 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'council')
    )
  );

-- Create an index for faster queries
CREATE INDEX idx_vehicle_checks_driver_date ON public.vehicle_checks(driver_id, check_date DESC);
CREATE INDEX idx_vehicle_checks_organization ON public.vehicle_checks(organization_id);
CREATE INDEX idx_vehicle_checks_vehicle ON public.vehicle_checks(vehicle_id);
