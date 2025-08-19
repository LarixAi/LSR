-- Add missing database functions for backend operations

-- Function to get next background task (for background processor)
CREATE OR REPLACE FUNCTION public.get_next_background_task()
RETURNS TABLE(
  id UUID,
  task_type TEXT,
  payload JSONB,
  organization_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bt.id,
    bt.task_type,
    bt.payload,
    bt.organization_id
  FROM public.background_tasks bt
  WHERE bt.status = 'pending'
    AND bt.scheduled_at <= NOW()
  ORDER BY bt.priority DESC, bt.created_at ASC
  LIMIT 1;
END;
$$;

-- Function to complete background task
CREATE OR REPLACE FUNCTION public.complete_background_task(
  p_task_id UUID,
  p_status TEXT,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.background_tasks
  SET 
    status = p_status,
    completed_at = NOW(),
    error_message = p_error_message,
    updated_at = NOW()
  WHERE id = p_task_id;
END;
$$;

-- Function to validate user permissions
CREATE OR REPLACE FUNCTION public.validate_user_permission(
  p_user_id UUID,
  p_permission TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_role TEXT;
  has_permission BOOLEAN := FALSE;
BEGIN
  -- Get user role
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Check role-based permissions
  SELECT EXISTS(
    SELECT 1 FROM public.role_permissions rp
    WHERE rp.role = user_role::user_role
      AND rp.permission = p_permission
      AND rp.is_active = TRUE
  ) INTO has_permission;
  
  -- Check user-specific permissions if role doesn't grant access
  IF NOT has_permission THEN
    SELECT EXISTS(
      SELECT 1 FROM public.user_permissions up
      WHERE up.user_id = p_user_id
        AND up.permission = p_permission
        AND up.is_active = TRUE
        AND (p_resource_type IS NULL OR up.resource_type = p_resource_type)
        AND (p_resource_id IS NULL OR up.resource_id = p_resource_id)
    ) INTO has_permission;
  END IF;
  
  RETURN has_permission;
END;
$$;

-- Function to log user activity
CREATE OR REPLACE FUNCTION public.log_user_activity(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  log_id UUID;
  user_org_id UUID;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO user_org_id
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Insert activity log
  INSERT INTO public.user_activity_logs (
    user_id,
    organization_id,
    action,
    resource_type,
    resource_id,
    metadata
  ) VALUES (
    p_user_id,
    user_org_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Function to calculate route costs
CREATE OR REPLACE FUNCTION public.calculate_route_cost(
  p_route_id UUID,
  p_base_rate DECIMAL DEFAULT 0.50,
  p_fuel_rate DECIMAL DEFAULT 1.20,
  p_time_rate DECIMAL DEFAULT 25.00
)
RETURNS TABLE(
  total_cost DECIMAL,
  distance_cost DECIMAL,
  fuel_cost DECIMAL,
  time_cost DECIMAL,
  breakdown JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  route_distance DECIMAL := 0;
  route_duration INTEGER := 0; -- in minutes
  calculated_distance_cost DECIMAL;
  calculated_fuel_cost DECIMAL;
  calculated_time_cost DECIMAL;
  calculated_total DECIMAL;
BEGIN
  -- Get route details (you might need to calculate from stops)
  SELECT 
    COALESCE(r.estimated_distance, 0),
    COALESCE(r.estimated_duration, 0)
  INTO route_distance, route_duration
  FROM public.routes r
  WHERE r.id = p_route_id;
  
  -- Calculate costs
  calculated_distance_cost := route_distance * p_base_rate;
  calculated_fuel_cost := route_distance * p_fuel_rate;
  calculated_time_cost := (route_duration::DECIMAL / 60) * p_time_rate;
  calculated_total := calculated_distance_cost + calculated_fuel_cost + calculated_time_cost;
  
  RETURN QUERY SELECT
    calculated_total,
    calculated_distance_cost,
    calculated_fuel_cost,
    calculated_time_cost,
    jsonb_build_object(
      'distance_km', route_distance,
      'duration_minutes', route_duration,
      'base_rate_per_km', p_base_rate,
      'fuel_rate_per_km', p_fuel_rate,
      'time_rate_per_hour', p_time_rate
    );
END;
$$;

-- Function to check vehicle availability
CREATE OR REPLACE FUNCTION public.check_vehicle_availability(
  p_vehicle_id UUID,
  p_start_time TIMESTAMP WITH TIME ZONE,
  p_end_time TIMESTAMP WITH TIME ZONE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if vehicle has any conflicting bookings or jobs
  RETURN NOT EXISTS(
    SELECT 1 FROM public.jobs j
    WHERE j.assigned_vehicle_id = p_vehicle_id
      AND j.status IN ('scheduled', 'in_progress')
      AND (
        (j.pickup_datetime <= p_end_time AND j.dropoff_datetime >= p_start_time)
        OR
        (j.pickup_datetime BETWEEN p_start_time AND p_end_time)
        OR
        (j.dropoff_datetime BETWEEN p_start_time AND p_end_time)
      )
  ) AND NOT EXISTS(
    SELECT 1 FROM public.customer_bookings cb
    WHERE cb.assigned_vehicle_id = p_vehicle_id
      AND cb.status IN ('confirmed', 'in_progress')
      AND cb.pickup_datetime <= p_end_time
      AND (cb.pickup_datetime + INTERVAL '2 hours') >= p_start_time -- Assume 2h booking duration
  );
END;
$$;

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  invoice_num TEXT;
  sequence_val INTEGER;
BEGIN
  -- Get next sequence value
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 'INV-[0-9]{8}-([0-9]+)') AS INTEGER)), 0) + 1
  INTO sequence_val
  FROM public.invoices
  WHERE invoice_number LIKE 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-%';
  
  -- Generate invoice number: INV-YYYYMMDD-XXXX
  invoice_num := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(sequence_val::TEXT, 4, '0');
  
  RETURN invoice_num;
END;
$$;

-- Create background_tasks table if not exists
CREATE TABLE IF NOT EXISTS public.background_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  organization_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  priority INTEGER NOT NULL DEFAULT 5,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create user_activity_logs table if not exists
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create invoices table if not exists
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  customer_id UUID,
  organization_id UUID NOT NULL,
  job_id UUID,
  booking_id UUID,
  amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2),
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  due_date DATE,
  issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
  paid_date DATE,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add RLS for new tables
ALTER TABLE public.background_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS policies for background_tasks
CREATE POLICY "Admins can manage background tasks"
ON public.background_tasks FOR ALL
USING (organization_id IN (
  SELECT organization_id FROM public.profiles 
  WHERE id = auth.uid() AND role IN ('admin', 'council')
));

-- RLS policies for user_activity_logs
CREATE POLICY "Users can view own activity logs"
ON public.user_activity_logs FOR SELECT
USING (user_id = auth.uid() OR organization_id IN (
  SELECT organization_id FROM public.profiles 
  WHERE id = auth.uid() AND role IN ('admin', 'council')
));

-- RLS policies for invoices
CREATE POLICY "Organization members can view invoices"
ON public.invoices FOR SELECT
USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Admins can manage invoices"
ON public.invoices FOR ALL
USING (organization_id IN (
  SELECT organization_id FROM public.profiles 
  WHERE id = auth.uid() AND role IN ('admin', 'council')
));

-- Add triggers for updated_at
CREATE TRIGGER update_background_tasks_updated_at
  BEFORE UPDATE ON public.background_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();