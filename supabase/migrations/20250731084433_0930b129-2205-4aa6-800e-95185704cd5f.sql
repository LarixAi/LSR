-- Add missing RLS policies for tables that currently have RLS enabled but no policies

-- For ai_automation_rules (already has policies, skip)
-- For ai_context (already has policies, skip)
-- For ai_insights (already has policies, skip)
-- For ai_task_dependencies (already has policies, skip)
-- For ai_task_time_entries (already has policies, skip)
-- For ai_tasks (already has policies, skip)

-- Add policies for alert_instances (referenced in linter warnings)
CREATE POLICY "Users can view organization alert instances" 
ON public.alert_instances FOR SELECT 
USING (
    organization_id IN (
        SELECT organization_id 
        FROM public.profiles 
        WHERE id = auth.uid()
    )
);

-- Add policies for alert_rules (already has admin policy, but add view policy)
CREATE POLICY "Users can view organization alert rules" 
ON public.alert_rules FOR SELECT 
USING (
    organization_id IN (
        SELECT organization_id 
        FROM public.profiles 
        WHERE id = auth.uid()
    )
);

-- Add policies for analytics
CREATE POLICY "Anyone can view analytics" 
ON public.analytics FOR SELECT 
USING (true);

-- Add policies for app_settings (already has policies, skip)

-- Add policies for audit_logs (already has policies, skip)

-- Add policies for auth_config (already has policies, skip)

-- Add policies for automated_test_schedules (already has policies, skip)

-- Add policies for background_tasks (already has policies, skip)

-- Add policies for booking_tracking (already has policies, skip)

-- Add policies for cache_invalidation (already has policies, skip)

-- Add policies for child_profiles (already has policies, skip)

-- Add policies for child_tracking (already has policies, skip)

-- Add policies for company_subscriptions (already has policies, skip)

-- Add policies for compliance_alerts (already has policies, skip)

-- Add policies for compliance_audit_logs (already has policies, skip)

-- Add policies for compliance_violations (already has policies, skip)

-- Add policies for customer_bookings (already has policies, skip)

-- Add policies for customer_loyalty_cards (already has policies, skip)

-- Add policies for customer_profiles (already has policies, skip)

-- Add policies for daily_attendance (already has policies, skip)

-- Add policies for dashboard_configs (already has policies, skip)

-- Add policies for demo_requests (already has policies, skip)

-- Add policies for deployment_tracking (already has policies, skip)

-- Add policies for document_folders (already has policies, skip)

-- Add policies for documents (already has policies, skip)

-- Check if driver_assignments table needs policies
CREATE POLICY "Organization members can view driver assignments" 
ON public.driver_assignments FOR SELECT 
USING (
    driver_id IN (
        SELECT id FROM public.profiles 
        WHERE organization_id IN (
            SELECT organization_id 
            FROM public.profiles 
            WHERE id = auth.uid()
        )
    )
);

CREATE POLICY "Admins can manage driver assignments" 
ON public.driver_assignments FOR ALL 
USING (
    driver_id IN (
        SELECT id FROM public.profiles 
        WHERE organization_id IN (
            SELECT organization_id 
            FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'council')
        )
    )
);