-- Comprehensive Vehicle Document Management System Enhancement

-- Extend the vehicles table with additional fields for comprehensive vehicle information
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS insurance_provider TEXT,
ADD COLUMN IF NOT EXISTS insurance_policy_number TEXT,
ADD COLUMN IF NOT EXISTS insurance_expiry_date DATE,
ADD COLUMN IF NOT EXISTS v5c_document_number TEXT,
ADD COLUMN IF NOT EXISTS v5c_issue_date DATE,
ADD COLUMN IF NOT EXISTS plating_certificate_number TEXT,
ADD COLUMN IF NOT EXISTS plating_certificate_expiry DATE,
ADD COLUMN IF NOT EXISTS weight_certificate_number TEXT,
ADD COLUMN IF NOT EXISTS weight_certificate_expiry DATE,
ADD COLUMN IF NOT EXISTS annual_test_expiry DATE,
ADD COLUMN IF NOT EXISTS operators_licence_number TEXT,
ADD COLUMN IF NOT EXISTS road_tax_expiry DATE,
ADD COLUMN IF NOT EXISTS tachograph_calibration_expiry DATE,
ADD COLUMN IF NOT EXISTS speed_limiter_certificate_expiry DATE,
ADD COLUMN IF NOT EXISTS fire_extinguisher_check_date DATE,
ADD COLUMN IF NOT EXISTS first_aid_kit_check_date DATE,
ADD COLUMN IF NOT EXISTS vehicle_dimensions JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS vehicle_weights JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS vehicle_specifications JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS compliance_notes TEXT,
ADD COLUMN IF NOT EXISTS next_mot_due DATE,
ADD COLUMN IF NOT EXISTS last_service_date DATE,
ADD COLUMN IF NOT EXISTS service_history JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS defect_history JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS modification_history JSONB DEFAULT '[]';

-- Create vehicle_document_templates table for predefined document types
CREATE TABLE IF NOT EXISTS public.vehicle_document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  is_mandatory BOOLEAN DEFAULT true,
  expiry_warning_days INTEGER DEFAULT 30,
  renewal_frequency_days INTEGER,
  applicable_vehicle_types TEXT[] DEFAULT '{}',
  form_fields JSONB DEFAULT '[]',
  validation_rules JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Create vehicle_document_alerts table for tracking compliance alerts
