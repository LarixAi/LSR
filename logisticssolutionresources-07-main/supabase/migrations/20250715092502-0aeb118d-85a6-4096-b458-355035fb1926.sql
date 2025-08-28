-- Fix the data type mismatch in daily_attendance table
-- The issue is that child_id is UUID but child_profiles.id is bigint

-- First, let's see what type child_profiles.id actually is
-- If child_profiles.id is bigint, we need to change daily_attendance.child_id to match

-- Drop the broken policies first
DROP POLICY IF EXISTS "parents_can_view_their_children_attendance" ON public.daily_attendance;
DROP POLICY IF EXISTS "drivers_can_view_route_attendance" ON public.daily_attendance;

-- Fix the data type issue - change child_id to match child_profiles.id type
ALTER TABLE public.daily_attendance 
ALTER COLUMN child_id TYPE bigint USING child_id::text::bigint;

-- Now create correct policies with proper data types
CREATE POLICY "parents_can_view_their_children_attendance" ON public.daily_attendance
    FOR SELECT USING (
        child_id IN (
            SELECT id 
            FROM public.child_profiles 
            WHERE parent_id = auth.uid()
        )
    );

CREATE POLICY "drivers_can_view_route_attendance" ON public.daily_attendance
    FOR SELECT USING (
        EXISTS (
            SELECT 1 
            FROM public.child_profiles cp
            JOIN public.driver_assignments da ON cp.route_id = da.route_id
            WHERE cp.id = daily_attendance.child_id
            AND da.driver_id = auth.uid()
            AND da.is_active = true
        )
    );