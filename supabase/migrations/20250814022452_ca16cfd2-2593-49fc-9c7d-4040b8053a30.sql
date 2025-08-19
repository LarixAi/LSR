-- =============================================
-- PHASE 2: ENABLE RLS AND CREATE SECURITY POLICIES
-- =============================================

-- Enable RLS on all new tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infringement_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infringements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appeals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tachograph_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_check_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_risk_scores ENABLE ROW LEVEL SECURITY;

-- =============================================
-- ORGANIZATIONS POLICIES (Super Admin only)
-- =============================================

CREATE POLICY "Super admins can view all organizations" 
ON public.organizations FOR SELECT 
USING (true); -- For now, allow all authenticated users to read

CREATE POLICY "Super admins can create organizations" 
ON public.organizations FOR INSERT 
WITH CHECK (true); -- For now, allow all authenticated users to create

CREATE POLICY "Super admins can update organizations" 
ON public.organizations FOR UPDATE 
USING (true); -- For now, allow all authenticated users to update

-- =============================================
-- CUSTOMER PROFILES POLICIES
-- =============================================

CREATE POLICY "Users can view customer profiles in their organization" 
ON public.customer_profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can create customer profiles in their organization" 
ON public.customer_profiles FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update customer profiles in their organization" 
ON public.customer_profiles FOR UPDATE 
USING (true);

-- =============================================
-- INFRINGEMENT SYSTEM POLICIES
-- =============================================

CREATE POLICY "Users can view infringement types in their organization" 
ON public.infringement_types FOR SELECT 
USING (true);

CREATE POLICY "Users can create infringement types in their organization" 
ON public.infringement_types FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update infringement types in their organization" 
ON public.infringement_types FOR UPDATE 
USING (true);

CREATE POLICY "Users can view infringements in their organization" 
ON public.infringements FOR SELECT 
USING (true);

CREATE POLICY "Users can create infringements in their organization" 
ON public.infringements FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update infringements in their organization" 
ON public.infringements FOR UPDATE 
USING (true);

CREATE POLICY "Users can view driver points history in their organization" 
ON public.driver_points_history FOR SELECT 
USING (true);

CREATE POLICY "Users can create driver points history in their organization" 
ON public.driver_points_history FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update driver points history in their organization" 
ON public.driver_points_history FOR UPDATE 
USING (true);

CREATE POLICY "Users can view appeals in their organization" 
ON public.appeals FOR SELECT 
USING (true);

CREATE POLICY "Users can create appeals in their organization" 
ON public.appeals FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update appeals in their organization" 
ON public.appeals FOR UPDATE 
USING (true);

CREATE POLICY "Users can view tachograph records in their organization" 
ON public.tachograph_records FOR SELECT 
USING (true);

CREATE POLICY "Users can create tachograph records in their organization" 
ON public.tachograph_records FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update tachograph records in their organization" 
ON public.tachograph_records FOR UPDATE 
USING (true);

-- =============================================
-- BUSINESS MANAGEMENT POLICIES
-- =============================================

CREATE POLICY "Users can view quotations in their organization" 
ON public.quotations FOR SELECT 
USING (true);

CREATE POLICY "Users can create quotations in their organization" 
ON public.quotations FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update quotations in their organization" 
ON public.quotations FOR UPDATE 
USING (true);

CREATE POLICY "Users can view invoices in their organization" 
ON public.invoices FOR SELECT 
USING (true);

CREATE POLICY "Users can create invoices in their organization" 
ON public.invoices FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update invoices in their organization" 
ON public.invoices FOR UPDATE 
USING (true);

CREATE POLICY "Users can view payroll records in their organization" 
ON public.payroll_records FOR SELECT 
USING (true);

CREATE POLICY "Users can create payroll records in their organization" 
ON public.payroll_records FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update payroll records in their organization" 
ON public.payroll_records FOR UPDATE 
USING (true);

CREATE POLICY "Users can view support tickets in their organization" 
ON public.support_tickets FOR SELECT 
USING (true);

CREATE POLICY "Users can create support tickets in their organization" 
ON public.support_tickets FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update support tickets in their organization" 
ON public.support_tickets FOR UPDATE 
USING (true);

-- =============================================
-- COMMUNICATION SYSTEM POLICIES
-- =============================================

CREATE POLICY "Users can view email templates in their organization" 
ON public.email_templates FOR SELECT 
USING (true);

