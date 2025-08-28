-- Backend Fix: Create RLS Policies for Existing Tables Only
-- This will restore data access for tables that actually exist

-- =============================================
-- CORE BUSINESS TABLE POLICIES  
-- =============================================

-- BOOKINGS (exists in db)
CREATE POLICY "bookings_org_access" ON public.bookings
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- CUSTOMERS (exists in db)
CREATE POLICY "customers_org_access" ON public.customers
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- CUSTOMER_PROFILES (exists in db)
CREATE POLICY "customer_profiles_org_access" ON public.customer_profiles
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- CUSTOMER_BOOKINGS (exists in db)
CREATE POLICY "customer_bookings_org_access" ON public.customer_bookings
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- FUEL_RECORDS (exists in db)
CREATE POLICY "fuel_records_org_access" ON public.fuel_records
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- FUEL_TRANSACTIONS (has some policies but need comprehensive access)
CREATE POLICY "fuel_transactions_comprehensive" ON public.fuel_transactions
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- =============================================
-- DOCUMENT AND SETTINGS POLICIES
-- =============================================

-- DOCUMENTS (exists in db)
CREATE POLICY "documents_org_access" ON public.documents
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- DOCUMENT_FOLDERS (exists in db)  
CREATE POLICY "document_folders_org_access" ON public.document_folders
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- DOCUMENT_APPROVALS (exists in db)
CREATE POLICY "document_approvals_org_access" ON public.document_approvals
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- =============================================
-- CHILD MANAGEMENT POLICIES (if used)
-- =============================================

-- CHILD_PROFILES (exists in db)
CREATE POLICY "child_profiles_org_access" ON public.child_profiles
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- CHILD_TRACKING (exists in db)
CREATE POLICY "child_tracking_org_access" ON public.child_tracking
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- DAILY_ATTENDANCE (exists in db)
CREATE POLICY "daily_attendance_org_access" ON public.daily_attendance
FOR ALL USING (
  child_id IN (
    SELECT id FROM public.child_profiles cp
    WHERE cp.organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  )
);

-- =============================================
-- COMPLIANCE AND MONITORING POLICIES
-- =============================================

-- Drop existing safe policies that might be too restrictive
DROP POLICY IF EXISTS "compliance_violations_select_safe" ON public.compliance_violations;
DROP POLICY IF EXISTS "compliance_violations_insert_safe" ON public.compliance_violations;
DROP POLICY IF EXISTS "compliance_violations_update_safe" ON public.compliance_violations;

-- COMPLIANCE_VIOLATIONS (comprehensive access)
CREATE POLICY "compliance_violations_comprehensive" ON public.compliance_violations
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- COMPLIANCE_ALERTS (exists in db)
CREATE POLICY "compliance_alerts_org_access" ON public.compliance_alerts
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- COMPLIANCE_AUDIT_LOGS (exists in db)
CREATE POLICY "compliance_audit_logs_org_access" ON public.compliance_audit_logs
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- =============================================
-- DRIVER SPECIFIC POLICIES
-- =============================================

-- DRIVER_LICENSES (exists in db)
CREATE POLICY "driver_licenses_org_access" ON public.driver_licenses
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- DRIVER_SETTINGS (exists in db)
CREATE POLICY "driver_settings_access" ON public.driver_settings
FOR ALL USING (
  driver_id = auth.uid() OR
  driver_id IN (
    SELECT id FROM public.profiles p1
    WHERE p1.organization_id IN (
      SELECT organization_id FROM public.profiles p2
      WHERE p2.id = auth.uid() AND p2.role IN ('admin', 'council', 'super_admin')
    )
  )
);

-- DRIVER_RISK_SCORES (exists in db)
CREATE POLICY "driver_risk_scores_org_access" ON public.driver_risk_scores
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- DRIVER_COMPLIANCE_SCORES (exists in db)
CREATE POLICY "driver_compliance_scores_org_access" ON public.driver_compliance_scores
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- =============================================
-- AI AND ANALYTICS POLICIES
-- =============================================

-- AI_TASKS (exists in db)
CREATE POLICY "ai_tasks_org_access" ON public.ai_tasks
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- AI_INSIGHTS (exists in db)
CREATE POLICY "ai_insights_org_access" ON public.ai_insights
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- AI_CONTEXT (exists in db)
CREATE POLICY "ai_context_org_access" ON public.ai_context
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  ) OR user_id = auth.uid()
);

-- DAILY_PERFORMANCE_METRICS (exists in db)
CREATE POLICY "daily_performance_metrics_org_access" ON public.daily_performance_metrics
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- =============================================
-- SYSTEM AND ADMIN POLICIES
-- =============================================

-- ENHANCED_NOTIFICATIONS (exists in db)
CREATE POLICY "enhanced_notifications_access" ON public.enhanced_notifications
FOR ALL USING (
  user_id = auth.uid() OR
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- EMAIL_TEMPLATES (exists in db)
CREATE POLICY "email_templates_org_admin" ON public.email_templates
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'council', 'super_admin')
  )
);

-- EMAIL_LOGS (exists in db)
CREATE POLICY "email_logs_org_admin" ON public.email_logs
FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'council', 'super_admin')
  )
);

-- AUDIT_LOGS (exists in db)
CREATE POLICY "audit_logs_org_admin" ON public.audit_logs
FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'council', 'super_admin')
  )
);

-- BACKGROUND_TASKS (exists in db) - service role access
CREATE POLICY "background_tasks_service" ON public.background_tasks
FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- FUEL EFFICIENCY AND ALERTS
-- =============================================

-- FUEL_EFFICIENCY_RECORDS (exists in db)
CREATE POLICY "fuel_efficiency_records_org_access" ON public.fuel_efficiency_records
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- FUEL_ALERTS (exists in db)
CREATE POLICY "fuel_alerts_org_access" ON public.fuel_alerts
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Log completion
INSERT INTO public.audit_logs (action, table_name, new_values, user_id) 
VALUES (
  'comprehensive_rls_policies_created', 
  'multiple_tables', 
  '{"status": "completed", "tables_secured": "existing_tables_only"}',
  auth.uid()
);