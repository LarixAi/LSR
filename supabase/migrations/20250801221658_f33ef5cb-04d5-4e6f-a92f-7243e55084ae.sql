-- Create table for storing GPS tracking during vehicle inspections
CREATE TABLE public.vehicle_inspection_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_id UUID NOT NULL,
  driver_id UUID NOT NULL,
  step_position INTEGER NOT NULL,
  latitude NUMERIC(10, 8) NOT NULL,
  longitude NUMERIC(11, 8) NOT NULL,
  accuracy NUMERIC,
  heading NUMERIC,
  speed NUMERIC,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  step_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vehicle_inspection_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for vehicle inspection tracking
CREATE POLICY "Drivers can create their own tracking data" 
ON public.vehicle_inspection_tracking 
FOR INSERT 
WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers can view their own tracking data" 
ON public.vehicle_inspection_tracking 
FOR SELECT 
USING (auth.uid() = driver_id);

CREATE POLICY "Admins can view all tracking data" 
ON public.vehicle_inspection_tracking 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = ANY(ARRAY['admin'::user_role, 'council'::user_role, 'compliance_officer'::user_role])
));

-- Create index for better performance
CREATE INDEX idx_vehicle_inspection_tracking_inspection_id ON public.vehicle_inspection_tracking(inspection_id);
CREATE INDEX idx_vehicle_inspection_tracking_driver_timestamp ON public.vehicle_inspection_tracking(driver_id, timestamp);

-- Create table for storing inspection sessions with metadata
CREATE TABLE public.vehicle_inspection_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL,
  vehicle_id UUID,
  vehicle_type TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  start_latitude NUMERIC(10, 8),
  start_longitude NUMERIC(11, 8),
  end_latitude NUMERIC(10, 8),
  end_longitude NUMERIC(11, 8),
  total_steps INTEGER DEFAULT 0,
  completed_steps INTEGER DEFAULT 0,
  distance_traveled NUMERIC,
  inspection_status TEXT DEFAULT 'in_progress',
  compliance_verified BOOLEAN DEFAULT false,
  verified_by UUID,
  verification_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vehicle_inspection_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for inspection sessions
CREATE POLICY "Drivers can manage their own inspection sessions" 
ON public.vehicle_inspection_sessions 
FOR ALL 
USING (auth.uid() = driver_id);

CREATE POLICY "Admins can view all inspection sessions" 
ON public.vehicle_inspection_sessions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = ANY(ARRAY['admin'::user_role, 'council'::user_role, 'compliance_officer'::user_role])
));

CREATE POLICY "Compliance team can update verification status" 
ON public.vehicle_inspection_sessions 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = ANY(ARRAY['admin'::user_role, 'council'::user_role, 'compliance_officer'::user_role])
));

-- Create index for better performance
CREATE INDEX idx_vehicle_inspection_sessions_driver_date ON public.vehicle_inspection_sessions(driver_id, start_time);
CREATE INDEX idx_vehicle_inspection_sessions_status ON public.vehicle_inspection_sessions(inspection_status);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_vehicle_inspection_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vehicle_inspection_sessions_updated_at
  BEFORE UPDATE ON public.vehicle_inspection_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_vehicle_inspection_sessions_updated_at();