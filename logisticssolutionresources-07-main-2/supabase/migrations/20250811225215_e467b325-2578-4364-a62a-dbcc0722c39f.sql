-- Corrected migration: idempotent policy creation and safe trigger recreation

-- 1. Tables (idempotent)
CREATE TABLE IF NOT EXISTS public.tire_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  tire_brand TEXT NOT NULL,
  tire_model TEXT NOT NULL,
  tire_size TEXT NOT NULL,
  tire_type TEXT NOT NULL CHECK (tire_type IN ('drive', 'steer', 'trailer', 'all_position')),
  load_index INTEGER NOT NULL,
  speed_rating TEXT NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  minimum_stock INTEGER NOT NULL DEFAULT 5,
  cost_per_tire DECIMAL(10,2),
  supplier TEXT,
  purchase_date DATE,
  warranty_months INTEGER DEFAULT 24,
  location_storage TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vehicle_tires (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('front_left', 'front_right', 'rear_left_outer', 'rear_left_inner', 'rear_right_outer', 'rear_right_inner', 'spare')),
  tire_inventory_id UUID REFERENCES public.tire_inventory(id),
  serial_number TEXT,
  installation_date DATE NOT NULL,
  installation_mileage INTEGER,
  current_tread_depth DECIMAL(3,1),
  last_inspection_date DATE,
  next_inspection_due DATE,
  pressure_psi INTEGER,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'worn', 'damaged', 'replaced', 'rotated')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.compliance_violations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  violation_type TEXT NOT NULL,
  violation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  points_deducted INTEGER DEFAULT 0,
  fine_amount DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'appealed', 'dismissed')),
  resolved_date DATE,
  resolved_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vehicle_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL,
  vehicle_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  check_type TEXT NOT NULL DEFAULT 'daily' CHECK (check_type IN ('daily', 'weekly', 'monthly', 'pre_trip', 'post_trip')),
  check_date DATE NOT NULL DEFAULT CURRENT_DATE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  overall_status TEXT NOT NULL DEFAULT 'pending' CHECK (overall_status IN ('pending', 'in_progress', 'completed', 'failed')),
  defects_count INTEGER NOT NULL DEFAULT 0,
  compliance_score INTEGER CHECK (compliance_score >= 0 AND compliance_score <= 100),
  compliance_status TEXT DEFAULT 'compliant' CHECK (compliance_status IN ('compliant', 'non_compliant', 'warning', 'critical')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vehicle_check_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  check_id UUID NOT NULL REFERENCES public.vehicle_checks(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  item_label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ok' CHECK (status IN ('ok', 'defect', 'warning', 'critical')),
  severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  comment TEXT,
  photo_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  driver_id UUID,
  vehicle_id UUID,
  incident_type TEXT NOT NULL,
  incident_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  location TEXT,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'investigating', 'resolved', 'closed')),
  reported_by UUID NOT NULL,
  assigned_to UUID,
  resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  vehicle_number TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  license_plate TEXT,
  vin TEXT,
  vehicle_type TEXT NOT NULL DEFAULT 'truck' CHECK (vehicle_type IN ('truck', 'van', 'bus', 'car', 'trailer')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'retired', 'sold')),
  fuel_type TEXT DEFAULT 'diesel' CHECK (fuel_type IN ('diesel', 'gasoline', 'electric', 'hybrid')),
  fuel_capacity DECIMAL(5,2),
  odometer INTEGER,
  last_service_date DATE,
  next_service_date DATE,
  insurance_expiry DATE,
  registration_expiry DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL,
  vehicle_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  assignment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  assignment_type TEXT NOT NULL DEFAULT 'permanent' CHECK (assignment_type IN ('permanent', 'temporary', 'backup')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.infringements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  infringement_type TEXT NOT NULL,
  infringement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  points_deducted INTEGER DEFAULT 0,
  fine_amount DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'appealed', 'dismissed')),
  resolved_date DATE,
  resolved_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_points_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  points_change INTEGER NOT NULL,
  points_before INTEGER NOT NULL,
  points_after INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_type TEXT CHECK (reference_type IN ('infringement', 'compliance_violation', 'training', 'manual_adjustment')),
  reference_id UUID,
  recorded_by UUID NOT NULL,
  recorded_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  job_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_driver_id UUID,
  assigned_vehicle_id UUID,
  start_date DATE,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  pickup_location TEXT,
  delivery_location TEXT,
  customer_name TEXT,
  customer_contact TEXT,
  estimated_duration INTEGER,
  actual_duration INTEGER,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'US',
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  subscription_plan TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'trial', 'expired', 'cancelled')),
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  subscription_ends_at TIMESTAMP WITH TIME ZONE,
  max_users INTEGER DEFAULT 5,
  max_vehicles INTEGER DEFAULT 10,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'driver' CHECK (role IN ('admin', 'council', 'driver', 'mechanic', 'parent')),
  avatar_url TEXT,
  employment_status TEXT DEFAULT 'active' CHECK (employment_status IN ('active', 'inactive', 'terminated', 'suspended')),
  onboarding_status TEXT DEFAULT 'pending' CHECK (onboarding_status IN ('pending', 'in_progress', 'completed', 'failed')),
  hire_date DATE,
  employee_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  termination_date DATE,
  cdl_number TEXT,
  medical_card_expiry DATE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  must_change_password BOOLEAN DEFAULT false,
  password_changed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_tire_inventory_organization ON public.tire_inventory(organization_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_tires_vehicle ON public.vehicle_tires(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_tires_organization ON public.vehicle_tires(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_driver ON public.compliance_violations(driver_id);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_organization ON public.compliance_violations(organization_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_checks_driver ON public.vehicle_checks(driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_checks_vehicle ON public.vehicle_checks(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_checks_organization ON public.vehicle_checks(organization_id);
CREATE INDEX IF NOT EXISTS idx_incidents_organization ON public.incidents(organization_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_organization ON public.vehicles(organization_id);
CREATE INDEX IF NOT EXISTS idx_driver_assignments_driver ON public.driver_assignments(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_assignments_vehicle ON public.driver_assignments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_infringements_driver ON public.infringements(driver_id);
CREATE INDEX IF NOT EXISTS idx_jobs_organization ON public.jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_organization ON public.profiles(organization_id);

-- 3. Enable RLS (idempotent)
ALTER TABLE public.tire_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_tires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_check_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infringements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Policies (create only if missing)
DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tire_inventory' AND policyname='Organization members can view tire inventory'
  ) THEN
    CREATE POLICY "Organization members can view tire inventory"
    ON public.tire_inventory FOR SELECT
    USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
  END IF;
END$$;

DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tire_inventory' AND policyname='Admins can manage tire inventory'
  ) THEN
    CREATE POLICY "Admins can manage tire inventory"
    ON public.tire_inventory FOR ALL
    USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'council')));
  END IF;
END$$;

DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vehicle_checks' AND policyname='Drivers can manage their own checks'
  ) THEN
    CREATE POLICY "Drivers can manage their own checks"
    ON public.vehicle_checks FOR ALL
    USING (driver_id = auth.uid() OR organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'council')));
  END IF;
