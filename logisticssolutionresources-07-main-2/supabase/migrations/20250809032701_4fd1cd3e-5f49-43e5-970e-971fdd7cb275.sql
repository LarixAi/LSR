-- Parent-side backend setup: tables, RLS, functions, realtime replicas

-- 1) child_profiles
CREATE TABLE IF NOT EXISTS public.child_profiles (
  id bigserial PRIMARY KEY,
  parent_id uuid NOT NULL,
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

-- Optional FKs
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='routes') THEN
    ALTER TABLE public.child_profiles
    ADD CONSTRAINT IF NOT EXISTS child_profiles_route_id_fkey
    FOREIGN KEY (route_id) REFERENCES public.routes(id) ON DELETE SET NULL;
  END IF;
END $$;

ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- Parents manage their children
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='child_profiles' AND policyname='Parents manage own children'
  ) THEN
    CREATE POLICY "Parents manage own children"
    ON public.child_profiles
    FOR ALL
    TO authenticated
    USING (parent_id = auth.uid())
    WITH CHECK (parent_id = auth.uid());
  END IF;

  -- Org members view
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='child_profiles' AND policyname='Org members can view children'
  ) THEN
    CREATE POLICY "Org members can view children"
    ON public.child_profiles
    FOR SELECT
    TO authenticated
    USING (
      organization_id IN (
        SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()
      )
    );
  END IF;

  -- Admins manage
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='child_profiles' AND policyname='Admins manage children'
  ) THEN
    CREATE POLICY "Admins manage children"
    ON public.child_profiles
    FOR ALL
    TO authenticated
    USING (public.is_admin_user(auth.uid()))
    WITH CHECK (public.is_admin_user(auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_child_profiles_updated_at') THEN
    CREATE TRIGGER update_child_profiles_updated_at
    BEFORE UPDATE ON public.child_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 2) daily_attendance
CREATE TABLE IF NOT EXISTS public.daily_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id bigint NOT NULL,
  attendance_date date NOT NULL,
  attendance_status text NOT NULL DEFAULT 'present',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_attendance
  ADD CONSTRAINT IF NOT EXISTS daily_attendance_child_id_fkey
  FOREIGN KEY (child_id) REFERENCES public.child_profiles(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_daily_attendance_child_date
  ON public.daily_attendance(child_id, attendance_date);

ALTER TABLE public.daily_attendance ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- Parents can insert/view their child's attendance
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='daily_attendance' AND policyname='Parents manage attendance for own children'
  ) THEN
    CREATE POLICY "Parents manage attendance for own children"
    ON public.daily_attendance
    FOR ALL
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM public.child_profiles c
      WHERE c.id = child_id AND c.parent_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
      SELECT 1 FROM public.child_profiles c
      WHERE c.id = child_id AND c.parent_id = auth.uid()
    ));
  END IF;

  -- Org members view
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='daily_attendance' AND policyname='Org members can view attendance'
  ) THEN
    CREATE POLICY "Org members can view attendance"
    ON public.daily_attendance
    FOR SELECT
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM public.child_profiles c
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE c.id = child_id AND c.organization_id = p.organization_id
    ));
  END IF;
END $$;

-- 3) child_tracking
CREATE TABLE IF NOT EXISTS public.child_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id bigint NOT NULL,
  event_type text NOT NULL,
  location_address text,
  timestamp timestamptz NOT NULL DEFAULT now(),
  notes text,
  organization_id uuid,
  created_by uuid
);

ALTER TABLE public.child_tracking
  ADD CONSTRAINT IF NOT EXISTS child_tracking_child_id_fkey
  FOREIGN KEY (child_id) REFERENCES public.child_profiles(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_child_tracking_child_time ON public.child_tracking(child_id, timestamp DESC);

ALTER TABLE public.child_tracking ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- Parents can view their children's events
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='child_tracking' AND policyname='Parents view own child events'
  ) THEN
    CREATE POLICY "Parents view own child events"
    ON public.child_tracking
    FOR SELECT
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM public.child_profiles c
      WHERE c.id = child_id AND c.parent_id = auth.uid()
    ));
  END IF;

  -- Parents can insert events for their children (e.g., absence)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='child_tracking' AND policyname='Parents insert child events'
  ) THEN
    CREATE POLICY "Parents insert child events"
    ON public.child_tracking
    FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (
      SELECT 1 FROM public.child_profiles c
      WHERE c.id = child_id AND c.parent_id = auth.uid()
    ));
  END IF;

  -- Org members can view
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='child_tracking' AND policyname='Org members view child events'
  ) THEN
    CREATE POLICY "Org members view child events"
    ON public.child_tracking
    FOR SELECT
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM public.child_profiles c
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE c.id = child_id AND c.organization_id = p.organization_id
    ));
  END IF;

  -- Admins manage
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='child_tracking' AND policyname='Admins manage child events'
  ) THEN
    CREATE POLICY "Admins manage child events"
    ON public.child_tracking
    FOR ALL
    TO authenticated
    USING (public.is_admin_user(auth.uid()))
    WITH CHECK (public.is_admin_user(auth.uid()));
  END IF;
END $$;

-- 4) parent_notifications
CREATE TABLE IF NOT EXISTS public.parent_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL,
  child_id bigint,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  message text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.parent_notifications
  ADD CONSTRAINT IF NOT EXISTS parent_notifications_child_id_fkey
  FOREIGN KEY (child_id) REFERENCES public.child_profiles(id) ON DELETE SET NULL;

ALTER TABLE public.parent_notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- Parents manage their own notifications
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='parent_notifications' AND policyname='Parents manage own notifications'
  ) THEN
    CREATE POLICY "Parents manage own notifications"
    ON public.parent_notifications
    FOR ALL
    TO authenticated
    USING (parent_id = auth.uid())
    WITH CHECK (parent_id = auth.uid());
  END IF;

  -- Admins manage
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='parent_notifications' AND policyname='Admins manage parent notifications'
  ) THEN
    CREATE POLICY "Admins manage parent notifications"
    ON public.parent_notifications
    FOR ALL
    TO authenticated
    USING (public.is_admin_user(auth.uid()))
    WITH CHECK (public.is_admin_user(auth.uid()));
  END IF;
END $$;

-- 5) Function: log_child_event
CREATE OR REPLACE FUNCTION public.log_child_event(p_child_id bigint, p_event_type text, p_notes text DEFAULT NULL, p_location text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_id uuid;
  v_org uuid;
BEGIN
  SELECT organization_id INTO v_org FROM public.child_profiles WHERE id = p_child_id;

  INSERT INTO public.child_tracking (id, child_id, event_type, location_address, notes, organization_id, created_by)
  VALUES (gen_random_uuid(), p_child_id, p_event_type, p_location, p_notes, v_org, auth.uid())
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- 6) Realtime: set replica identity and add to publication
-- child_profiles
ALTER TABLE public.child_profiles REPLICA IDENTITY FULL;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'child_profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.child_profiles;
  END IF;
END $$;

-- child_tracking
ALTER TABLE public.child_tracking REPLICA IDENTITY FULL;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'child_tracking'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.child_tracking;
  END IF;
END $$;

-- parent_notifications
ALTER TABLE public.parent_notifications REPLICA IDENTITY FULL;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'parent_notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.parent_notifications;
  END IF;
END $$;

-- daily_attendance
ALTER TABLE public.daily_attendance REPLICA IDENTITY FULL;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'daily_attendance'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_attendance;
  END IF;
END $$;