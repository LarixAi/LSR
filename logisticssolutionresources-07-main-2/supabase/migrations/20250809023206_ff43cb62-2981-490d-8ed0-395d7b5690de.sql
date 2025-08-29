-- Phase 1: Tachograph & Compliance backend setup
-- 1) Vehicles table (used across app)
CREATE TABLE IF NOT EXISTS public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  vehicle_number text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Uniqueness of vehicle_number within an organization
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'uniq_vehicles_org_vehicle_number'
  ) THEN
    CREATE UNIQUE INDEX uniq_vehicles_org_vehicle_number
      ON public.vehicles (organization_id, vehicle_number);
  END IF;
END $$;

-- Update trigger for vehicles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_vehicles_updated_at'
  ) THEN
    CREATE TRIGGER trg_vehicles_updated_at
    BEFORE UPDATE ON public.vehicles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Enable RLS and policies for vehicles
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Admins manage all vehicles
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vehicles' AND policyname='Admins can manage vehicles'
  ) THEN
    CREATE POLICY "Admins can manage vehicles" ON public.vehicles
    FOR ALL
    USING (public.is_admin_user(auth.uid()))
    WITH CHECK (public.is_admin_user(auth.uid()));
  END IF;
  -- Org members can view vehicles
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vehicles' AND policyname='Org members can view vehicles'
  ) THEN
    CREATE POLICY "Org members can view vehicles" ON public.vehicles
    FOR SELECT
    USING (
      organization_id IN (
        SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()
      )
    );
  END IF;
END $$;

-- 2) Tachograph records table
CREATE TABLE IF NOT EXISTS public.tachograph_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE SET NULL,
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  driver_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  type text NOT NULL,
  file_url text NOT NULL,
  date date NOT NULL,
  card_download_date timestamptz,
  head_download_date timestamptz,
  verification_status text NOT NULL DEFAULT 'pending',
  issues_found integer NOT NULL DEFAULT 0,
  next_download_due date,
  analysis_results jsonb NOT NULL DEFAULT '{}'::jsonb,
  device_type text NOT NULL DEFAULT 'standard',
  bluetooth_download boolean NOT NULL DEFAULT false,
  remote_download boolean NOT NULL DEFAULT false,
  generation_type text NOT NULL DEFAULT 'generation_1',
  download_method text NOT NULL DEFAULT 'manual',
  file_size_bytes integer NOT NULL DEFAULT 0,
  smart_features jsonb NOT NULL DEFAULT '{}'::jsonb,
  satellite_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_tacho_org ON public.tachograph_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_tacho_vehicle ON public.tachograph_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_tacho_driver ON public.tachograph_records(driver_id);
CREATE INDEX IF NOT EXISTS idx_tacho_date ON public.tachograph_records(date);

-- Update trigger for tachograph_records
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_tachograph_records_updated_at'
  ) THEN
    CREATE TRIGGER trg_tachograph_records_updated_at
    BEFORE UPDATE ON public.tachograph_records
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- RLS for tachograph_records
ALTER TABLE public.tachograph_records ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Admins manage
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tachograph_records' AND policyname='Admins can manage tachograph records'
  ) THEN
    CREATE POLICY "Admins can manage tachograph records" ON public.tachograph_records
    FOR ALL
    USING (public.is_admin_user(auth.uid()))
    WITH CHECK (public.is_admin_user(auth.uid()));
  END IF;
  -- Org members can view
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tachograph_records' AND policyname='Org members can view tachograph records'
  ) THEN
    CREATE POLICY "Org members can view tachograph records" ON public.tachograph_records
    FOR SELECT
    USING (
      organization_id IN (
        SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()
      )
    );
  END IF;
END $$;

-- 3) Tachograph issues table
CREATE TABLE IF NOT EXISTS public.tachograph_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tachograph_id uuid NOT NULL REFERENCES public.tachograph_records(id) ON DELETE CASCADE,
  issue_type text NOT NULL,
  description text,
  severity text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  resolution text,
  reported_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  organization_id uuid
);

-- Auto-set organization_id from parent record on INSERT
CREATE OR REPLACE FUNCTION public.set_tachograph_issue_org()
RETURNS trigger AS $$
DECLARE
  v_org uuid;
BEGIN
  SELECT organization_id INTO v_org FROM public.tachograph_records WHERE id = NEW.tachograph_id;
  NEW.organization_id := v_org;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_tachograph_issues_set_org'
  ) THEN
    CREATE TRIGGER trg_tachograph_issues_set_org
    BEFORE INSERT ON public.tachograph_issues
    FOR EACH ROW EXECUTE FUNCTION public.set_tachograph_issue_org();
  END IF;
END $$;

