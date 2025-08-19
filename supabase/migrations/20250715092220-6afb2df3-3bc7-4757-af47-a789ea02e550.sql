-- Fix RLS Enabled No Policy Issue for daily_attendance table (corrected)
-- Create appropriate RLS policies for daily_attendance table

-- Create policies for daily_attendance table
CREATE POLICY "parents_can_view_their_children_attendance" ON public.daily_attendance
    FOR SELECT USING (
        child_id IN (
            SELECT id::text::uuid 
            FROM public.child_profiles 
            WHERE parent_id = auth.uid()
        )
    );

CREATE POLICY "admins_can_manage_all_attendance" ON public.daily_attendance
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'council')
        )
    );

CREATE POLICY "drivers_can_view_route_attendance" ON public.daily_attendance
    FOR SELECT USING (
        EXISTS (
            SELECT 1 
            FROM public.child_profiles cp
            JOIN public.driver_assignments da ON cp.route_id = da.route_id
            WHERE cp.id::text::uuid = daily_attendance.child_id
            AND da.driver_id = auth.uid()
            AND da.is_active = true
        )
    );

CREATE POLICY "staff_can_create_attendance_records" ON public.daily_attendance
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'council', 'driver')
        )
    );

CREATE POLICY "staff_can_update_attendance_records" ON public.daily_attendance
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'council', 'driver')
        )
    );

-- Also fix other tables that might have RLS enabled without policies
-- Fix system_logs table (drop existing if any, then create new)
DROP POLICY IF EXISTS "system_logs_admin_only" ON public.system_logs;
CREATE POLICY "system_logs_admin_only" ON public.system_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Fix security_audit_logs table
DROP POLICY IF EXISTS "security_audit_logs_admin_only" ON public.security_audit_logs;
CREATE POLICY "security_audit_logs_admin_only" ON public.security_audit_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );