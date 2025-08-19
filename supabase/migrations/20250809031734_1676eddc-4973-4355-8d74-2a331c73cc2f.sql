-- Driver-side backend setup migration
-- 1) VEHICLE CHECKS (daily walk-around)

-- vehicle_checks table
CREATE TABLE IF NOT EXISTS public.vehicle_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid,
  vehicle_id uuid NOT NULL,
  driver_id uuid NOT NULL,
  check_type text NOT NULL DEFAULT 'daily',
  started_at timestamptz,
  completed_at timestamptz,
  overall_status text NOT NULL DEFAULT 'completed',
  defects_count integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- FKs (only if referenced tables exist)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='vehicles'
  ) THEN
    ALTER TABLE public.vehicle_checks
    ADD CONSTRAINT IF NOT EXISTS vehicle_checks_vehicle_id_fkey
    FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE RESTRICT;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='profiles'
  ) THEN
    ALTER TABLE public.vehicle_checks
    ADD CONSTRAINT IF NOT EXISTS vehicle_checks_driver_id_fkey
    FOREIGN KEY (driver_id) REFERENCES public.profiles(id) ON DELETE RESTRICT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_vehicle_checks_org ON public.vehicle_checks(organization_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_checks_vehicle ON public.vehicle_checks(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_checks_driver ON public.vehicle_checks(driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_checks_created ON public.vehicle_checks(created_at);

-- RLS
ALTER TABLE public.vehicle_checks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vehicle_checks' AND policyname='Drivers manage own checks'
  ) THEN
    CREATE POLICY "Drivers manage own checks"
    ON public.vehicle_checks
    FOR ALL
    TO authenticated
    USING (driver_id = auth.uid())
    WITH CHECK (driver_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vehicle_checks' AND policyname='Org members can view checks'
  ) THEN
    CREATE POLICY "Org members can view checks"
    ON public.vehicle_checks
    FOR SELECT
    TO authenticated
    USING (
      organization_id IN (
        SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vehicle_checks' AND policyname='Admins can manage checks'
  ) THEN
    CREATE POLICY "Admins can manage checks"
    ON public.vehicle_checks
    FOR ALL
    TO authenticated
    USING (public.is_admin_user(auth.uid()))
    WITH CHECK (public.is_admin_user(auth.uid()));
  END IF;
END $$;

-- updated_at trigger
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_vehicle_checks_updated_at'
  ) THEN
    CREATE TRIGGER update_vehicle_checks_updated_at
    BEFORE UPDATE ON public.vehicle_checks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- vehicle_check_items table
CREATE TABLE IF NOT EXISTS public.vehicle_check_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  check_id uuid NOT NULL,
  item_key text NOT NULL,
  item_label text,
  status text NOT NULL,
  severity text NOT NULL,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicle_check_items
  ADD CONSTRAINT IF NOT EXISTS vehicle_check_items_check_id_fkey
  FOREIGN KEY (check_id) REFERENCES public.vehicle_checks(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_vehicle_check_items_check ON public.vehicle_check_items(check_id);

ALTER TABLE public.vehicle_check_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vehicle_check_items' AND policyname='Insert items for own checks'
  ) THEN
    CREATE POLICY "Insert items for own checks"
    ON public.vehicle_check_items
    FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.vehicle_checks vc
        WHERE vc.id = check_id AND vc.driver_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vehicle_check_items' AND policyname='Org members can view items'
  ) THEN
    CREATE POLICY "Org members can view items"
    ON public.vehicle_check_items
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.vehicle_checks vc
        JOIN public.profiles p ON p.id = auth.uid()
        WHERE vc.id = check_id AND vc.organization_id = p.organization_id
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vehicle_check_items' AND policyname='Admins can manage items'
  ) THEN
    CREATE POLICY "Admins can manage items"
    ON public.vehicle_check_items
    FOR ALL
    TO authenticated
    USING (public.is_admin_user(auth.uid()))
    WITH CHECK (public.is_admin_user(auth.uid()));
  END IF;
END $$;