END$$;

DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vehicle_checks' AND policyname='Org members can view vehicle checks'
  ) THEN
    CREATE POLICY "Org members can view vehicle checks"
    ON public.vehicle_checks FOR SELECT
    USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
  END IF;
END$$;

DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='compliance_violations' AND policyname='Drivers can view their own violations'
  ) THEN
    CREATE POLICY "Drivers can view their own violations"
    ON public.compliance_violations FOR SELECT
    USING (driver_id = auth.uid() OR organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'council')));
  END IF;
END$$;

DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='compliance_violations' AND policyname='Admins can manage compliance violations'
  ) THEN
    CREATE POLICY "Admins can manage compliance violations"
    ON public.compliance_violations FOR ALL
    USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'council')));
  END IF;
END$$;

DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vehicles' AND policyname='Org members can view vehicles'
  ) THEN
    CREATE POLICY "Org members can view vehicles"
    ON public.vehicles FOR SELECT
    USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
  END IF;
END$$;

DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vehicles' AND policyname='Admins can manage vehicles'
  ) THEN
    CREATE POLICY "Admins can manage vehicles"
    ON public.vehicles FOR ALL
    USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'council')));
  END IF;
END$$;

DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='driver_assignments' AND policyname='Drivers can view their assignments'
  ) THEN
    CREATE POLICY "Drivers can view their assignments"
    ON public.driver_assignments FOR SELECT
    USING (driver_id = auth.uid() OR organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'council')));
  END IF;
