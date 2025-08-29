-- Comprehensive Backend Fix: Create RLS Policies for All Business Tables
-- This will restore full data access while maintaining proper security

-- =============================================
-- PHASE 1: ORGANIZATION-BASED POLICIES (CRITICAL)
-- =============================================

-- VEHICLES TABLE
CREATE POLICY "vehicles_org_access" ON public.vehicles
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- JOBS TABLE  
CREATE POLICY "jobs_org_access" ON public.jobs
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- ROUTES TABLE
CREATE POLICY "routes_org_access" ON public.routes  
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- BOOKINGS TABLE
CREATE POLICY "bookings_org_access" ON public.bookings
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- INCIDENTS TABLE
CREATE POLICY "incidents_org_access" ON public.incidents
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- FUEL RECORDS TABLE
CREATE POLICY "fuel_records_org_access" ON public.fuel_records
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- MAINTENANCE RECORDS TABLE
CREATE POLICY "maintenance_records_org_access" ON public.maintenance_records
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- VEHICLE CHECKS TABLE
CREATE POLICY "vehicle_checks_org_access" ON public.vehicle_checks
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- TACHOGRAPH RECORDS TABLE
CREATE POLICY "tachograph_records_org_access" ON public.tachograph_records
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- =============================================
-- PHASE 2: DRIVER/USER SPECIFIC POLICIES
-- =============================================

-- DRIVER ASSIGNMENTS - drivers can see their own + org admins can see all
CREATE POLICY "driver_assignments_access" ON public.driver_assignments
FOR SELECT USING (
  driver_id = auth.uid() OR 
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'council', 'super_admin')
  )
);

-- DRIVER LOCATIONS - drivers can insert their own + org members can view
CREATE POLICY "driver_locations_insert" ON public.driver_locations
FOR INSERT WITH CHECK (driver_id = auth.uid());

CREATE POLICY "driver_locations_select" ON public.driver_locations
FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- =============================================
-- PHASE 3: DOCUMENTS AND SETTINGS
-- =============================================

-- DOCUMENTS TABLE
CREATE POLICY "documents_org_access" ON public.documents
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- APP SETTINGS - users can manage their own + admins can manage org settings
CREATE POLICY "app_settings_user_own" ON public.app_settings
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "app_settings_org_admin" ON public.app_settings  
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'council', 'super_admin')
  )
);

-- NOTIFICATIONS TABLE
CREATE POLICY "notifications_access" ON public.notifications
FOR ALL USING (
  user_id = auth.uid() OR
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- =============================================
-- PHASE 4: CHILD MANAGEMENT (if used)
-- =============================================

-- CHILD PROFILES
CREATE POLICY "child_profiles_org_access" ON public.child_profiles
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- CHILD TRACKING
CREATE POLICY "child_tracking_org_access" ON public.child_tracking
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- =============================================
-- PHASE 5: SYSTEM TABLES
-- =============================================

-- ORGANIZATIONS - users can view their own organization
CREATE POLICY "organizations_own_access" ON public.organizations
FOR SELECT USING (
  id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- BACKGROUND TASKS - service role access
CREATE POLICY "background_tasks_service" ON public.background_tasks
FOR ALL USING (auth.role() = 'service_role');

-- EMAIL LOGS - org admins can view
CREATE POLICY "email_logs_org_admin" ON public.email_logs
FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'council', 'super_admin')
  )
);

-- EMAIL TEMPLATES - org admins can manage
CREATE POLICY "email_templates_org_admin" ON public.email_templates
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'council', 'super_admin')
  )
);

-- =============================================
-- PHASE 6: COMPLIANCE AND REPORTING
-- =============================================

-- COMPLIANCE VIOLATIONS - already has some policies, but ensure comprehensive access
DROP POLICY IF EXISTS "compliance_violations_select_safe" ON public.compliance_violations;
DROP POLICY IF EXISTS "compliance_violations_insert_safe" ON public.compliance_violations;
DROP POLICY IF EXISTS "compliance_violations_update_safe" ON public.compliance_violations;

CREATE POLICY "compliance_violations_comprehensive" ON public.compliance_violations
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- DAILY PERFORMANCE METRICS
CREATE POLICY "daily_performance_metrics_org" ON public.daily_performance_metrics
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- AI TASKS
CREATE POLICY "ai_tasks_org_access" ON public.ai_tasks
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- AI INSIGHTS
CREATE POLICY "ai_insights_org_access" ON public.ai_insights
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- =============================================
-- PHASE 7: CUSTOMER AND LOGISTICS
-- =============================================

-- CUSTOMERS
CREATE POLICY "customers_org_access" ON public.customers
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- CUSTOMER PROFILES  
CREATE POLICY "customer_profiles_org_access" ON public.customer_profiles
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- CUSTOMER BOOKINGS
CREATE POLICY "customer_bookings_org_access" ON public.customer_bookings
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- =============================================
-- FINAL: ENSURE ALL POLICIES ARE APPLIED
-- =============================================

-- Log completion
INSERT INTO public.audit_logs (action, table_name, new_values) 
VALUES ('policy_creation', 'comprehensive_rls_fix', '{"status": "completed", "policies_created": "all_business_tables"}');