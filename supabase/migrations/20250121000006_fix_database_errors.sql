-- Fix Database Errors Migration
-- This migration fixes the connection errors and missing relationships

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

-- 2. Create the missing RPC function for enhanced notifications
CREATE OR REPLACE FUNCTION get_unread_enhanced_notification_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.notification_messages
    WHERE (recipient_id = user_uuid OR 
           (recipient_role IS NOT NULL AND EXISTS (
             SELECT 1 FROM public.profiles 
             WHERE id = user_uuid 
             AND role = notification_messages.recipient_role
             AND organization_id = notification_messages.organization_id
           )))
    AND read_at IS NULL
  );
END;
$$ language 'plpgsql';

-- 3. Add missing driver_id column to vehicles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'vehicles' 
        AND column_name = 'driver_id'
    ) THEN
        ALTER TABLE public.vehicles ADD COLUMN driver_id UUID REFERENCES public.profiles(id);
    END IF;
END $$;

-- 4. Create driver_vehicle_assignments table if it doesn't exist
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure one active assignment per driver
  UNIQUE(driver_id, status)
);

-- 5. Enable RLS on driver_vehicle_assignments
ALTER TABLE public.driver_vehicle_assignments ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for driver_vehicle_assignments
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

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_driver_vehicle_assignments_driver_id ON public.driver_vehicle_assignments(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_vehicle_assignments_vehicle_id ON public.driver_vehicle_assignments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_driver_vehicle_assignments_organization_id ON public.driver_vehicle_assignments(organization_id);
CREATE INDEX IF NOT EXISTS idx_driver_vehicle_assignments_status ON public.driver_vehicle_assignments(status);

-- 8. Ensure notifications table exists and has correct structure
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

-- 9. Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS policies for notifications
DROP POLICY IF EXISTS "users_can_view_own_notifications" ON public.notifications;
DROP POLICY IF EXISTS "users_can_update_own_notifications" ON public.notifications;

CREATE POLICY "users_can_view_own_notifications"
ON public.notifications FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "users_can_update_own_notifications"
ON public.notifications FOR UPDATE
USING (user_id = auth.uid());

-- 11. Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- 12. Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_unread_notification_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_enhanced_notification_count(UUID) TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.driver_vehicle_assignments TO authenticated;

-- 13. Create a view for vehicle-driver relationships
CREATE OR REPLACE VIEW vehicle_driver_view AS
SELECT 
  v.id as vehicle_id,
  v.vehicle_number,
  v.make,
  v.model,
  v.license_plate,
  v.status as vehicle_status,
  v.organization_id,
  dva.driver_id,
  dva.status as assignment_status,
  dva.assigned_date,
  p.first_name,
  p.last_name,
  p.role as driver_role
FROM public.vehicles v
LEFT JOIN public.driver_vehicle_assignments dva ON v.id = dva.vehicle_id AND dva.status = 'active'
LEFT JOIN public.profiles p ON dva.driver_id = p.id
WHERE v.organization_id IS NOT NULL;

-- 14. Grant access to the view
GRANT SELECT ON vehicle_driver_view TO authenticated;

-- 15. Create function to get vehicle with driver info
CREATE OR REPLACE FUNCTION get_vehicle_with_driver(vehicle_uuid UUID)
RETURNS TABLE (
  vehicle_id UUID,
  vehicle_number TEXT,
  make TEXT,
  model TEXT,
  license_plate TEXT,
  vehicle_status TEXT,
  organization_id UUID,
  driver_id UUID,
  driver_first_name TEXT,
  driver_last_name TEXT,
  driver_role TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.vehicle_number,
    v.make,
    v.model,
    v.license_plate,
    v.status,
    v.organization_id,
    dva.driver_id,
    p.first_name,
    p.last_name,
    p.role
  FROM public.vehicles v
  LEFT JOIN public.driver_vehicle_assignments dva ON v.id = dva.vehicle_id AND dva.status = 'active'
  LEFT JOIN public.profiles p ON dva.driver_id = p.id
  WHERE v.id = vehicle_uuid;
END;
$$ language 'plpgsql';

-- 16. Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_vehicle_with_driver(UUID) TO authenticated;
