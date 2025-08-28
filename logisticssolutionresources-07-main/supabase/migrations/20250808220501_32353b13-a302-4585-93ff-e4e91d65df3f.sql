-- Create email_templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  organization_id uuid,
  created_by uuid NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Policies for email_templates
CREATE POLICY "Org members can view email templates"
ON public.email_templates
FOR SELECT
USING (
  organization_id IN (
    SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()
  )
);

CREATE POLICY "Users can insert templates in their org"
ON public.email_templates
FOR INSERT
WITH CHECK (
  created_by = auth.uid() AND organization_id IN (
    SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()
  )
);

CREATE POLICY "Creators can update their templates"
ON public.email_templates
FOR UPDATE
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Admins can manage templates"
ON public.email_templates
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('admin','council')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('admin','council')
  )
);

-- Create email_logs table
CREATE TABLE IF NOT EXISTS public.email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email text NOT NULL,
  recipient_name text,
  subject text NOT NULL,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  sent_at timestamptz NOT NULL DEFAULT now(),
  template_used uuid,
  organization_id uuid,
  sent_by uuid NOT NULL,
  error_message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Policies for email_logs
CREATE POLICY "Org members can view email logs"
ON public.email_logs
FOR SELECT
USING (
  organization_id IN (
    SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()
  )
);

CREATE POLICY "Users can insert own email logs"
ON public.email_logs
FOR INSERT
WITH CHECK (
  sent_by = auth.uid() AND organization_id IN (
    SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()
  )
);

CREATE POLICY "Users can update their own email logs"
ON public.email_logs
FOR UPDATE
USING (sent_by = auth.uid())
WITH CHECK (sent_by = auth.uid());

CREATE POLICY "Admins can manage email logs"
ON public.email_logs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('admin','council')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('admin','council')
  )
);

-- Create vehicle_inspection_sessions table
CREATE TABLE IF NOT EXISTS public.vehicle_inspection_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid,
  driver_id uuid NOT NULL,
  vehicle_id uuid NOT NULL,
  vehicle_type text NOT NULL DEFAULT 'unknown',
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  start_latitude numeric,
  start_longitude numeric,
  end_latitude numeric,
  end_longitude numeric,
  total_steps integer NOT NULL DEFAULT 0,
  completed_steps integer NOT NULL DEFAULT 0,
  distance_traveled numeric,
  inspection_status text NOT NULL DEFAULT 'in_progress',
  compliance_verified boolean NOT NULL DEFAULT false,
  verified_by uuid,
  verification_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vehicle_inspection_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for vehicle_inspection_sessions
CREATE POLICY "Org members can view inspection sessions"
ON public.vehicle_inspection_sessions
FOR SELECT
USING (
  organization_id IN (
    SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()
  )
);

CREATE POLICY "Drivers can insert their own inspection sessions"
ON public.vehicle_inspection_sessions
FOR INSERT
WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Drivers can update their own inspection sessions"
ON public.vehicle_inspection_sessions
FOR UPDATE
USING (driver_id = auth.uid())
WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Admins can manage inspection sessions"
ON public.vehicle_inspection_sessions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('admin','council')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('admin','council')
  )
);

-- Create vehicle_inspection_tracking table
CREATE TABLE IF NOT EXISTS public.vehicle_inspection_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id uuid NOT NULL,
  step_position integer NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  accuracy numeric,
  timestamp timestamptz NOT NULL DEFAULT now(),
  step_name text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vehicle_inspection_tracking ENABLE ROW LEVEL SECURITY;

-- Policies for vehicle_inspection_tracking
CREATE POLICY "Org members can view inspection tracking"
ON public.vehicle_inspection_tracking
FOR SELECT
USING (
  inspection_id IN (
    SELECT vis.id FROM public.vehicle_inspection_sessions vis
    WHERE vis.organization_id IN (
      SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()
    )
  )
);

CREATE POLICY "Drivers can insert their own tracking points"
ON public.vehicle_inspection_tracking
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.vehicle_inspection_sessions vis
    WHERE vis.id = vehicle_inspection_tracking.inspection_id AND vis.driver_id = auth.uid()
  )
);

CREATE POLICY "Drivers can update their own tracking points"
ON public.vehicle_inspection_tracking
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.vehicle_inspection_sessions vis
    WHERE vis.id = vehicle_inspection_tracking.inspection_id AND vis.driver_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.vehicle_inspection_sessions vis
    WHERE vis.id = vehicle_inspection_tracking.inspection_id AND vis.driver_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage inspection tracking"
ON public.vehicle_inspection_tracking
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('admin','council')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('admin','council')
  )
);

-- Trigger function already exists: public.update_updated_at_column

-- Triggers to keep updated_at in sync
DROP TRIGGER IF EXISTS trg_update_email_templates_updated_at ON public.email_templates;
CREATE TRIGGER trg_update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_update_vehicle_inspection_sessions_updated_at ON public.vehicle_inspection_sessions;
CREATE TRIGGER trg_update_vehicle_inspection_sessions_updated_at
BEFORE UPDATE ON public.vehicle_inspection_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();