-- 2) VEHICLE INSPECTIONS (guided wizard + questions)
CREATE TABLE IF NOT EXISTS public.vehicle_inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL,
  vehicle_id uuid NOT NULL,
  inspection_type text NOT NULL DEFAULT 'initial',
  notes text,
  signature_data text,
  walkaround_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  location_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  defects_found boolean NOT NULL DEFAULT false,
  overall_status text NOT NULL DEFAULT 'pending',
  inspection_date date NOT NULL DEFAULT (now()::date),
  start_time timestamptz,
  end_time timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='vehicles') THEN
    ALTER TABLE public.vehicle_inspections
    ADD CONSTRAINT IF NOT EXISTS vehicle_inspections_vehicle_id_fkey
    FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE RESTRICT;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='profiles') THEN
    ALTER TABLE public.vehicle_inspections
    ADD CONSTRAINT IF NOT EXISTS vehicle_inspections_driver_id_fkey
    FOREIGN KEY (driver_id) REFERENCES public.profiles(id) ON DELETE RESTRICT;
  END IF;
END $$;

ALTER TABLE public.vehicle_inspections ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vehicle_inspections' AND policyname='Drivers manage own inspections'
  ) THEN
    CREATE POLICY "Drivers manage own inspections"
    ON public.vehicle_inspections
    FOR ALL
    TO authenticated
    USING (driver_id = auth.uid())
    WITH CHECK (driver_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vehicle_inspections' AND policyname='Org members can view inspections'
  ) THEN
    CREATE POLICY "Org members can view inspections"
    ON public.vehicle_inspections
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles p1
        JOIN public.profiles p2 ON p2.id = auth.uid()
        WHERE p1.id = driver_id AND p1.organization_id = p2.organization_id
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vehicle_inspections' AND policyname='Admins can manage inspections'
  ) THEN
    CREATE POLICY "Admins can manage inspections"
    ON public.vehicle_inspections
    FOR ALL
    TO authenticated
    USING (public.is_admin_user(auth.uid()))
    WITH CHECK (public.is_admin_user(auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_vehicle_inspections_updated_at'
  ) THEN
    CREATE TRIGGER update_vehicle_inspections_updated_at
    BEFORE UPDATE ON public.vehicle_inspections
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 3) TIME OFF REQUESTS
CREATE TABLE IF NOT EXISTS public.time_off_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid,
  driver_id uuid NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  request_type text NOT NULL,
  reason text NOT NULL,
  notes text,
  total_days integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending',
  requested_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  reviewed_by uuid,
  reviewed_at timestamptz
);

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='profiles') THEN
    ALTER TABLE public.time_off_requests
    ADD CONSTRAINT IF NOT EXISTS time_off_requests_driver_id_fkey
    FOREIGN KEY (driver_id) REFERENCES public.profiles(id) ON DELETE RESTRICT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_time_off_requests_org ON public.time_off_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_driver ON public.time_off_requests(driver_id);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_requested ON public.time_off_requests(requested_at);

ALTER TABLE public.time_off_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='time_off_requests' AND policyname='Drivers manage own time off'
  ) THEN
    CREATE POLICY "Drivers manage own time off"
    ON public.time_off_requests
    FOR ALL
    TO authenticated
    USING (driver_id = auth.uid())
    WITH CHECK (driver_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='time_off_requests' AND policyname='Org members can view time off'
  ) THEN
    CREATE POLICY "Org members can view time off"
    ON public.time_off_requests
    FOR SELECT
    TO authenticated
    USING (
      organization_id IN (
        SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='time_off_requests' AND policyname='Admins can manage time off'
  ) THEN
    CREATE POLICY "Admins can manage time off"
    ON public.time_off_requests
    FOR ALL
    TO authenticated
    USING (public.is_admin_user(auth.uid()))
    WITH CHECK (public.is_admin_user(auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_time_off_requests_updated_at'
  ) THEN
    CREATE TRIGGER update_time_off_requests_updated_at
    BEFORE UPDATE ON public.time_off_requests
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 4) FUEL MANAGEMENT
CREATE TABLE IF NOT EXISTS public.fuel_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  vehicle_id uuid NOT NULL,
  driver_id uuid NOT NULL,
  transaction_date timestamptz NOT NULL,
  location_name text,
  location_lat numeric,
  location_lng numeric,
  fuel_type text NOT NULL,
  litres_filled numeric NOT NULL,
  cost_per_litre numeric NOT NULL,
  total_cost numeric NOT NULL,
  odometer_reading integer,
  fuel_card_number text,
  receipt_url text,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  verified_by uuid,
  verified_at timestamptz,
  anomaly_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='vehicles') THEN
    ALTER TABLE public.fuel_transactions
    ADD CONSTRAINT IF NOT EXISTS fuel_transactions_vehicle_id_fkey
    FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE RESTRICT;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='profiles') THEN
    ALTER TABLE public.fuel_transactions
    ADD CONSTRAINT IF NOT EXISTS fuel_transactions_driver_id_fkey
    FOREIGN KEY (driver_id) REFERENCES public.profiles(id) ON DELETE RESTRICT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_fuel_transactions_org ON public.fuel_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_fuel_transactions_vehicle ON public.fuel_transactions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fuel_transactions_driver ON public.fuel_transactions(driver_id);
