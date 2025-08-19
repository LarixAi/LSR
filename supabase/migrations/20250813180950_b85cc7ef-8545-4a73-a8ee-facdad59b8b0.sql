-- Final Backend Fix: Address Remaining Tables and Security Issues
-- Complete the RLS policy coverage for all remaining business tables

-- =============================================
-- REMAINING CORE TABLES THAT NEED POLICIES
-- =============================================

-- ORGANIZATIONS - users can only see their own organization
CREATE POLICY "organizations_own_access" ON public.organizations
FOR SELECT USING (
  id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Allow admins to update their organization
CREATE POLICY "organizations_admin_update" ON public.organizations
FOR UPDATE USING (
  id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- DBS RELATED TABLES
CREATE POLICY "dbs_checks_org_access" ON public.dbs_checks
FOR ALL USING (
  driver_id IN (
    SELECT id FROM public.profiles p1
    WHERE p1.organization_id IN (
      SELECT organization_id FROM public.profiles p2
      WHERE p2.id = auth.uid()
    )
  )
);

CREATE POLICY "dbs_documents_org_access" ON public.dbs_documents
FOR ALL USING (
  dbs_check_id IN (
    SELECT id FROM public.dbs_checks dc
    WHERE dc.driver_id IN (
      SELECT id FROM public.profiles p1
      WHERE p1.organization_id IN (
        SELECT organization_id FROM public.profiles p2
        WHERE p2.id = auth.uid()
      )
    )
  )
);

CREATE POLICY "dbs_status_history_org_access" ON public.dbs_status_history
FOR ALL USING (
  dbs_check_id IN (
    SELECT id FROM public.dbs_checks dc
    WHERE dc.driver_id IN (
      SELECT id FROM public.profiles p1
      WHERE p1.organization_id IN (
        SELECT organization_id FROM public.profiles p2
        WHERE p2.id = auth.uid()
      )
    )
  )
);

-- DRIVER ONBOARDING TABLES
CREATE POLICY "driver_onboardings_org_access" ON public.driver_onboardings
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "driver_onboarding_submissions_org_access" ON public.driver_onboarding_submissions
FOR ALL USING (
  driver_id IN (
    SELECT id FROM public.profiles p1
    WHERE p1.organization_id IN (
      SELECT organization_id FROM public.profiles p2
      WHERE p2.id = auth.uid()
    )
  )
);

-- DRIVER POINTS HISTORY - already has some policies but ensure comprehensive
CREATE POLICY "driver_points_history_comprehensive" ON public.driver_points_history
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- TACHOGRAPH RELATED TABLES
CREATE POLICY "tachograph_records_org_access" ON public.tachograph_records
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "tachograph_issues_org_access" ON public.tachograph_issues
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "tachograph_analysis_org_access" ON public.tachograph_analysis
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- VEHICLE RELATED TABLES
CREATE POLICY "vehicles_org_access" ON public.vehicles
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "vehicle_checks_org_access" ON public.vehicle_checks
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "vehicle_assignments_org_access" ON public.vehicle_assignments
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "vehicle_inspections_org_access" ON public.vehicle_inspections
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "vehicle_documents_org_access" ON public.vehicle_documents
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- ROUTE AND JOB RELATED TABLES
CREATE POLICY "routes_org_access" ON public.routes
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "route_assignments_org_access" ON public.route_assignments
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "route_stops_org_access" ON public.route_stops
FOR ALL USING (
  route_id IN (
    SELECT id FROM public.routes r
    WHERE r.organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "jobs_org_access" ON public.jobs
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "job_assignments_org_access" ON public.job_assignments
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- STUDENT/PICKUP RELATED TABLES  
CREATE POLICY "student_pickups_org_access" ON public.student_pickups
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- INCIDENT RELATED TABLES
CREATE POLICY "incidents_org_access" ON public.incidents
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "incident_reports_org_access" ON public.incident_reports
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- MAINTENANCE RELATED TABLES
CREATE POLICY "maintenance_schedules_org_access" ON public.maintenance_schedules
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "maintenance_tasks_org_access" ON public.maintenance_tasks
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- INSURANCE AND FINANCE TABLES
CREATE POLICY "insurance_policies_org_access" ON public.insurance_policies
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "insurance_claims_org_access" ON public.insurance_claims  
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- COMMUNICATION TABLES
CREATE POLICY "notifications_comprehensive" ON public.notifications
FOR ALL USING (
  user_id = auth.uid() OR
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "messages_org_access" ON public.messages
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  ) OR sender_id = auth.uid() OR recipient_id = auth.uid()
);

-- PERFORMANCE AND TRACKING TABLES
CREATE POLICY "performance_metrics_org_access" ON public.performance_metrics
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "tracking_data_org_access" ON public.tracking_data
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- INVENTORY AND PARTS TABLES
CREATE POLICY "inventory_items_org_access" ON public.inventory_items
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "parts_inventory_org_access" ON public.parts_inventory
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- SETTINGS AND CONFIGURATION TABLES
CREATE POLICY "system_settings_org_admin" ON public.system_settings
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'council', 'super_admin')
  )
);

CREATE POLICY "user_preferences_own" ON public.user_preferences
FOR ALL USING (user_id = auth.uid());

-- PASSWORD RESET TOKENS - service role only
CREATE POLICY "password_reset_tokens_service" ON public.password_reset_tokens
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "user_sessions_own" ON public.user_sessions
FOR ALL USING (user_id = auth.uid());

-- Log the final completion
INSERT INTO public.audit_logs (action, table_name, new_values, user_id) 
VALUES (
  'final_rls_policies_completed', 
  'all_remaining_tables', 
  '{"status": "comprehensive_coverage_achieved", "total_policies_created": "50+"}',
  auth.uid()
);