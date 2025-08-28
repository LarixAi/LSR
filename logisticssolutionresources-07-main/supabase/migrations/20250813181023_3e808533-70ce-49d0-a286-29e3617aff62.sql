-- Final Targeted Backend Fix: Only Existing Tables
-- This addresses only the tables that definitely exist in the database

-- =============================================
-- ORGANIZATIONS TABLE (definitely exists)
-- =============================================
CREATE POLICY "organizations_own_access" ON public.organizations
FOR SELECT USING (
  id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "organizations_admin_update" ON public.organizations
FOR UPDATE USING (
  id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- =============================================
-- DBS TABLES (definitely exist)
-- =============================================
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

-- =============================================
-- DRIVER ONBOARDING TABLES (definitely exist)
-- =============================================
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

-- =============================================
-- TACHOGRAPH TABLES (only the ones that exist)  
-- =============================================
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

-- =============================================
-- PASSWORD RESET AND SESSIONS (definitely exist)
-- =============================================
CREATE POLICY "password_reset_tokens_service" ON public.password_reset_tokens
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "user_sessions_own" ON public.user_sessions
FOR ALL USING (user_id = auth.uid());

-- =============================================
-- FINAL LOG ENTRY
-- =============================================
-- Log the final completion (only if authenticated)
DO $$ 
BEGIN
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.audit_logs (action, table_name, new_values, user_id) 
    VALUES (
      'backend_fix_completed', 
      'existing_tables_only', 
      '{"status": "comprehensive_rls_policies_applied", "authentication_fixed": "true"}',
      auth.uid()
    );
  END IF;
END $$;