CREATE INDEX IF NOT EXISTS idx_fuel_transactions_date ON public.fuel_transactions(transaction_date);

ALTER TABLE public.fuel_transactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='fuel_transactions' AND policyname='Drivers insert own fuel tx'
  ) THEN
    CREATE POLICY "Drivers insert own fuel tx"
    ON public.fuel_transactions
    FOR INSERT
    TO authenticated
    WITH CHECK (
      driver_id = auth.uid() AND organization_id IN (
        SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='fuel_transactions' AND policyname='Org members can view fuel tx'
  ) THEN
    CREATE POLICY "Org members can view fuel tx"
    ON public.fuel_transactions
    FOR SELECT
    TO authenticated
    USING (
      organization_id IN (
        SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='fuel_transactions' AND policyname='Admins can manage fuel tx'
  ) THEN
    CREATE POLICY "Admins can manage fuel tx"
    ON public.fuel_transactions
    FOR ALL
    TO authenticated
    USING (public.is_admin_user(auth.uid()))
    WITH CHECK (public.is_admin_user(auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_fuel_transactions_updated_at'
  ) THEN
    CREATE TRIGGER update_fuel_transactions_updated_at
    BEFORE UPDATE ON public.fuel_transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- fuel_efficiency_records
CREATE TABLE IF NOT EXISTS public.fuel_efficiency_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  vehicle_id uuid NOT NULL,
  driver_id uuid NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_litres numeric NOT NULL DEFAULT 0,
  total_cost numeric NOT NULL DEFAULT 0,
  total_distance_km numeric NOT NULL DEFAULT 0,
  efficiency_l_per_100km numeric NOT NULL DEFAULT 0,
  cost_per_km numeric NOT NULL DEFAULT 0,
  co2_emissions_kg numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fuel_efficiency_records ENABLE ROW LEVEL SECURITY;

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

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_fuel_efficiency_records_updated_at'
  ) THEN
    CREATE TRIGGER update_fuel_efficiency_records_updated_at
    BEFORE UPDATE ON public.fuel_efficiency_records
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- fuel_alerts
CREATE TABLE IF NOT EXISTS public.fuel_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  vehicle_id uuid,
  driver_id uuid,
  fuel_transaction_id uuid,
  alert_type text NOT NULL,
  severity text NOT NULL DEFAULT 'low',
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid
);

ALTER TABLE public.fuel_alerts ENABLE ROW LEVEL SECURITY;

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

-- 5) Fix logs: add violation_date to compliance_violations if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='compliance_violations' AND column_name='violation_date'
  ) THEN
    ALTER TABLE public.compliance_violations
    ADD COLUMN violation_date timestamptz NOT NULL DEFAULT now();
    -- Backfill from occurred_at when available
    UPDATE public.compliance_violations
    SET violation_date = COALESCE(occurred_at, now());
  END IF;
END $$;

-- 6) Basic notifications table to support legacy references
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  organization_id uuid,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  message text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

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