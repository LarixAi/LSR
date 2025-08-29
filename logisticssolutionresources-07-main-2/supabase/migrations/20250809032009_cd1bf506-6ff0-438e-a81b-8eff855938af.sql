-- Add missing RLS policies flagged by linter

-- fuel_efficiency_records policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='fuel_efficiency_records' AND policyname='Org members can view efficiency'
  ) THEN
    CREATE POLICY "Org members can view efficiency"
    ON public.fuel_efficiency_records
    FOR SELECT
    TO authenticated
    USING (
      organization_id IN (
        SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()
      )
    );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='fuel_efficiency_records' AND policyname='Admins manage efficiency'
  ) THEN
    CREATE POLICY "Admins manage efficiency"
    ON public.fuel_efficiency_records
    FOR ALL
    TO authenticated
    USING (public.is_admin_user(auth.uid()))
    WITH CHECK (public.is_admin_user(auth.uid()));
  END IF;
END $$;

-- fuel_alerts policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='fuel_alerts' AND policyname='Org members can view fuel alerts'
  ) THEN
    CREATE POLICY "Org members can view fuel alerts"
    ON public.fuel_alerts
    FOR SELECT
    TO authenticated
    USING (
      organization_id IN (
        SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()
      )
    );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='fuel_alerts' AND policyname='Admins manage fuel alerts'
  ) THEN
    CREATE POLICY "Admins manage fuel alerts"
    ON public.fuel_alerts
    FOR ALL
    TO authenticated
    USING (public.is_admin_user(auth.uid()))
    WITH CHECK (public.is_admin_user(auth.uid()));
  END IF;
END $$;

-- notifications policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='notifications' AND policyname='Users view own notifications'
  ) THEN
    CREATE POLICY "Users view own notifications"
    ON public.notifications
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='notifications' AND policyname='Users update own notifications'
  ) THEN
    CREATE POLICY "Users update own notifications"
    ON public.notifications
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='notifications' AND policyname='Users insert own notifications'
  ) THEN
    CREATE POLICY "Users insert own notifications"
    ON public.notifications
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='notifications' AND policyname='Admins manage notifications'
  ) THEN
    CREATE POLICY "Admins manage notifications"
    ON public.notifications
    FOR ALL
    TO authenticated
    USING (public.is_admin_user(auth.uid()))
    WITH CHECK (public.is_admin_user(auth.uid()));
  END IF;
END $$;