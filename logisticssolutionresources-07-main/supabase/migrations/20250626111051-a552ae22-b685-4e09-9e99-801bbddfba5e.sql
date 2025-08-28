
-- Create TruAnalysis tables for driver analytics and risk scoring
CREATE TABLE IF NOT EXISTS public.driver_risk_scores (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid REFERENCES auth.users NOT NULL,
  organization_id uuid REFERENCES public.organizations(id),
  risk_score integer NOT NULL DEFAULT 100 CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_category text NOT NULL DEFAULT 'low' CHECK (risk_category IN ('low', 'medium', 'high', 'critical')),
  vehicle_check_score integer DEFAULT 100,
  incident_score integer DEFAULT 100,
  compliance_score integer DEFAULT 100,
  performance_score integer DEFAULT 100,
  calculation_date date NOT NULL DEFAULT CURRENT_DATE,
  factors jsonb DEFAULT '{}',
  recommendations text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(driver_id, calculation_date)
);

-- Create incident reports table for tracking
CREATE TABLE IF NOT EXISTS public.incident_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid REFERENCES auth.users NOT NULL,
  vehicle_id uuid REFERENCES public.vehicles(id),
  organization_id uuid REFERENCES public.organizations(id),
  incident_type text NOT NULL CHECK (incident_type IN ('accident', 'speeding', 'harsh_braking', 'harsh_acceleration', 'route_deviation', 'late_arrival', 'maintenance_issue', 'other')),
  severity text NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title text NOT NULL,
  description text,
  incident_date date NOT NULL,
  incident_time time,
  location text,
  coordinates jsonb,
  weather_conditions text,
  road_conditions text,
  witnesses text[],
  police_report_number text,
  insurance_claim_number text,
  estimated_cost numeric,
  actual_cost numeric,
  status text NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'investigating', 'resolved', 'closed')),
  reported_by uuid REFERENCES auth.users,
  assigned_to uuid REFERENCES auth.users,
  attachments text[],
  follow_up_required boolean DEFAULT false,
  follow_up_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create driver license management table (TruLicence)
CREATE TABLE IF NOT EXISTS public.driver_licenses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid REFERENCES auth.users NOT NULL,
  organization_id uuid REFERENCES public.organizations(id),
  license_number text NOT NULL,
  license_type text NOT NULL CHECK (license_type IN ('standard', 'commercial', 'heavy_vehicle', 'passenger_transport', 'dangerous_goods')),
  license_class text,
  issuing_authority text NOT NULL,
  issue_date date NOT NULL,
  expiry_date date NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended', 'revoked', 'pending_renewal')),
  restrictions text[],
  endorsements text[],
  points_balance integer DEFAULT 0,
  document_url text,
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_by uuid REFERENCES auth.users,
  verified_date date,
  renewal_reminder_sent boolean DEFAULT false,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(driver_id, license_number)
);

-- Create time tracking table (TruTime)
CREATE TABLE IF NOT EXISTS public.driver_time_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid REFERENCES auth.users NOT NULL,
  organization_id uuid REFERENCES public.organizations(id),
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  shift_start time,
  shift_end time,
  break_start time,
  break_end time,
  total_hours numeric,
  overtime_hours numeric DEFAULT 0,
  route_id uuid REFERENCES public.routes(id),
  vehicle_id uuid REFERENCES public.vehicles(id),
  job_type text CHECK (job_type IN ('regular_route', 'private_job', 'maintenance', 'training', 'other')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'break', 'completed', 'overtime')),
  location_start text,
  location_end text,
  mileage_start integer,
  mileage_end integer,
  fuel_start integer,
  fuel_end integer,
  notes text,
  approved_by uuid REFERENCES auth.users,
  approval_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create enhanced document categories for TruDocument
CREATE TABLE IF NOT EXISTS public.document_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  compliance_required boolean DEFAULT false,
  renewal_period_months integer,
  reminder_days_before integer DEFAULT 30,
  applicable_roles text[] DEFAULT ARRAY['driver'],
  organization_id uuid REFERENCES public.organizations(id),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(name, organization_id)
);

-- Create compliance violations table
CREATE TABLE IF NOT EXISTS public.compliance_violations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid REFERENCES auth.users NOT NULL,
  organization_id uuid REFERENCES public.organizations(id),
  violation_type text NOT NULL,
  violation_code text,
  description text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('minor', 'major', 'severe', 'critical')),
  fine_amount numeric,
  points_deducted integer DEFAULT 0,
  violation_date date NOT NULL,
  reported_date date DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'disputed', 'overturned')),
  resolution_date date,
  resolution_notes text,
  authority text,
  reference_number text,
  court_date date,
  legal_action_required boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create KPI tracking table for TruView dashboard
CREATE TABLE IF NOT EXISTS public.kpi_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id),
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  metric_unit text,
  metric_date date NOT NULL DEFAULT CURRENT_DATE,
  metric_category text NOT NULL CHECK (metric_category IN ('safety', 'compliance', 'efficiency', 'financial', 'maintenance')),
  target_value numeric,
  threshold_warning numeric,
  threshold_critical numeric,
  notes text,
  calculated_by uuid REFERENCES auth.users,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert default document categories only if they don't exist
