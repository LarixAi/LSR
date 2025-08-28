-- Create tire management system tables
CREATE TABLE public.tire_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  tire_brand TEXT NOT NULL,
  tire_model TEXT NOT NULL,
  tire_size TEXT NOT NULL, -- e.g. "295/80R22.5"
  tire_type TEXT NOT NULL CHECK (tire_type IN ('drive', 'steer', 'trailer', 'all_position')),
  load_index INTEGER NOT NULL, -- e.g. 152 for truck tires
  speed_rating TEXT NOT NULL, -- e.g. "L" for 120km/h
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  minimum_stock INTEGER NOT NULL DEFAULT 5,
  cost_per_tire DECIMAL(10,2),
  supplier TEXT,
  purchase_date DATE,
  warranty_months INTEGER DEFAULT 24,
  location_storage TEXT, -- where stored in depot
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vehicle tire tracking table
CREATE TABLE public.vehicle_tires (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('front_left', 'front_right', 'rear_left_outer', 'rear_left_inner', 'rear_right_outer', 'rear_right_inner', 'spare')),
  tire_inventory_id UUID REFERENCES public.tire_inventory(id),
  serial_number TEXT, -- tire's unique serial number
  installation_date DATE NOT NULL,
  installation_mileage INTEGER,
  current_tread_depth DECIMAL(3,1), -- in mm
  last_inspection_date DATE,
  next_inspection_due DATE,
  pressure_psi INTEGER,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'worn', 'damaged', 'replaced', 'rotated')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(vehicle_id, position, status) DEFERRABLE INITIALLY DEFERRED
);

-- Create tire inspection records
CREATE TABLE public.tire_inspections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_tire_id UUID NOT NULL REFERENCES public.vehicle_tires(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL,
  inspector_id UUID NOT NULL,
  inspection_date DATE NOT NULL DEFAULT CURRENT_DATE,
  tread_depth_mm DECIMAL(3,1) NOT NULL,
  pressure_psi INTEGER,
  condition TEXT NOT NULL CHECK (condition IN ('excellent', 'good', 'fair', 'poor', 'dangerous')),
  issues_found TEXT[], -- array of issues like 'uneven_wear', 'cuts', 'bulges', 'embedded_objects'
  action_required TEXT CHECK (action_required IN ('none', 'monitor', 'rotate', 'replace_soon', 'replace_immediate')),
  notes TEXT,
  compliance_status TEXT NOT NULL DEFAULT 'compliant' CHECK (compliance_status IN ('compliant', 'advisory', 'defect')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tire maintenance/replacement records
CREATE TABLE public.tire_maintenance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL,
  maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('replacement', 'rotation', 'repair', 'pressure_adjustment')),
  old_tire_id UUID REFERENCES public.vehicle_tires(id),
  new_tire_id UUID REFERENCES public.vehicle_tires(id),
  positions_affected TEXT[], -- array of positions affected
  performed_by UUID NOT NULL,
  performed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  vehicle_mileage INTEGER,
  reason TEXT NOT NULL, -- why the maintenance was performed
  cost DECIMAL(10,2),
  warranty_until DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tire alerts/notifications
CREATE TABLE public.tire_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  vehicle_tire_id UUID REFERENCES public.vehicle_tires(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('low_tread', 'low_pressure', 'overdue_inspection', 'low_stock', 'warranty_expiring')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  threshold_value DECIMAL(10,2), -- the value that triggered the alert
  current_value DECIMAL(10,2), -- current measured value
  due_date DATE, -- when action is due
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_tire_inventory_organization ON public.tire_inventory(organization_id);
CREATE INDEX idx_tire_inventory_stock ON public.tire_inventory(organization_id, stock_quantity) WHERE stock_quantity <= minimum_stock;
CREATE INDEX idx_vehicle_tires_vehicle ON public.vehicle_tires(vehicle_id);
CREATE INDEX idx_vehicle_tires_organization ON public.vehicle_tires(organization_id);
CREATE INDEX idx_tire_inspections_vehicle ON public.tire_inspections(vehicle_id);
CREATE INDEX idx_tire_inspections_date ON public.tire_inspections(inspection_date DESC);
CREATE INDEX idx_tire_maintenance_vehicle ON public.tire_maintenance(vehicle_id);
CREATE INDEX idx_tire_alerts_organization ON public.tire_alerts(organization_id);
CREATE INDEX idx_tire_alerts_status ON public.tire_alerts(organization_id, status) WHERE status = 'active';

-- Enable RLS on all tables
ALTER TABLE public.tire_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_tires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tire_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tire_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tire_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tire management
CREATE POLICY "Organization members can view tire inventory" 
ON public.tire_inventory FOR SELECT 
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage tire inventory" 
ON public.tire_inventory FOR ALL 
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'council', 'mechanic')));

CREATE POLICY "Organization members can view vehicle tires" 
ON public.vehicle_tires FOR SELECT 
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Authorized staff can manage vehicle tires" 
ON public.vehicle_tires FOR ALL 
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'council', 'mechanic', 'driver')));

