
-- Fix missing RLS policies (skip existing constraints)

-- Add RLS policies for all tables that are missing them

-- Fix vehicles table policies
DROP POLICY IF EXISTS "Admins and council can manage vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Drivers can view vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Parents can view active vehicles" ON public.vehicles;

CREATE POLICY "Admins and council can manage vehicles" ON public.vehicles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'council')
    )
  );

CREATE POLICY "Drivers can view vehicles" ON public.vehicles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'driver'
    )
  );

CREATE POLICY "Parents can view active vehicles" ON public.vehicles
  FOR SELECT USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'parent'
    )
  );

-- Fix routes table policies
DROP POLICY IF EXISTS "Admins and council can manage routes" ON public.routes;
DROP POLICY IF EXISTS "Everyone can view active routes" ON public.routes;

CREATE POLICY "Admins and council can manage routes" ON public.routes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'council')
    )
  );

CREATE POLICY "Everyone can view active routes" ON public.routes
  FOR SELECT USING (is_active = true);

-- Add missing policies for tables without any RLS policies
DROP POLICY IF EXISTS "Users can view their own child profiles" ON public.child_profiles;
DROP POLICY IF EXISTS "Users can manage their own child profiles" ON public.child_profiles;

CREATE POLICY "Users can view their own child profiles" ON public.child_profiles
  FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "Users can manage their own child profiles" ON public.child_profiles
  FOR ALL USING (parent_id = auth.uid());

DROP POLICY IF EXISTS "Users can view their own attendance records" ON public.daily_attendance;
DROP POLICY IF EXISTS "Drivers can manage attendance for their routes" ON public.daily_attendance;

CREATE POLICY "Users can view their own attendance records" ON public.daily_attendance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.child_profiles 
      WHERE id = daily_attendance.child_id AND parent_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can manage attendance for their routes" ON public.daily_attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.driver_assignments da
      WHERE da.route_id = daily_attendance.route_id 
      AND da.driver_id = auth.uid()
      AND da.is_active = true
    )
  );

DROP POLICY IF EXISTS "Users can view their own students" ON public.students;
DROP POLICY IF EXISTS "Users can manage their own students" ON public.students;

CREATE POLICY "Users can view their own students" ON public.students
  FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "Users can manage their own students" ON public.students
  FOR ALL USING (parent_id = auth.uid());

-- Add policies for risk assessments
DROP POLICY IF EXISTS "Users can view risk assessments for their children" ON public.risk_assessments;
DROP POLICY IF EXISTS "Admins can manage all risk assessments" ON public.risk_assessments;

CREATE POLICY "Users can view risk assessments for their children" ON public.risk_assessments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.child_profiles 
      WHERE id = risk_assessments.child_id AND parent_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all risk assessments" ON public.risk_assessments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'council')
    )
  );

-- Ensure proper indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_child_profiles_parent_id ON public.child_profiles(parent_id);
CREATE INDEX IF NOT EXISTS idx_students_parent_id ON public.students(parent_id);
CREATE INDEX IF NOT EXISTS idx_daily_attendance_child_id ON public.daily_attendance(child_id);
CREATE INDEX IF NOT EXISTS idx_driver_assignments_driver_id ON public.driver_assignments(driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_checks_driver_id ON public.vehicle_checks(driver_id);
