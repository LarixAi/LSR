-- =============================================
-- LSR TRANSPORT COMPREHENSIVE DATABASE SCHEMA
-- Phase 1: Core Infrastructure and Organizations
-- =============================================

-- Create core enums first
CREATE TYPE public.infringement_status AS ENUM ('pending', 'active', 'resolved', 'disputed', 'expired');
CREATE TYPE public.infringement_severity AS ENUM ('minor', 'major', 'serious', 'severe');
CREATE TYPE public.appeal_status AS ENUM ('pending', 'under_review', 'approved', 'rejected', 'withdrawn');
CREATE TYPE public.document_status AS ENUM ('draft', 'active', 'expired', 'archived');
CREATE TYPE public.email_status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'bounced');
CREATE TYPE public.support_ticket_status AS ENUM ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed');
CREATE TYPE public.support_ticket_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE public.invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
CREATE TYPE public.quotation_status AS ENUM ('draft', 'sent', 'accepted', 'rejected', 'expired');

-- =============================================
-- CORE ORGANIZATIONAL STRUCTURE
-- =============================================

-- Organizations table (multi-tenant core)
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  legal_name TEXT,
  registration_number TEXT,
  tax_number TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'UK',
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  subscription_plan TEXT DEFAULT 'basic',
  subscription_status TEXT DEFAULT 'active',
  billing_address TEXT,
  billing_contact_name TEXT,
  billing_contact_email TEXT,
  billing_contact_phone TEXT,
  max_drivers INTEGER DEFAULT 50,
  max_vehicles INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT organizations_name_check CHECK (length(name) >= 2),
  CONSTRAINT organizations_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Customer profiles for business customers
CREATE TABLE public.customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  customer_number TEXT NOT NULL,
  company_name TEXT,
  contact_person TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  mobile TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'UK',
  billing_address TEXT,
  billing_city TEXT,
  billing_state TEXT,
  billing_zip_code TEXT,
  billing_country TEXT DEFAULT 'UK',
  payment_terms INTEGER DEFAULT 30, -- days
  credit_limit DECIMAL(10,2),
  tax_number TEXT,
  customer_type TEXT DEFAULT 'corporate', -- corporate, individual, government
  industry TEXT,
  account_manager_id UUID,
  preferred_payment_method TEXT DEFAULT 'bank_transfer',
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT customer_profiles_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT customer_profiles_customer_number_org_unique UNIQUE (organization_id, customer_number)
);

-- =============================================
-- INFRINGEMENT MANAGEMENT SYSTEM
-- =============================================

-- Infringement types lookup table
CREATE TABLE public.infringement_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'speeding', 'parking', 'documentation', 'safety', 'environmental'
  default_fine_amount DECIMAL(10,2),
  default_points INTEGER DEFAULT 0,
  severity public.infringement_severity NOT NULL DEFAULT 'minor',
  statutory_limit_days INTEGER DEFAULT 28, -- days to respond
  is_criminal BOOLEAN DEFAULT false,
  regulatory_reference TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT infringement_types_code_org_unique UNIQUE (organization_id, code),
  CONSTRAINT infringement_types_fine_amount_positive CHECK (default_fine_amount >= 0),
  CONSTRAINT infringement_types_points_valid CHECK (default_points >= 0 AND default_points <= 12)
);

-- Main infringements table
CREATE TABLE public.infringements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  infringement_number TEXT NOT NULL,
  infringement_type_id UUID REFERENCES public.infringement_types(id),
  driver_id UUID REFERENCES public.profiles(id),
  vehicle_id UUID REFERENCES public.vehicles(id),
  issuing_authority TEXT NOT NULL,
  reference_number TEXT,
  issue_date DATE NOT NULL,
  incident_date DATE NOT NULL,
  incident_time TIME,
  location TEXT,
  latitude DECIMAL(10, 6),
  longitude DECIMAL(10, 6),
  description TEXT,
  fine_amount DECIMAL(10,2),
  penalty_points INTEGER DEFAULT 0,
  status public.infringement_status DEFAULT 'pending',
  severity public.infringement_severity DEFAULT 'minor',
  due_date DATE,
  payment_date DATE,
  payment_amount DECIMAL(10,2),
  payment_reference TEXT,
  court_date DATE,
  court_outcome TEXT,
  assigned_to UUID REFERENCES public.profiles(id),
  notes TEXT,
  attachments JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT infringements_number_org_unique UNIQUE (organization_id, infringement_number),
  CONSTRAINT infringements_incident_date_check CHECK (incident_date <= CURRENT_DATE),
  CONSTRAINT infringements_fine_amount_positive CHECK (fine_amount >= 0),
  CONSTRAINT infringements_points_valid CHECK (penalty_points >= 0 AND penalty_points <= 12),
  CONSTRAINT infringements_payment_amount_positive CHECK (payment_amount >= 0)
);