CREATE TABLE IF NOT EXISTS public.vehicle_document_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.vehicle_documents(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('expiring', 'expired', 'missing', 'invalid')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  due_date DATE,
  days_until_due INTEGER,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
  acknowledged_by UUID REFERENCES public.profiles(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create vehicle_compliance_reports table for tracking compliance status
CREATE TABLE IF NOT EXISTS public.vehicle_compliance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  compliance_score NUMERIC(5,2) DEFAULT 0,
  total_documents INTEGER DEFAULT 0,
  compliant_documents INTEGER DEFAULT 0,
  expired_documents INTEGER DEFAULT 0,
  expiring_soon_documents INTEGER DEFAULT 0,
  missing_documents INTEGER DEFAULT 0,
  critical_issues INTEGER DEFAULT 0,
  compliance_status TEXT DEFAULT 'non_compliant' CHECK (compliance_status IN ('compliant', 'warning', 'non_compliant', 'critical')),
  next_review_date DATE,
  report_data JSONB DEFAULT '{}',
  generated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create vehicle_document_history table for tracking document changes
CREATE TABLE IF NOT EXISTS public.vehicle_document_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.vehicle_documents(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'renewed', 'expired', 'archived')),
  old_values JSONB,
  new_values JSONB,
  notes TEXT,
  performed_by UUID REFERENCES public.profiles(id),
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Insert default UK vehicle document templates
INSERT INTO public.vehicle_document_templates (organization_id, name, description, category, is_mandatory, expiry_warning_days, renewal_frequency_days, applicable_vehicle_types) 
SELECT 
  org.id,
  template.name,
  template.description,
  template.category,
  template.is_mandatory,
  template.expiry_warning_days,
  template.renewal_frequency_days,
  template.applicable_vehicle_types
FROM public.organizations org
CROSS JOIN (VALUES 
  ('V5C Registration Document', 'Vehicle registration certificate (log book)', 'Registration', true, 30, NULL, ARRAY['HGV', 'PSV', 'van', 'car']),
  ('MOT Certificate', 'Ministry of Transport test certificate', 'Safety', true, 30, 365, ARRAY['HGV', 'PSV', 'van', 'car']),
  ('Insurance Certificate', 'Motor insurance certificate', 'Insurance', true, 14, 365, ARRAY['HGV', 'PSV', 'van', 'car']),
  ('Operators Licence', 'Goods/passenger vehicle operators licence', 'Licensing', true, 60, 1825, ARRAY['HGV', 'PSV']),
  ('Annual Test Certificate', 'Annual test certificate for commercial vehicles', 'Safety', true, 30, 365, ARRAY['HGV', 'PSV']),
  ('Plating Certificate', 'Vehicle plating certificate showing design weights', 'Technical', true, 30, NULL, ARRAY['HGV', 'PSV']),
  ('Tachograph Calibration', 'Tachograph calibration certificate', 'Compliance', true, 30, 730, ARRAY['HGV']),
  ('Speed Limiter Certificate', 'Speed limiter calibration certificate', 'Safety', true, 30, 730, ARRAY['HGV']),
  ('Road Tax', 'Vehicle excise duty (road tax)', 'Licensing', true, 14, 365, ARRAY['HGV', 'PSV', 'van', 'car']),
  ('CPC Certificate', 'Certificate of Professional Competence', 'Licensing', false, 60, 1825, ARRAY['HGV', 'PSV']),
  ('Fire Extinguisher Certificate', 'Fire extinguisher inspection certificate', 'Safety', false, 30, 365, ARRAY['PSV']),
  ('First Aid Kit Certificate', 'First aid kit inspection certificate', 'Safety', false, 30, 365, ARRAY['PSV'])
) AS template(name, description, category, is_mandatory, expiry_warning_days, renewal_frequency_days, applicable_vehicle_types)
WHERE NOT EXISTS (
  SELECT 1 FROM public.vehicle_document_templates vdt 
  WHERE vdt.organization_id = org.id 
  AND vdt.name = template.name
);

-- Add RLS policies for new tables
ALTER TABLE public.vehicle_document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_document_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_document_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for vehicle_document_templates
CREATE POLICY "Organization members can view document templates" ON public.vehicle_document_templates
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can manage document templates" ON public.vehicle_document_templates
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'council')
  ));

-- RLS policies for vehicle_document_alerts
CREATE POLICY "Organization members can view document alerts" ON public.vehicle_document_alerts
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can acknowledge their alerts" ON public.vehicle_document_alerts
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "System can create and update alerts" ON public.vehicle_document_alerts
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'council', 'compliance_officer')
  ));

-- RLS policies for vehicle_compliance_reports
CREATE POLICY "Organization members can view compliance reports" ON public.vehicle_compliance_reports
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Compliance team can manage reports" ON public.vehicle_compliance_reports
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'council', 'compliance_officer')
  ));