-- RLS for tachograph_issues
ALTER TABLE public.tachograph_issues ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Org members can view
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tachograph_issues' AND policyname='Org members can view tachograph issues'
  ) THEN
    CREATE POLICY "Org members can view tachograph issues" ON public.tachograph_issues
    FOR SELECT
    USING (
      organization_id IN (
        SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()
      )
    );
  END IF;
  -- Reporters can insert issues for their org (validated via parent record and trigger)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tachograph_issues' AND policyname='Users can report issues in their org'
  ) THEN
    CREATE POLICY "Users can report issues in their org" ON public.tachograph_issues
    FOR INSERT
    WITH CHECK (
      reported_by = auth.uid() AND
      EXISTS (
        SELECT 1 FROM public.tachograph_records tr
        WHERE tr.id = tachograph_id AND tr.organization_id IN (
          SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()
        )
      )
    );
  END IF;
  -- Org members can update issues in their org
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tachograph_issues' AND policyname='Org members can update tachograph issues'
  ) THEN
    CREATE POLICY "Org members can update tachograph issues" ON public.tachograph_issues
    FOR UPDATE
    USING (
      organization_id IN (
        SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()
      )
    )
    WITH CHECK (
      organization_id IN (
        SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()
      )
    );
  END IF;
END $$;

-- 4) Compliance alerts table
CREATE TABLE IF NOT EXISTS public.compliance_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  alert_type text NOT NULL,
  title text NOT NULL,
  description text,
  severity text NOT NULL DEFAULT 'medium',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.compliance_alerts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Admins can manage alerts
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='compliance_alerts' AND policyname='Admins can manage compliance alerts'
  ) THEN
    CREATE POLICY "Admins can manage compliance alerts" ON public.compliance_alerts
    FOR ALL
    USING (public.is_admin_user(auth.uid()))
    WITH CHECK (public.is_admin_user(auth.uid()));
  END IF;
  -- Org members can view alerts
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='compliance_alerts' AND policyname='Org members can view compliance alerts'
  ) THEN
    CREATE POLICY "Org members can view compliance alerts" ON public.compliance_alerts
    FOR SELECT
    USING (
      organization_id IN (
        SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()
      )
    );
  END IF;
END $$;

-- 5) RPC to process tachograph violations (used by edge function)
CREATE OR REPLACE FUNCTION public.process_tachograph_violations(
  p_tachograph_record_id uuid,
  p_organization_id uuid,
  p_driver_id uuid,
  p_vehicle_id uuid,
  p_analysis_results jsonb
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count integer := 0;
  v_now timestamptz := now();
BEGIN
  -- Driving time violation
  IF (p_analysis_results->>'driving_time_violation')::boolean IS TRUE THEN
    INSERT INTO public.compliance_violations (
      violation_type, description, severity, driver_id, organization_id, occurred_at
    ) VALUES (
      'driving_time_exceeded',
      COALESCE(p_analysis_results->>'driving_time_details', 'Exceeded driving time limit'),
      'medium', p_driver_id, p_organization_id, v_now
    );
    v_count := v_count + 1;
  END IF;

  -- Rest period violation
  IF (p_analysis_results->>'rest_period_violation')::boolean IS TRUE THEN
    INSERT INTO public.compliance_violations (
      violation_type, description, severity, driver_id, organization_id, occurred_at
    ) VALUES (
      'insufficient_rest',
      COALESCE(p_analysis_results->>'rest_period_details', 'Insufficient rest periods'),
      'medium', p_driver_id, p_organization_id, v_now
    );
    v_count := v_count + 1;
  END IF;

  -- Speed violation
  IF (p_analysis_results->>'speed_violation')::boolean IS TRUE THEN
    INSERT INTO public.compliance_violations (
      violation_type, description, severity, driver_id, organization_id, occurred_at
    ) VALUES (
      'speed_limit_exceeded',
      'Speed exceeded safe threshold',
      'low', p_driver_id, p_organization_id, v_now
    );
    v_count := v_count + 1;
  END IF;

  -- Card insertion violation
  IF (p_analysis_results->>'card_insertion_violation')::boolean IS TRUE THEN
    INSERT INTO public.compliance_violations (
      violation_type, description, severity, driver_id, organization_id, occurred_at
    ) VALUES (
      'driver_card_not_inserted',
      COALESCE(p_analysis_results->>'card_details', 'Driver card missing during journey'),
      'medium', p_driver_id, p_organization_id, v_now
    );
    v_count := v_count + 1;
  END IF;

  -- Manipulation detected
  IF (p_analysis_results->>'manipulation_detected')::boolean IS TRUE THEN
    INSERT INTO public.compliance_violations (
      violation_type, description, severity, driver_id, organization_id, occurred_at
    ) VALUES (
      'data_tampering_suspected',
      COALESCE(p_analysis_results->>'manipulation_details', 'Possible data tampering detected'),
      'high', p_driver_id, p_organization_id, v_now
    );
    v_count := v_count + 1;
  END IF;

  RETURN v_count;
END;
$$;