-- Driver points history for penalty points tracking
CREATE TABLE public.driver_points_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  infringement_id UUID REFERENCES public.infringements(id),
  points_added INTEGER NOT NULL,
  points_removed INTEGER DEFAULT 0,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  reason TEXT NOT NULL,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT driver_points_history_points_valid CHECK (points_added >= 0 AND points_removed >= 0),
  CONSTRAINT driver_points_history_balance_valid CHECK (balance_before >= 0 AND balance_after >= 0),
  CONSTRAINT driver_points_history_balance_calc CHECK (balance_after = balance_before + points_added - points_removed)
);

-- Appeals management
CREATE TABLE public.appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  infringement_id UUID REFERENCES public.infringements(id) ON DELETE CASCADE,
  appeal_number TEXT NOT NULL,
  submitted_date DATE NOT NULL DEFAULT CURRENT_DATE,
  grounds TEXT NOT NULL,
  evidence_description TEXT,
  status public.appeal_status DEFAULT 'pending',
  assigned_to UUID REFERENCES public.profiles(id),
  hearing_date DATE,
  hearing_location TEXT,
  outcome TEXT,
  outcome_date DATE,
  outcome_reason TEXT,
  fine_reduction_amount DECIMAL(10,2) DEFAULT 0,
  points_reduction INTEGER DEFAULT 0,
  attachments JSONB DEFAULT '[]',
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT appeals_number_org_unique UNIQUE (organization_id, appeal_number),
  CONSTRAINT appeals_reduction_amounts_valid CHECK (fine_reduction_amount >= 0 AND points_reduction >= 0),
  CONSTRAINT appeals_outcome_date_check CHECK (outcome_date >= submitted_date)
);

-- Tachograph records for digital tachograph data
CREATE TABLE public.tachograph_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id),
  record_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  activity_type TEXT NOT NULL, -- 'driving', 'work', 'availability', 'break', 'rest'
  distance_km DECIMAL(8,2),
  start_location TEXT,
  end_location TEXT,
  digital_signature TEXT,
  card_number TEXT,
  downloaded_at TIMESTAMPTZ,
  file_path TEXT,
  raw_data JSONB,
  violations JSONB DEFAULT '[]',
  is_validated BOOLEAN DEFAULT false,
  validation_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT tachograph_records_distance_positive CHECK (distance_km >= 0),
  CONSTRAINT tachograph_records_time_valid CHECK (end_time > start_time OR end_time IS NULL),
  CONSTRAINT tachograph_records_activity_valid CHECK (activity_type IN ('driving', 'work', 'availability', 'break', 'rest'))
);

-- =============================================
-- BUSINESS MANAGEMENT SYSTEM
-- =============================================

-- Quotations management
CREATE TABLE public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customer_profiles(id),
  quotation_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  service_type TEXT, -- 'transportation', 'charter', 'contract', 'event'
  route_details TEXT,
  pickup_location TEXT,
  dropoff_location TEXT,
  service_date DATE,
  service_time TIME,
  duration_hours DECIMAL(5,2),
  passenger_count INTEGER,
  vehicle_type TEXT,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 20.00, -- VAT percentage
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'GBP',
  status public.quotation_status DEFAULT 'draft',
  valid_until DATE,
  terms_conditions TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  sent_date DATE,
  accepted_date DATE,
  rejected_date DATE,
  rejection_reason TEXT,
  converted_to_invoice_id UUID,
  attachments JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT quotations_number_org_unique UNIQUE (organization_id, quotation_number),
  CONSTRAINT quotations_amounts_positive CHECK (subtotal >= 0 AND tax_amount >= 0 AND discount_amount >= 0 AND total_amount >= 0),
  CONSTRAINT quotations_tax_rate_valid CHECK (tax_rate >= 0 AND tax_rate <= 100),
  CONSTRAINT quotations_passenger_count_positive CHECK (passenger_count > 0)
);