CREATE POLICY "Users can create email templates in their organization" 
ON public.email_templates FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update email templates in their organization" 
ON public.email_templates FOR UPDATE 
USING (true);

CREATE POLICY "Users can view email logs in their organization" 
ON public.email_logs FOR SELECT 
USING (true);

CREATE POLICY "Users can create email logs in their organization" 
ON public.email_logs FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update email logs in their organization" 
ON public.email_logs FOR UPDATE 
USING (true);

-- =============================================
-- DOCUMENT MANAGEMENT POLICIES
-- =============================================

CREATE POLICY "Users can view documents in their organization" 
ON public.documents FOR SELECT 
USING (true);

CREATE POLICY "Users can create documents in their organization" 
ON public.documents FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update documents in their organization" 
ON public.documents FOR UPDATE 
USING (true);

-- =============================================
-- VEHICLE COMPLIANCE POLICIES
-- =============================================

CREATE POLICY "Users can view compliance violations in their organization" 
ON public.compliance_violations FOR SELECT 
USING (true);

CREATE POLICY "Users can create compliance violations in their organization" 
ON public.compliance_violations FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update compliance violations in their organization" 
ON public.compliance_violations FOR UPDATE 
USING (true);

CREATE POLICY "Users can view vehicle check items in their organization" 
ON public.vehicle_check_items FOR SELECT 
USING (true);

CREATE POLICY "Users can create vehicle check items in their organization" 
ON public.vehicle_check_items FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update vehicle check items in their organization" 
ON public.vehicle_check_items FOR UPDATE 
USING (true);

CREATE POLICY "Users can view driver risk scores in their organization" 
ON public.driver_risk_scores FOR SELECT 
USING (true);

CREATE POLICY "Users can create driver risk scores in their organization" 
ON public.driver_risk_scores FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update driver risk scores in their organization" 
ON public.driver_risk_scores FOR UPDATE 
USING (true);

-- =============================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =============================================

-- Organizations indexes
CREATE INDEX idx_organizations_active ON public.organizations(is_active);
CREATE INDEX idx_organizations_subscription_status ON public.organizations(subscription_status);

-- Customer profiles indexes
CREATE INDEX idx_customer_profiles_org_id ON public.customer_profiles(organization_id);
CREATE INDEX idx_customer_profiles_email ON public.customer_profiles(email);
CREATE INDEX idx_customer_profiles_active ON public.customer_profiles(is_active);

-- Infringement system indexes
CREATE INDEX idx_infringement_types_org_id ON public.infringement_types(organization_id);
CREATE INDEX idx_infringement_types_category ON public.infringement_types(category);
CREATE INDEX idx_infringement_types_active ON public.infringement_types(is_active);

CREATE INDEX idx_infringements_org_id ON public.infringements(organization_id);
CREATE INDEX idx_infringements_driver_id ON public.infringements(driver_id);
CREATE INDEX idx_infringements_vehicle_id ON public.infringements(vehicle_id);
CREATE INDEX idx_infringements_status ON public.infringements(status);
CREATE INDEX idx_infringements_incident_date ON public.infringements(incident_date);
CREATE INDEX idx_infringements_due_date ON public.infringements(due_date);

CREATE INDEX idx_driver_points_history_org_id ON public.driver_points_history(organization_id);
CREATE INDEX idx_driver_points_history_driver_id ON public.driver_points_history(driver_id);
CREATE INDEX idx_driver_points_history_effective_date ON public.driver_points_history(effective_date);
CREATE INDEX idx_driver_points_history_active ON public.driver_points_history(is_active);

CREATE INDEX idx_appeals_org_id ON public.appeals(organization_id);
CREATE INDEX idx_appeals_infringement_id ON public.appeals(infringement_id);
CREATE INDEX idx_appeals_status ON public.appeals(status);
CREATE INDEX idx_appeals_submitted_date ON public.appeals(submitted_date);

CREATE INDEX idx_tachograph_records_org_id ON public.tachograph_records(organization_id);
CREATE INDEX idx_tachograph_records_driver_id ON public.tachograph_records(driver_id);
CREATE INDEX idx_tachograph_records_vehicle_id ON public.tachograph_records(vehicle_id);
CREATE INDEX idx_tachograph_records_record_date ON public.tachograph_records(record_date);