-- RLS policies for vehicle_document_history
CREATE POLICY "Organization members can view document history" ON public.vehicle_document_history
  FOR SELECT USING (vehicle_id IN (
    SELECT v.id FROM public.vehicles v 
    JOIN public.profiles p ON v.organization_id = p.organization_id 
    WHERE p.id = auth.uid()
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vehicle_document_alerts_organization_status ON public.vehicle_document_alerts(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_vehicle_document_alerts_vehicle_status ON public.vehicle_document_alerts(vehicle_id, status);
CREATE INDEX IF NOT EXISTS idx_vehicle_document_alerts_due_date ON public.vehicle_document_alerts(due_date) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_vehicle_compliance_reports_vehicle_date ON public.vehicle_compliance_reports(vehicle_id, report_date);
CREATE INDEX IF NOT EXISTS idx_vehicle_document_history_vehicle_date ON public.vehicle_document_history(vehicle_id, performed_at);

-- Function to calculate vehicle compliance score
CREATE OR REPLACE FUNCTION public.calculate_vehicle_compliance_score(p_vehicle_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  total_docs INTEGER := 0;
  compliant_docs INTEGER := 0;
  score NUMERIC := 0;
BEGIN
  -- Count total mandatory documents for this vehicle type
  SELECT COUNT(*) INTO total_docs
  FROM public.vehicle_document_templates vdt
  JOIN public.vehicles v ON v.organization_id = vdt.organization_id
  WHERE v.id = p_vehicle_id 
    AND vdt.is_mandatory = true
    AND vdt.is_active = true
    AND (vdt.applicable_vehicle_types = '{}' OR v.type::text = ANY(vdt.applicable_vehicle_types));
  
  -- Count compliant documents (exists and not expired)
  SELECT COUNT(*) INTO compliant_docs
  FROM public.vehicle_document_templates vdt
  JOIN public.vehicles v ON v.organization_id = vdt.organization_id
  JOIN public.vehicle_documents vd ON vd.vehicle_id = v.id AND vd.document_type = vdt.name
  WHERE v.id = p_vehicle_id 
    AND vdt.is_mandatory = true
    AND vdt.is_active = true
    AND (vdt.applicable_vehicle_types = '{}' OR v.type::text = ANY(vdt.applicable_vehicle_types))
    AND vd.status = 'approved'
    AND (vd.expiry_date IS NULL OR vd.expiry_date > CURRENT_DATE);
  
  -- Calculate percentage score
  IF total_docs > 0 THEN
    score := ROUND((compliant_docs::NUMERIC / total_docs::NUMERIC) * 100, 2);
  END IF;
  
  RETURN score;
END;
$$;

-- Function to generate compliance alerts
CREATE OR REPLACE FUNCTION public.generate_vehicle_compliance_alerts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  vehicle_record RECORD;
  template_record RECORD;
  doc_record RECORD;
  alerts_created INTEGER := 0;
BEGIN
  -- Clear existing active alerts
  UPDATE public.vehicle_document_alerts 
  SET status = 'resolved', resolved_at = now()
  WHERE status = 'active';
  
  -- Check each vehicle
  FOR vehicle_record IN 
    SELECT v.*, o.id as org_id 
    FROM public.vehicles v 
    JOIN public.organizations o ON v.organization_id = o.id
    WHERE v.is_active = true
  LOOP
    -- Check for missing mandatory documents
    FOR template_record IN
      SELECT vdt.*
      FROM public.vehicle_document_templates vdt
      WHERE vdt.organization_id = vehicle_record.org_id
        AND vdt.is_mandatory = true
        AND vdt.is_active = true
        AND (vdt.applicable_vehicle_types = '{}' OR vehicle_record.type::text = ANY(vdt.applicable_vehicle_types))
        AND NOT EXISTS (
          SELECT 1 FROM public.vehicle_documents vd 
          WHERE vd.vehicle_id = vehicle_record.id 
            AND vd.document_type = vdt.name
            AND vd.status = 'approved'
        )
    LOOP
      INSERT INTO public.vehicle_document_alerts (
        organization_id, vehicle_id, alert_type, severity, title, message
      ) VALUES (
        vehicle_record.org_id,
        vehicle_record.id,
        'missing',
        'high',
        'Missing ' || template_record.name,
        'Vehicle ' || vehicle_record.vehicle_number || ' is missing required document: ' || template_record.name
      );
      alerts_created := alerts_created + 1;
    END LOOP;
    
    -- Check for expiring documents
    FOR doc_record IN
      SELECT vd.*, vdt.expiry_warning_days
      FROM public.vehicle_documents vd
      JOIN public.vehicle_document_templates vdt ON vdt.name = vd.document_type 
        AND vdt.organization_id = vehicle_record.org_id
      WHERE vd.vehicle_id = vehicle_record.id
        AND vd.status = 'approved'
        AND vd.expiry_date IS NOT NULL
        AND vd.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '1 day' * COALESCE(vdt.expiry_warning_days, 30)
    LOOP
      INSERT INTO public.vehicle_document_alerts (
        organization_id, vehicle_id, document_id, alert_type, severity, title, message, due_date, days_until_due
      ) VALUES (
        vehicle_record.org_id,
        vehicle_record.id,
        doc_record.id,
        'expiring',
        CASE 
          WHEN doc_record.expiry_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'critical'
          WHEN doc_record.expiry_date <= CURRENT_DATE + INTERVAL '14 days' THEN 'high'
          ELSE 'medium'
        END,
        doc_record.document_type || ' Expiring Soon',
        'Document ' || doc_record.name || ' for vehicle ' || vehicle_record.vehicle_number || ' expires on ' || doc_record.expiry_date,
        doc_record.expiry_date,
        (doc_record.expiry_date - CURRENT_DATE)::INTEGER
      );
      alerts_created := alerts_created + 1;
    END LOOP;
    
    -- Check for expired documents
    FOR doc_record IN
      SELECT vd.*
      FROM public.vehicle_documents vd
      WHERE vd.vehicle_id = vehicle_record.id
        AND vd.status = 'approved'
        AND vd.expiry_date IS NOT NULL
        AND vd.expiry_date < CURRENT_DATE
    LOOP
      INSERT INTO public.vehicle_document_alerts (
        organization_id, vehicle_id, document_id, alert_type, severity, title, message, due_date, days_until_due
      ) VALUES (
        vehicle_record.org_id,
        vehicle_record.id,
        doc_record.id,
        'expired',
        'critical',
        doc_record.document_type || ' Expired',
        'Document ' || doc_record.name || ' for vehicle ' || vehicle_record.vehicle_number || ' expired on ' || doc_record.expiry_date,
        doc_record.expiry_date,
        (CURRENT_DATE - doc_record.expiry_date)::INTEGER
      );
      alerts_created := alerts_created + 1;
    END LOOP;
  END LOOP;
  
  RETURN alerts_created;
END;
$$;

-- Create triggers for automatic compliance tracking
CREATE OR REPLACE FUNCTION public.update_vehicle_compliance_on_document_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Log the document change
  INSERT INTO public.vehicle_document_history (
    vehicle_id, document_id, action, old_values, new_values, performed_by
  ) VALUES (
    COALESCE(NEW.vehicle_id, OLD.vehicle_id),
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
    auth.uid()
  );
  
  -- Trigger compliance alert generation
  PERFORM public.generate_vehicle_compliance_alerts();
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add trigger to vehicle_documents table
DROP TRIGGER IF EXISTS trigger_vehicle_compliance_update ON public.vehicle_documents;
CREATE TRIGGER trigger_vehicle_compliance_update
  AFTER INSERT OR UPDATE OR DELETE ON public.vehicle_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_vehicle_compliance_on_document_change();

-- Create background task for daily compliance checks
INSERT INTO public.background_tasks (
  organization_id, task_type, payload, scheduled_at, priority
)
SELECT 
  org.id,
  'daily_compliance_check',
  '{"description": "Daily vehicle compliance monitoring"}',
  CURRENT_DATE + INTERVAL '1 day' + TIME '06:00:00',
  8
FROM public.organizations org
WHERE NOT EXISTS (
  SELECT 1 FROM public.background_tasks bt 
  WHERE bt.organization_id = org.id 
    AND bt.task_type = 'daily_compliance_check'
    AND bt.status = 'pending'
);