-- Invoices management
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customer_profiles(id),
  quotation_id UUID REFERENCES public.quotations(id),
  invoice_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  service_date DATE,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 20.00,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'GBP',
  status public.invoice_status DEFAULT 'draft',
  payment_terms TEXT,
  payment_method TEXT,
  payment_reference TEXT,
  payment_date DATE,
  bank_account_details TEXT,
  late_fee_amount DECIMAL(10,2) DEFAULT 0,
  terms_conditions TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  sent_date DATE,
  reminder_count INTEGER DEFAULT 0,
  last_reminder_date DATE,
  attachments JSONB DEFAULT '[]',
  line_items JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT invoices_number_org_unique UNIQUE (organization_id, invoice_number),
  CONSTRAINT invoices_amounts_positive CHECK (subtotal >= 0 AND tax_amount >= 0 AND discount_amount >= 0 AND total_amount >= 0 AND paid_amount >= 0),
  CONSTRAINT invoices_due_date_check CHECK (due_date >= issue_date),
  CONSTRAINT invoices_tax_rate_valid CHECK (tax_rate >= 0 AND tax_rate <= 100),
  CONSTRAINT invoices_paid_amount_valid CHECK (paid_amount <= total_amount)
);

-- Payroll records
CREATE TABLE public.payroll_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  payroll_number TEXT NOT NULL,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  pay_date DATE NOT NULL,
  basic_salary DECIMAL(10,2) NOT NULL DEFAULT 0,
  overtime_hours DECIMAL(5,2) DEFAULT 0,
  overtime_rate DECIMAL(8,2) DEFAULT 0,
  overtime_pay DECIMAL(10,2) DEFAULT 0,
  bonus_amount DECIMAL(10,2) DEFAULT 0,
  commission_amount DECIMAL(10,2) DEFAULT 0,
  allowances DECIMAL(10,2) DEFAULT 0,
  gross_pay DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_deduction DECIMAL(10,2) DEFAULT 0,
  ni_deduction DECIMAL(10,2) DEFAULT 0,
  pension_deduction DECIMAL(10,2) DEFAULT 0,
  other_deductions DECIMAL(10,2) DEFAULT 0,
  total_deductions DECIMAL(10,2) DEFAULT 0,
  net_pay DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'GBP',
  payment_method TEXT DEFAULT 'bank_transfer',
  bank_account_number TEXT,
  sort_code TEXT,
  payment_reference TEXT,
  is_paid BOOLEAN DEFAULT false,
  paid_date DATE,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  attachments JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT payroll_records_number_org_unique UNIQUE (organization_id, payroll_number),
  CONSTRAINT payroll_records_period_valid CHECK (pay_period_end >= pay_period_start),
  CONSTRAINT payroll_records_amounts_positive CHECK (
    basic_salary >= 0 AND overtime_hours >= 0 AND overtime_rate >= 0 AND 
    overtime_pay >= 0 AND bonus_amount >= 0 AND commission_amount >= 0 AND 
    allowances >= 0 AND gross_pay >= 0 AND total_deductions >= 0 AND net_pay >= 0
  ),
  CONSTRAINT payroll_records_overtime_calc CHECK (overtime_pay = overtime_hours * overtime_rate),
  CONSTRAINT payroll_records_net_calc CHECK (net_pay = gross_pay - total_deductions)
);

