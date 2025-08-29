-- Fix failed part and complete migration (idempotent)

-- Ensure vehicle_check_items table exists
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

-- Add FK for vehicle_check_items.check_id if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.table_schema = 'public' AND tc.table_name = 'vehicle_check_items' AND tc.constraint_name = 'vehicle_check_items_check_id_fkey'
  ) THEN
    ALTER TABLE public.vehicle_check_items
    ADD CONSTRAINT vehicle_check_items_check_id_fkey
    FOREIGN KEY (check_id) REFERENCES public.vehicle_checks(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Continue with remaining objects (re-run safe)

-- VEHICLE CHECKS indexes, rls and trigger (re-run safe)
CREATE INDEX IF NOT EXISTS idx_vehicle_checks_org ON public.vehicle_checks(organization_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_checks_vehicle ON public.vehicle_checks(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_checks_driver ON public.vehicle_checks(driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_checks_created ON public.vehicle_checks(created_at);
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
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_vehicle_checks_updated_at'
  ) THEN
    CREATE TRIGGER update_vehicle_checks_updated_at
    BEFORE UPDATE ON public.vehicle_checks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- VEHICLE_CHECK_ITEMS policies (re-run safe)
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

-- Ensure vehicle_inspections, time_off_requests, fuel_* and notifications exist by rerunning prior blocks idempotently
-- vehicle_inspections
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

-- time_off_requests
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

-- fuel_transactions
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
      driver_id = auth.uid()
    );
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

-- compliance_violations: add violation_date if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='compliance_violations' AND column_name='violation_date'
  ) THEN
    ALTER TABLE public.compliance_violations
    ADD COLUMN violation_date timestamptz NOT NULL DEFAULT now();
    UPDATE public.compliance_violations
    SET violation_date = COALESCE(occurred_at, now());
  END IF;
END $$;

-- notifications
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