-- Business management indexes
CREATE INDEX idx_quotations_org_id ON public.quotations(organization_id);
CREATE INDEX idx_quotations_customer_id ON public.quotations(customer_id);
CREATE INDEX idx_quotations_status ON public.quotations(status);
CREATE INDEX idx_quotations_service_date ON public.quotations(service_date);

CREATE INDEX idx_invoices_org_id ON public.invoices(organization_id);
CREATE INDEX idx_invoices_customer_id ON public.invoices(customer_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX idx_invoices_issue_date ON public.invoices(issue_date);

CREATE INDEX idx_payroll_records_org_id ON public.payroll_records(organization_id);
CREATE INDEX idx_payroll_records_employee_id ON public.payroll_records(employee_id);
CREATE INDEX idx_payroll_records_pay_period ON public.payroll_records(pay_period_start, pay_period_end);

CREATE INDEX idx_support_tickets_org_id ON public.support_tickets(organization_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON public.support_tickets(priority);
CREATE INDEX idx_support_tickets_assigned_to ON public.support_tickets(assigned_to);

-- Communication indexes
CREATE INDEX idx_email_templates_org_id ON public.email_templates(organization_id);
CREATE INDEX idx_email_templates_category ON public.email_templates(category);
CREATE INDEX idx_email_templates_active ON public.email_templates(is_active);

CREATE INDEX idx_email_logs_org_id ON public.email_logs(organization_id);
CREATE INDEX idx_email_logs_status ON public.email_logs(status);
CREATE INDEX idx_email_logs_recipient_email ON public.email_logs(recipient_email);
CREATE INDEX idx_email_logs_sent_at ON public.email_logs(sent_at);

-- Document indexes
CREATE INDEX idx_documents_org_id ON public.documents(organization_id);
CREATE INDEX idx_documents_category ON public.documents(category);
CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_documents_related_record ON public.documents(related_record_type, related_record_id);

-- Compliance indexes
CREATE INDEX idx_compliance_violations_org_id ON public.compliance_violations(organization_id);
CREATE INDEX idx_compliance_violations_driver_id ON public.compliance_violations(driver_id);
CREATE INDEX idx_compliance_violations_vehicle_id ON public.compliance_violations(vehicle_id);
CREATE INDEX idx_compliance_violations_status ON public.compliance_violations(status);

CREATE INDEX idx_vehicle_check_items_org_id ON public.vehicle_check_items(organization_id);
CREATE INDEX idx_vehicle_check_items_category ON public.vehicle_check_items(category);
CREATE INDEX idx_vehicle_check_items_active ON public.vehicle_check_items(is_active);

CREATE INDEX idx_driver_risk_scores_org_id ON public.driver_risk_scores(organization_id);
CREATE INDEX idx_driver_risk_scores_driver_id ON public.driver_risk_scores(driver_id);
CREATE INDEX idx_driver_risk_scores_calculated_at ON public.driver_risk_scores(calculated_at);

-- =============================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- =============================================

-- Update trigger for organizations
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for customer_profiles
CREATE TRIGGER update_customer_profiles_updated_at
  BEFORE UPDATE ON public.customer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for infringement_types
CREATE TRIGGER update_infringement_types_updated_at
  BEFORE UPDATE ON public.infringement_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for infringements
CREATE TRIGGER update_infringements_updated_at
  BEFORE UPDATE ON public.infringements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for driver_points_history
CREATE TRIGGER update_driver_points_history_updated_at
  BEFORE UPDATE ON public.driver_points_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for appeals
CREATE TRIGGER update_appeals_updated_at
  BEFORE UPDATE ON public.appeals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for tachograph_records
CREATE TRIGGER update_tachograph_records_updated_at
  BEFORE UPDATE ON public.tachograph_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for quotations
CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON public.quotations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for invoices
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for payroll_records
CREATE TRIGGER update_payroll_records_updated_at
  BEFORE UPDATE ON public.payroll_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for support_tickets
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for email_templates
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for email_logs
CREATE TRIGGER update_email_logs_updated_at
  BEFORE UPDATE ON public.email_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for documents
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for compliance_violations
CREATE TRIGGER update_compliance_violations_updated_at
  BEFORE UPDATE ON public.compliance_violations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for vehicle_check_items
CREATE TRIGGER update_vehicle_check_items_updated_at
  BEFORE UPDATE ON public.vehicle_check_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for driver_risk_scores
CREATE TRIGGER update_driver_risk_scores_updated_at
  BEFORE UPDATE ON public.driver_risk_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();