-- Support tickets
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  ticket_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT, -- 'technical', 'billing', 'general', 'complaint', 'feature_request'
  priority public.support_ticket_priority DEFAULT 'normal',
  status public.support_ticket_status DEFAULT 'open',
  requester_id UUID REFERENCES public.profiles(id),
  requester_name TEXT,
  requester_email TEXT,
  requester_phone TEXT,
  assigned_to UUID REFERENCES public.profiles(id),
  escalated_to UUID REFERENCES public.profiles(id),
  resolution TEXT,
  resolution_date TIMESTAMPTZ,
  first_response_date TIMESTAMPTZ,
  last_activity_date TIMESTAMPTZ DEFAULT now(),
  estimated_resolution_date TIMESTAMPTZ,
  customer_satisfaction_rating INTEGER, -- 1-5 scale
  customer_feedback TEXT,
  tags TEXT[],
  is_internal BOOLEAN DEFAULT false,
  is_escalated BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT support_tickets_number_org_unique UNIQUE (organization_id, ticket_number),
  CONSTRAINT support_tickets_rating_valid CHECK (customer_satisfaction_rating >= 1 AND customer_satisfaction_rating <= 5),
  CONSTRAINT support_tickets_resolution_date_check CHECK (resolution_date >= created_at)
);

-- =============================================
-- COMMUNICATION SYSTEM
-- =============================================

-- Email templates
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  content_html TEXT,
  category TEXT NOT NULL, -- 'invoice', 'quotation', 'reminder', 'welcome', 'notification', 'marketing'
  language TEXT DEFAULT 'en',
  is_default BOOLEAN DEFAULT false,
  variables JSONB DEFAULT '[]', -- Array of available template variables
  preview_text TEXT,
  from_name TEXT,
  from_email TEXT,
  reply_to_email TEXT,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT email_templates_name_org_unique UNIQUE (organization_id, name, category),
  CONSTRAINT email_templates_from_email_format CHECK (from_email IS NULL OR from_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT email_templates_reply_to_format CHECK (reply_to_email IS NULL OR reply_to_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Email logs for tracking sent emails
CREATE TABLE public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.email_templates(id),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  sender_email TEXT NOT NULL,
  sender_name TEXT,
  subject TEXT NOT NULL,
  content TEXT,
  content_html TEXT,
  status public.email_status DEFAULT 'pending',
  priority INTEGER DEFAULT 5, -- 1-10 scale, 10 being highest
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  external_message_id TEXT,
  tracking_pixel_url TEXT,
  click_tracking_enabled BOOLEAN DEFAULT true,
  open_tracking_enabled BOOLEAN DEFAULT true,
  attachments JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  related_record_type TEXT, -- 'invoice', 'quotation', 'ticket', 'infringement'
  related_record_id UUID,
  campaign_id UUID,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT email_logs_recipient_format CHECK (recipient_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT email_logs_sender_format CHECK (sender_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT email_logs_priority_valid CHECK (priority >= 1 AND priority <= 10),
  CONSTRAINT email_logs_delivery_sequence CHECK (
    (sent_at IS NULL OR sent_at >= created_at) AND
    (delivered_at IS NULL OR delivered_at >= sent_at) AND
    (opened_at IS NULL OR opened_at >= delivered_at)
  )
);

-- =============================================
-- DOCUMENT MANAGEMENT SYSTEM
-- =============================================

-- Documents table for file management
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  checksum TEXT,
  category TEXT, -- 'invoice', 'quotation', 'contract', 'license', 'insurance', 'certificate', 'photo', 'other'
  status public.document_status DEFAULT 'active',
  is_public BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1,
  parent_document_id UUID REFERENCES public.documents(id),
  expiry_date DATE,
  reminder_days_before_expiry INTEGER DEFAULT 30,
  last_reminder_date DATE,
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMPTZ,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  related_record_type TEXT, -- 'driver', 'vehicle', 'customer', 'infringement', 'invoice', 'quotation'
  related_record_id UUID,
  uploaded_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT documents_file_size_positive CHECK (file_size > 0),
  CONSTRAINT documents_version_positive CHECK (version > 0),
  CONSTRAINT documents_reminder_days_valid CHECK (reminder_days_before_expiry >= 0)
);

-- =============================================
-- VEHICLE COMPLIANCE SYSTEM ENHANCEMENT
-- =============================================

-- Extend the vehicle checks system with compliance violations
CREATE TABLE public.compliance_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.profiles(id),
  vehicle_id UUID REFERENCES public.vehicles(id),
  violation_type TEXT NOT NULL, -- 'hours_violation', 'maintenance_overdue', 'license_expired', 'inspection_failed'
  severity public.infringement_severity DEFAULT 'minor',
  description TEXT NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  violation_date DATE,
  location TEXT,
  automatic_detection BOOLEAN DEFAULT false,
  detection_source TEXT, -- 'tachograph', 'gps', 'manual_inspection', 'system_check'
  status TEXT DEFAULT 'active', -- 'active', 'resolved', 'acknowledged', 'dismissed'
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id),
  resolution_notes TEXT,
  corrective_action TEXT,
  fine_amount DECIMAL(10,2) DEFAULT 0,
  penalty_points INTEGER DEFAULT 0,
  is_reportable BOOLEAN DEFAULT false, -- requires reporting to authorities
  reported_at TIMESTAMPTZ,
  reported_by UUID REFERENCES public.profiles(id),
  report_reference TEXT,
  attachments JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT compliance_violations_fine_positive CHECK (fine_amount >= 0),
  CONSTRAINT compliance_violations_points_valid CHECK (penalty_points >= 0 AND penalty_points <= 12)
);

