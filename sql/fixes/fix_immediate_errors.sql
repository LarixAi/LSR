-- Fix Immediate Database Errors
-- This script fixes the connection errors and missing relationships

-- 1. Create the missing RPC function for unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.notifications
    WHERE user_id = user_uuid 
    AND read = false
  );
END;
$$ language 'plpgsql';

-- 2. Create driver_vehicle_assignments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.driver_vehicle_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  unassigned_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'temporary')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Enable RLS on driver_vehicle_assignments
ALTER TABLE public.driver_vehicle_assignments ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for driver_vehicle_assignments
DROP POLICY IF EXISTS "drivers_can_view_own_assignments" ON public.driver_vehicle_assignments;
DROP POLICY IF EXISTS "admins_can_manage_assignments" ON public.driver_vehicle_assignments;

CREATE POLICY "drivers_can_view_own_assignments"
ON public.driver_vehicle_assignments FOR SELECT
USING (driver_id = auth.uid());

CREATE POLICY "admins_can_manage_assignments"
ON public.driver_vehicle_assignments FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'council')
  )
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_driver_vehicle_assignments_driver_id ON public.driver_vehicle_assignments(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_vehicle_assignments_vehicle_id ON public.driver_vehicle_assignments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_driver_vehicle_assignments_organization_id ON public.driver_vehicle_assignments(organization_id);
CREATE INDEX IF NOT EXISTS idx_driver_vehicle_assignments_status ON public.driver_vehicle_assignments(status);

-- 6. Ensure notifications table exists and has correct structure
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for notifications
DROP POLICY IF EXISTS "users_can_view_own_notifications" ON public.notifications;
DROP POLICY IF EXISTS "users_can_update_own_notifications" ON public.notifications;

CREATE POLICY "users_can_view_own_notifications"
ON public.notifications FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "users_can_update_own_notifications"
ON public.notifications FOR UPDATE
USING (user_id = auth.uid());

-- 9. Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- 10. Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_unread_notification_count(UUID) TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.driver_vehicle_assignments TO authenticated;

-- 11. Add some sample data for testing
INSERT INTO public.notifications (user_id, type, title, message, read)
SELECT 
  p.id,
  'info',
  'Welcome to the system',
  'Your account has been successfully created.',
  false
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.notifications n 
  WHERE n.user_id = p.id AND n.title = 'Welcome to the system'
)
LIMIT 1;