INSERT INTO public.document_categories (name, description, compliance_required, renewal_period_months, applicable_roles) 
SELECT 'Driver License', 'Valid driver license', true, 60, ARRAY['driver']
WHERE NOT EXISTS (SELECT 1 FROM public.document_categories WHERE name = 'Driver License' AND organization_id IS NULL);

INSERT INTO public.document_categories (name, description, compliance_required, renewal_period_months, applicable_roles) 
SELECT 'Medical Certificate', 'Medical fitness certificate', true, 12, ARRAY['driver']
WHERE NOT EXISTS (SELECT 1 FROM public.document_categories WHERE name = 'Medical Certificate' AND organization_id IS NULL);

INSERT INTO public.document_categories (name, description, compliance_required, renewal_period_months, applicable_roles) 
SELECT 'Criminal Background Check', 'Background verification', true, 36, ARRAY['driver']
WHERE NOT EXISTS (SELECT 1 FROM public.document_categories WHERE name = 'Criminal Background Check' AND organization_id IS NULL);

INSERT INTO public.document_categories (name, description, compliance_required, renewal_period_months, applicable_roles) 
SELECT 'Vehicle Registration', 'Vehicle registration documents', true, 12, ARRAY['admin']
WHERE NOT EXISTS (SELECT 1 FROM public.document_categories WHERE name = 'Vehicle Registration' AND organization_id IS NULL);

-- Insert default compliance standards only if they don't exist
INSERT INTO public.compliance_standards (category, requirement_name, description, severity, points_deduction, regulation_reference) 
SELECT 'License Management', 'Valid Commercial License', 'Driver must maintain valid commercial driving license', 'critical', 50, 'Transport Regulation 2023-A'
WHERE NOT EXISTS (SELECT 1 FROM public.compliance_standards WHERE category = 'License Management' AND requirement_name = 'Valid Commercial License');

INSERT INTO public.compliance_standards (category, requirement_name, description, severity, points_deduction, regulation_reference) 
SELECT 'Hours of Service', 'Maximum Daily Driving Hours', 'Driver cannot exceed 10 hours of driving per day', 'high', 25, 'DOT-HOS-395.8'
WHERE NOT EXISTS (SELECT 1 FROM public.compliance_standards WHERE category = 'Hours of Service' AND requirement_name = 'Maximum Daily Driving Hours');

-- Enable RLS on new tables
ALTER TABLE public.driver_risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies for driver_risk_scores
CREATE POLICY "Drivers can view their own risk scores" ON public.driver_risk_scores FOR SELECT USING (auth.uid() = driver_id);
CREATE POLICY "Admins can view all risk scores" ON public.driver_risk_scores FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'council', 'compliance_officer'))
);

-- RLS policies for incident_reports
CREATE POLICY "Drivers can view their own incidents" ON public.incident_reports FOR SELECT USING (auth.uid() = driver_id);
CREATE POLICY "Drivers can create incident reports" ON public.incident_reports FOR INSERT WITH CHECK (auth.uid() = driver_id);
CREATE POLICY "Admins can manage all incidents" ON public.incident_reports FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'council', 'compliance_officer'))
);

-- RLS policies for driver_licenses
CREATE POLICY "Drivers can view their own licenses" ON public.driver_licenses FOR SELECT USING (auth.uid() = driver_id);
CREATE POLICY "Admins can manage all licenses" ON public.driver_licenses FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'council', 'compliance_officer'))
);

-- RLS policies for driver_time_logs
CREATE POLICY "Drivers can manage their own time logs" ON public.driver_time_logs FOR ALL USING (auth.uid() = driver_id);
CREATE POLICY "Admins can view all time logs" ON public.driver_time_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'council', 'compliance_officer'))
);

-- RLS policies for document_categories
CREATE POLICY "Users can view document categories" ON public.document_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage document categories" ON public.document_categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'council'))
);

-- RLS policies for compliance_violations
CREATE POLICY "Drivers can view their own violations" ON public.compliance_violations FOR SELECT USING (auth.uid() = driver_id);
CREATE POLICY "Admins can manage all violations" ON public.compliance_violations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'council', 'compliance_officer'))
);

-- RLS policies for kpi_metrics
CREATE POLICY "Admins can manage KPI metrics" ON public.kpi_metrics FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'council', 'compliance_officer'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_driver_risk_scores_driver_date ON public.driver_risk_scores(driver_id, calculation_date DESC);
CREATE INDEX IF NOT EXISTS idx_incident_reports_driver_date ON public.incident_reports(driver_id, incident_date DESC);
CREATE INDEX IF NOT EXISTS idx_driver_licenses_expiry ON public.driver_licenses(expiry_date) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_driver_time_logs_date ON public.driver_time_logs(driver_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_driver ON public.compliance_violations(driver_id, violation_date DESC);
CREATE INDEX IF NOT EXISTS idx_kpi_metrics_org_date ON public.kpi_metrics(organization_id, metric_date DESC);
