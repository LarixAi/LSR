
-- Phase 1: Critical RLS Policy Cleanup and Missing Policies

-- First, let's clean up the documents table RLS policies
DROP POLICY IF EXISTS "documents_owner_access" ON public.documents;
DROP POLICY IF EXISTS "documents_admin_access" ON public.documents;

-- Create proper documents policies with better logic
CREATE POLICY "documents_user_access" ON public.documents
    FOR ALL USING (
        -- Users can access documents they uploaded OR admins can access all
        auth.uid()::text = related_entity_id::text OR public.is_admin_user(auth.uid())
    );

-- Add missing RLS policies for tables that don't have them
CREATE POLICY "compliance_violations_driver_access" ON public.compliance_violations
    FOR ALL USING (
        -- Drivers can see their own violations, admins can see all
        auth.uid() = driver_id OR public.is_admin_user(auth.uid())
    );

CREATE POLICY "driver_assignments_access" ON public.driver_assignments
    FOR ALL USING (
        -- Drivers can see their own assignments, admins can see all
        auth.uid() = driver_id OR public.is_admin_user(auth.uid())
    );

CREATE POLICY "time_entries_access" ON public.time_entries
    FOR ALL USING (
        -- Drivers can see their own time entries, admins can see all
        auth.uid() = driver_id OR public.is_admin_user(auth.uid())
    );

CREATE POLICY "time_off_requests_access" ON public.time_off_requests
    FOR ALL USING (
        -- Drivers can see their own requests, admins can see all
        auth.uid() = driver_id OR public.is_admin_user(auth.uid())
    );

CREATE POLICY "vehicle_checks_access" ON public.vehicle_checks
    FOR ALL USING (
        -- Drivers can see their own checks, admins can see all
        auth.uid() = driver_id OR public.is_admin_user(auth.uid())
    );

CREATE POLICY "vehicles_access" ON public.vehicles
    FOR SELECT USING (
        -- All authenticated users can view vehicles, only admins can modify
        auth.role() = 'authenticated'
    );

CREATE POLICY "vehicles_admin_modify" ON public.vehicles
    FOR INSERT WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "vehicles_admin_update" ON public.vehicles
    FOR UPDATE USING (public.is_admin_user(auth.uid()));

CREATE POLICY "vehicles_admin_delete" ON public.vehicles
    FOR DELETE USING (public.is_admin_user(auth.uid()));

-- Add onboarding tasks policies
CREATE POLICY "onboarding_tasks_public_read" ON public.onboarding_tasks
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "onboarding_tasks_admin_modify" ON public.onboarding_tasks
    FOR ALL USING (public.is_admin_user(auth.uid()));

-- Create enhanced security logging function for RLS violations
CREATE OR REPLACE FUNCTION public.log_rls_violation(
    p_table_name TEXT,
    p_operation TEXT,
    p_user_id UUID DEFAULT auth.uid()
)
RETURNS VOID AS $$
BEGIN
    PERFORM public.log_security_event(
        p_user_id,
        'rls_violation',
        jsonb_build_object(
            'table', p_table_name,
            'operation', p_operation,
            'timestamp', now()
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to validate password complexity
CREATE OR REPLACE FUNCTION public.validate_password_complexity(password TEXT)
RETURNS JSONB AS $$
DECLARE
    result JSONB := '{"valid": true, "errors": []}'::jsonb;
    errors TEXT[] := '{}';
BEGIN
    -- Check minimum length
    IF LENGTH(password) < 8 THEN
        errors := array_append(errors, 'Password must be at least 8 characters long');
    END IF;
    
    -- Check for uppercase letter
    IF password !~ '[A-Z]' THEN
        errors := array_append(errors, 'Password must contain at least one uppercase letter');
    END IF;
    
    -- Check for lowercase letter
    IF password !~ '[a-z]' THEN
        errors := array_append(errors, 'Password must contain at least one lowercase letter');
    END IF;
    
    -- Check for number
    IF password !~ '[0-9]' THEN
        errors := array_append(errors, 'Password must contain at least one number');
    END IF;
    
    -- Check for special character
    IF password !~ '[!@#$%^&*(),.?":{}|<>]' THEN
        errors := array_append(errors, 'Password must contain at least one special character');
    END IF;
    
    -- Build result
    IF array_length(errors, 1) > 0 THEN
        result := jsonb_build_object(
            'valid', false,
            'errors', array_to_json(errors)
        );
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