CREATE POLICY "Organization members can view tire inspections" 
ON public.tire_inspections FOR SELECT 
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Authorized staff can create tire inspections" 
ON public.tire_inspections FOR INSERT 
WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'council', 'mechanic', 'driver')));

CREATE POLICY "Organization members can view tire maintenance" 
ON public.tire_maintenance FOR SELECT 
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Authorized staff can manage tire maintenance" 
ON public.tire_maintenance FOR ALL 
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'council', 'mechanic')));

CREATE POLICY "Organization members can view tire alerts" 
ON public.tire_alerts FOR SELECT 
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Authorized staff can manage tire alerts" 
ON public.tire_alerts FOR ALL 
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'council', 'mechanic')));

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_tire_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '';

CREATE TRIGGER update_tire_inventory_updated_at
    BEFORE UPDATE ON public.tire_inventory
    FOR EACH ROW
    EXECUTE FUNCTION public.update_tire_updated_at();

CREATE TRIGGER update_vehicle_tires_updated_at
    BEFORE UPDATE ON public.vehicle_tires
    FOR EACH ROW
    EXECUTE FUNCTION public.update_tire_updated_at();

-- Create functions for tire management
CREATE OR REPLACE FUNCTION public.check_tire_tread_depth(p_vehicle_id UUID)
RETURNS TABLE(
  tire_id UUID,
  position TEXT,
  current_depth DECIMAL,
  status TEXT,
  action_required TEXT
) 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vt.id,
    vt.position,
    vt.current_tread_depth,
    CASE 
      WHEN vt.current_tread_depth < 1.6 THEN 'illegal'
      WHEN vt.current_tread_depth < 2.0 THEN 'warning'
      WHEN vt.current_tread_depth < 3.0 THEN 'advisory'
      ELSE 'good'
    END::TEXT,
    CASE 
      WHEN vt.current_tread_depth < 1.6 THEN 'replace_immediate'
      WHEN vt.current_tread_depth < 2.0 THEN 'replace_soon'
      WHEN vt.current_tread_depth < 3.0 THEN 'monitor'
      ELSE 'none'
    END::TEXT
  FROM public.vehicle_tires vt
  WHERE vt.vehicle_id = p_vehicle_id 
    AND vt.status = 'active';
END;
$$;

-- Function to generate tire alerts
CREATE OR REPLACE FUNCTION public.generate_tire_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  tire_record RECORD;
  org_id UUID;
BEGIN
  -- Check for low tread depth
  FOR tire_record IN 
    SELECT vt.*, v.organization_id, v.vehicle_number
    FROM public.vehicle_tires vt
    JOIN public.vehicles v ON vt.vehicle_id = v.id
    WHERE vt.current_tread_depth IS NOT NULL 
      AND vt.current_tread_depth < 3.0
      AND vt.status = 'active'
  LOOP
    -- Insert alert if it doesn't already exist
    INSERT INTO public.tire_alerts (
      organization_id, vehicle_id, vehicle_tire_id, alert_type, severity,
      title, description, current_value, threshold_value
    )
    SELECT 
      tire_record.organization_id,
      tire_record.vehicle_id,
      tire_record.id,
      'low_tread',
      CASE 
        WHEN tire_record.current_tread_depth < 1.6 THEN 'critical'
        WHEN tire_record.current_tread_depth < 2.0 THEN 'high'
        ELSE 'medium'
      END,
      'Low Tire Tread Depth - ' || tire_record.vehicle_number,
      'Tire at position ' || tire_record.position || ' has tread depth of ' || tire_record.current_tread_depth || 'mm. Legal minimum is 1.6mm.',
      tire_record.current_tread_depth,
      1.6
    WHERE NOT EXISTS (
      SELECT 1 FROM public.tire_alerts
      WHERE vehicle_tire_id = tire_record.id 
        AND alert_type = 'low_tread'
        AND status = 'active'
    );
  END LOOP;
  
  -- Check for overdue inspections
  FOR tire_record IN 
    SELECT vt.*, v.organization_id, v.vehicle_number
    FROM public.vehicle_tires vt
    JOIN public.vehicles v ON vt.vehicle_id = v.id
    WHERE vt.next_inspection_due < CURRENT_DATE
      AND vt.status = 'active'
  LOOP
    INSERT INTO public.tire_alerts (
      organization_id, vehicle_id, vehicle_tire_id, alert_type, severity,
      title, description, due_date
    )
    SELECT 
      tire_record.organization_id,
      tire_record.vehicle_id,
      tire_record.id,
      'overdue_inspection',
      'high',
      'Overdue Tire Inspection - ' || tire_record.vehicle_number,
      'Tire at position ' || tire_record.position || ' inspection was due on ' || tire_record.next_inspection_due,
      tire_record.next_inspection_due
    WHERE NOT EXISTS (
      SELECT 1 FROM public.tire_alerts
      WHERE vehicle_tire_id = tire_record.id 
        AND alert_type = 'overdue_inspection'
        AND status = 'active'
    );
  END LOOP;
END;
$$;