-- Create Parent Dashboard Tables
-- This script creates the necessary tables for parent functionality

-- 1. Create child_profiles table
CREATE TABLE IF NOT EXISTS public.child_profiles (
  id bigserial PRIMARY KEY,
  parent_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id uuid,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date NOT NULL,
  pickup_location text,
  dropoff_location text,
  emergency_contacts jsonb NOT NULL DEFAULT '{}'::jsonb,
  medical_conditions text,
  special_requirements text,
  photo_url text,
  route_id uuid,
  grade_level text,
  parent_phone text,
  pickup_time time without time zone,
  dropoff_time time without time zone,
  school_id uuid,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Create parent_notifications table
CREATE TABLE IF NOT EXISTS public.parent_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  child_id bigint REFERENCES public.child_profiles(id) ON DELETE SET NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'alert', 'pickup', 'dropoff', 'delay', 'emergency')),
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  scheduled_for timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- 3. Create child_tracking table
CREATE TABLE IF NOT EXISTS public.child_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id bigint NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('pickup', 'dropoff', 'boarding', 'alighting', 'absent')),
  location_address text,
  location_lat decimal,
  location_lng decimal,
  timestamp timestamptz NOT NULL DEFAULT now(),
  notes text,
  vehicle_id uuid,
  driver_id uuid REFERENCES public.profiles(id),
  organization_id uuid,
  created_by uuid
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_child_profiles_parent_id ON public.child_profiles(parent_id);
CREATE INDEX IF NOT EXISTS idx_child_profiles_active ON public.child_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_parent_notifications_parent_id ON public.parent_notifications(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_notifications_created_at ON public.parent_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_child_tracking_child_id ON public.child_tracking(child_id);
CREATE INDEX IF NOT EXISTS idx_child_tracking_timestamp ON public.child_tracking(timestamp DESC);

-- 5. Enable Row Level Security
ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_tracking ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies

-- Child profiles policies
CREATE POLICY "Parents can manage their own children"
  ON public.child_profiles
  FOR ALL
  TO authenticated
  USING (parent_id = auth.uid())
  WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Organization members can view children"
  ON public.child_profiles
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()
    )
  );

-- Parent notifications policies
CREATE POLICY "Parents can view their own notifications"
  ON public.parent_notifications
  FOR SELECT
  TO authenticated
  USING (parent_id = auth.uid());

CREATE POLICY "Parents can update their own notifications"
  ON public.parent_notifications
  FOR UPDATE
  TO authenticated
  USING (parent_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON public.parent_notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Child tracking policies
CREATE POLICY "Parents can view their children's tracking"
  ON public.child_tracking
  FOR SELECT
  TO authenticated
  USING (
    child_id IN (
      SELECT id FROM public.child_profiles WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can create tracking entries"
  ON public.child_tracking
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'driver'
    )
  );

CREATE POLICY "Drivers can update tracking entries"
  ON public.child_tracking
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'driver'
    )
  );

-- 7. Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_child_profiles_updated_at
  BEFORE UPDATE ON public.child_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Enable realtime for live updates
ALTER TABLE public.child_profiles REPLICA IDENTITY FULL;
ALTER TABLE public.parent_notifications REPLICA IDENTITY FULL;
ALTER TABLE public.child_tracking REPLICA IDENTITY FULL;

-- Add tables to realtime publication
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'child_profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.child_profiles;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'parent_notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.parent_notifications;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'child_tracking'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.child_tracking;
  END IF;
END $$;

-- 9. Display confirmation
SELECT 'Parent tables created successfully!' as status;
SELECT 'Tables created:' as info;
SELECT '  - child_profiles' as table_name;
SELECT '  - parent_notifications' as table_name;
SELECT '  - child_tracking' as table_name;
