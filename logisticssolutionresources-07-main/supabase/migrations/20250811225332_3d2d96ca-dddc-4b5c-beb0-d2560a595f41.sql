-- Add missing RLS policies for new tables created in prior migration

-- vehicle_tires policies
DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vehicle_tires' AND policyname='Org members can view vehicle tires'
  ) THEN
    CREATE POLICY "Org members can view vehicle tires"
    ON public.vehicle_tires FOR SELECT
    USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
  END IF;
END$$;

DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vehicle_tires' AND policyname='Admins can manage vehicle tires'
  ) THEN
    CREATE POLICY "Admins can manage vehicle tires"
    ON public.vehicle_tires FOR ALL
    USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','council')));
  END IF;
END$$;

-- vehicle_check_items policies
DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vehicle_check_items' AND policyname='Org members can view vehicle check items'
  ) THEN
    CREATE POLICY "Org members can view vehicle check items"
    ON public.vehicle_check_items FOR SELECT
    USING (EXISTS (
      SELECT 1 FROM public.vehicle_checks vc
      WHERE vc.id = vehicle_check_items.check_id
        AND vc.organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    ));
  END IF;
END$$;

DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vehicle_check_items' AND policyname='Admins can manage vehicle check items'
  ) THEN
    CREATE POLICY "Admins can manage vehicle check items"
    ON public.vehicle_check_items FOR ALL
    USING (EXISTS (
      SELECT 1 FROM public.vehicle_checks vc
      WHERE vc.id = vehicle_check_items.check_id
        AND vc.organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','council'))
    ));
  END IF;
END$$;

-- infringements policies
DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='infringements' AND policyname='Drivers can view their infringements'
  ) THEN
    CREATE POLICY "Drivers can view their infringements"
    ON public.infringements FOR SELECT
    USING (driver_id = auth.uid());
  END IF;
END$$;

DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='infringements' AND policyname='Org members can view infringements'
  ) THEN
    CREATE POLICY "Org members can view infringements"
    ON public.infringements FOR SELECT
    USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
  END IF;
END$$;

DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='infringements' AND policyname='Admins can manage infringements'
  ) THEN
    CREATE POLICY "Admins can manage infringements"
    ON public.infringements FOR ALL
    USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','council')));
  END IF;
END$$;

-- driver_points_history policies
DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='driver_points_history' AND policyname='Drivers can view their points history'
  ) THEN
    CREATE POLICY "Drivers can view their points history"
    ON public.driver_points_history FOR SELECT
    USING (driver_id = auth.uid());
  END IF;
END$$;

DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='driver_points_history' AND policyname='Org members can view points history'
  ) THEN
    CREATE POLICY "Org members can view points history"
    ON public.driver_points_history FOR SELECT
    USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
  END IF;
END$$;

DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='driver_points_history' AND policyname='Admins can manage points history'
  ) THEN
    CREATE POLICY "Admins can manage points history"
    ON public.driver_points_history FOR ALL
    USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','council')));
  END IF;
END$$;

-- organizations policies
DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='organizations' AND policyname='Org members can view their organization'
  ) THEN
    CREATE POLICY "Org members can view their organization"
    ON public.organizations FOR SELECT
    USING (id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
  END IF;
END$$;

DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='organizations' AND policyname='Admins can manage organizations'
  ) THEN
    CREATE POLICY "Admins can manage organizations"
    ON public.organizations FOR ALL
    USING (is_admin_user(auth.uid()));
  END IF;
END$$;