-- Vehicle check items for detailed inspections
CREATE TABLE public.vehicle_check_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'safety', 'mechanical', 'electrical', 'documentation', 'cleanliness'
  item_name TEXT NOT NULL,
  description TEXT,
  is_mandatory BOOLEAN DEFAULT true,
  points_value INTEGER DEFAULT 1,
  regulatory_reference TEXT,
  check_method TEXT, -- 'visual', 'functional', 'measurement', 'documentation'
  acceptable_values TEXT,
  failure_criteria TEXT,
  remedial_action TEXT,
  frequency_days INTEGER, -- how often this should be checked
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT vehicle_check_items_name_org_unique UNIQUE (organization_id, category, item_name),
  CONSTRAINT vehicle_check_items_points_positive CHECK (points_value > 0),
  CONSTRAINT vehicle_check_items_frequency_positive CHECK (frequency_days > 0)
);

-- Vehicle checks table (enhanced version)
CREATE TABLE IF NOT EXISTS public.vehicle_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.profiles(id),
  inspector_id UUID REFERENCES public.profiles(id),
  check_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'pre_trip', 'post_trip', 'annual_inspection'
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed', 'requires_attention'
  scheduled_date DATE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  odometer_reading INTEGER,
  fuel_level DECIMAL(5,2),
  overall_condition TEXT, -- 'excellent', 'good', 'fair', 'poor', 'unsafe'
  defects_found INTEGER DEFAULT 0,
  critical_issues INTEGER DEFAULT 0,
  score DECIMAL(5,2), -- overall score out of 100
  pass_fail BOOLEAN,
  next_check_due DATE,
  compliance_status TEXT DEFAULT 'compliant', -- 'compliant', 'non_compliant', 'requires_action'
  compliance_review_status TEXT, -- 'approved', 'rejected', 'requires_action'
  compliance_review_notes TEXT,
  location TEXT,
  weather_conditions TEXT,
  temperature_celsius DECIMAL(4,1),
  notes TEXT,
  attachments JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT vehicle_checks_fuel_level_valid CHECK (fuel_level >= 0 AND fuel_level <= 100),
  CONSTRAINT vehicle_checks_score_valid CHECK (score >= 0 AND score <= 100),
  CONSTRAINT vehicle_checks_defects_positive CHECK (defects_found >= 0 AND critical_issues >= 0),
  CONSTRAINT vehicle_checks_completion_sequence CHECK (completed_at IS NULL OR completed_at >= started_at)
);

-- Add driver risk scores table
CREATE TABLE public.driver_risk_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  score DECIMAL(5,2) NOT NULL,
  calculated_at TIMESTAMPTZ DEFAULT now(),
  factors JSONB DEFAULT '{}',
  risk_level TEXT, -- 'low', 'medium', 'high', 'critical'
  recommendations TEXT[],
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  created_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT driver_risk_scores_score_valid CHECK (score >= 0 AND score <= 100),
  CONSTRAINT driver_risk_scores_validity_period CHECK (valid_until IS NULL OR valid_until >= valid_from)
);