END$$;

DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='driver_assignments' AND policyname='Admins can manage driver assignments'
  ) THEN
    CREATE POLICY "Admins can manage driver assignments"
    ON public.driver_assignments FOR ALL
    USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'council')));
  END IF;
END$$;

DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='jobs' AND policyname='Org members can view jobs'
  ) THEN
    CREATE POLICY "Org members can view jobs"
    ON public.jobs FOR SELECT
    USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
  END IF;
END$$;

DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='jobs' AND policyname='Admins can manage jobs'
  ) THEN
    CREATE POLICY "Admins can manage jobs"
    ON public.jobs FOR ALL
    USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'council')));
  END IF;
END$$;

DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='Users can view their own profile'
  ) THEN
    CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (id = auth.uid());
  END IF;
END$$;

DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='Admins can manage profiles'
  ) THEN
    CREATE POLICY "Admins can manage profiles"
    ON public.profiles FOR ALL
    USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'council')));
  END IF;
END$$;

-- 5. Triggers: drop-if-exists then recreate
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '';

DO $$BEGIN
  -- tire_inventory
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_tire_inventory_updated_at') THEN
    DROP TRIGGER update_tire_inventory_updated_at ON public.tire_inventory;
  END IF;
  CREATE TRIGGER update_tire_inventory_updated_at BEFORE UPDATE ON public.tire_inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  -- vehicle_tires
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_vehicle_tires_updated_at') THEN
    DROP TRIGGER update_vehicle_tires_updated_at ON public.vehicle_tires;
  END IF;
  CREATE TRIGGER update_vehicle_tires_updated_at BEFORE UPDATE ON public.vehicle_tires FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  -- compliance_violations
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_compliance_violations_updated_at') THEN
    DROP TRIGGER update_compliance_violations_updated_at ON public.compliance_violations;
  END IF;
  CREATE TRIGGER update_compliance_violations_updated_at BEFORE UPDATE ON public.compliance_violations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  -- vehicle_checks
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_vehicle_checks_updated_at') THEN
    DROP TRIGGER update_vehicle_checks_updated_at ON public.vehicle_checks;
  END IF;
  CREATE TRIGGER update_vehicle_checks_updated_at BEFORE UPDATE ON public.vehicle_checks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  -- vehicle_check_items
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_vehicle_check_items_updated_at') THEN
    DROP TRIGGER update_vehicle_check_items_updated_at ON public.vehicle_check_items;
  END IF;
  CREATE TRIGGER update_vehicle_check_items_updated_at BEFORE UPDATE ON public.vehicle_check_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  -- incidents
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_incidents_updated_at') THEN
    DROP TRIGGER update_incidents_updated_at ON public.incidents;
  END IF;
  CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  -- vehicles
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_vehicles_updated_at') THEN
    DROP TRIGGER update_vehicles_updated_at ON public.vehicles;
  END IF;
  CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  -- driver_assignments
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_driver_assignments_updated_at') THEN
    DROP TRIGGER update_driver_assignments_updated_at ON public.driver_assignments;
  END IF;
  CREATE TRIGGER update_driver_assignments_updated_at BEFORE UPDATE ON public.driver_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  -- infringements
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_infringements_updated_at') THEN
    DROP TRIGGER update_infringements_updated_at ON public.infringements;
  END IF;
  CREATE TRIGGER update_infringements_updated_at BEFORE UPDATE ON public.infringements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  -- jobs
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_jobs_updated_at') THEN
    DROP TRIGGER update_jobs_updated_at ON public.jobs;
  END IF;
  CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  -- organizations
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_organizations_updated_at') THEN
    DROP TRIGGER update_organizations_updated_at ON public.organizations;
  END IF;
  CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  -- profiles
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    DROP TRIGGER update_profiles_updated_at ON public.profiles;
  END IF;
  CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
END$$;

-- 6. Helper function (align with your request)
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role IN ('admin', 'council')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '';

-- 7. Seed default organization (idempotent)
INSERT INTO public.organizations (id, name, slug, description)
VALUES (
  '021756be-e718-481a-a4ec-0315613bb4cf',
  'Default Organization',
  'default-org',
  'Default organization for the application'
) ON CONFLICT (id) DO NOTHING;
