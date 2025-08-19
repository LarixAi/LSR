-- Fix Driver Dashboard Tables - Complete Solution
-- This script will create all missing tables for the Driver Dashboard

-- 1. Create routes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.routes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  start_location text,
  destination text NOT NULL,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  estimated_duration interval,
  actual_duration interval,
  distance_km numeric(8,2),
  fuel_consumption numeric(6,2),
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled', 'delayed')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for routes
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for routes
DROP POLICY IF EXISTS "Drivers can view their own routes" ON public.routes;
DROP POLICY IF EXISTS "Drivers can insert their own routes" ON public.routes;
DROP POLICY IF EXISTS "Drivers can update their own routes" ON public.routes;
DROP POLICY IF EXISTS "Organization admins can view all routes" ON public.routes;

CREATE POLICY "Drivers can view their own routes"
ON public.routes FOR SELECT
USING (driver_id = auth.uid());

CREATE POLICY "Drivers can insert their own routes"
ON public.routes FOR INSERT
WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Drivers can update their own routes"
ON public.routes FOR UPDATE
USING (driver_id = auth.uid())
WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Organization admins can view all routes"
ON public.routes FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'council')
  )
);

-- Create indexes for routes
CREATE INDEX IF NOT EXISTS idx_routes_driver_id ON public.routes(driver_id);
CREATE INDEX IF NOT EXISTS idx_routes_start_time ON public.routes(start_time);
CREATE INDEX IF NOT EXISTS idx_routes_status ON public.routes(status);
CREATE INDEX IF NOT EXISTS idx_routes_organization_id ON public.routes(organization_id);

-- 2. Create vehicles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.vehicles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  vehicle_number text UNIQUE NOT NULL,
  license_plate text UNIQUE NOT NULL,
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  vin text UNIQUE,
  fuel_type text DEFAULT 'diesel' CHECK (fuel_type IN ('diesel', 'petrol', 'electric', 'hybrid', 'lpg')),
  fuel_level numeric(3,1) DEFAULT 0 CHECK (fuel_level >= 0 AND fuel_level <= 100),
  mileage_km numeric(10,2) DEFAULT 0,
  last_maintenance_date date,
  next_maintenance_date date,
  status text DEFAULT 'available' CHECK (status IN ('available', 'in-use', 'maintenance', 'out-of-service', 'retired')),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for vehicles
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vehicles
DROP POLICY IF EXISTS "Organization members can view vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Organization admins can manage vehicles" ON public.vehicles;

CREATE POLICY "Organization members can view vehicles"
ON public.vehicles FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Organization admins can manage vehicles"
ON public.vehicles FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'council')
  )
);

-- Create indexes for vehicles
CREATE INDEX IF NOT EXISTS idx_vehicles_organization_id ON public.vehicles(organization_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON public.vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate ON public.vehicles(license_plate);

-- 3. Create driver_vehicle_assignments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.driver_vehicle_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  assigned_date date NOT NULL DEFAULT CURRENT_DATE,
  unassigned_date date,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'temporary')),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Ensure one active assignment per driver
  UNIQUE(driver_id, status)
);

-- Enable RLS for driver_vehicle_assignments
ALTER TABLE public.driver_vehicle_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for driver_vehicle_assignments
DROP POLICY IF EXISTS "Drivers can view their own assignments" ON public.driver_vehicle_assignments;
DROP POLICY IF EXISTS "Organization admins can manage assignments" ON public.driver_vehicle_assignments;

CREATE POLICY "Drivers can view their own assignments"
ON public.driver_vehicle_assignments FOR SELECT
USING (driver_id = auth.uid());

CREATE POLICY "Organization admins can manage assignments"
ON public.driver_vehicle_assignments FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'council')
  )
);

-- Create indexes for driver_vehicle_assignments
CREATE INDEX IF NOT EXISTS idx_driver_vehicle_assignments_driver_id ON public.driver_vehicle_assignments(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_vehicle_assignments_vehicle_id ON public.driver_vehicle_assignments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_driver_vehicle_assignments_status ON public.driver_vehicle_assignments(status);

-- 4. Create fuel_purchases table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.fuel_purchases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  purchase_date date NOT NULL DEFAULT CURRENT_DATE,
  purchase_time timestamp with time zone DEFAULT now(),
  fuel_station text,
  fuel_type text DEFAULT 'diesel' CHECK (fuel_type IN ('diesel', 'petrol', 'electric', 'hybrid', 'lpg')),
  quantity_liters numeric(8,2) NOT NULL,
  price_per_liter numeric(6,2) NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  odometer_reading numeric(10,2),
  receipt_number text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for fuel_purchases
ALTER TABLE public.fuel_purchases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for fuel_purchases
DROP POLICY IF EXISTS "Drivers can view their own fuel purchases" ON public.fuel_purchases;
DROP POLICY IF EXISTS "Drivers can insert their own fuel purchases" ON public.fuel_purchases;
DROP POLICY IF EXISTS "Drivers can update their own fuel purchases" ON public.fuel_purchases;
DROP POLICY IF EXISTS "Organization admins can view all fuel purchases" ON public.fuel_purchases;

CREATE POLICY "Drivers can view their own fuel purchases"
ON public.fuel_purchases FOR SELECT
USING (driver_id = auth.uid());

CREATE POLICY "Drivers can insert their own fuel purchases"
ON public.fuel_purchases FOR INSERT
WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Drivers can update their own fuel purchases"
ON public.fuel_purchases FOR UPDATE
USING (driver_id = auth.uid())
WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Organization admins can view all fuel purchases"
ON public.fuel_purchases FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'council')
  )
);

-- Create indexes for fuel_purchases
CREATE INDEX IF NOT EXISTS idx_fuel_purchases_driver_id ON public.fuel_purchases(driver_id);
CREATE INDEX IF NOT EXISTS idx_fuel_purchases_vehicle_id ON public.fuel_purchases(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fuel_purchases_purchase_date ON public.fuel_purchases(purchase_date);
CREATE INDEX IF NOT EXISTS idx_fuel_purchases_organization_id ON public.fuel_purchases(organization_id);

-- 5. Create incidents table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.incidents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  incident_date date NOT NULL DEFAULT CURRENT_DATE,
  incident_time timestamp with time zone DEFAULT now(),
  incident_type text NOT NULL CHECK (incident_type IN ('accident', 'breakdown', 'traffic_violation', 'weather_delay', 'other')),
  severity text DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  location text,
  description text NOT NULL,
  damage_description text,
  estimated_cost numeric(10,2),
  status text DEFAULT 'reported' CHECK (status IN ('reported', 'investigating', 'resolved', 'closed')),
  resolution text,
  resolved_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for incidents
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for incidents
DROP POLICY IF EXISTS "Drivers can view their own incidents" ON public.incidents;
DROP POLICY IF EXISTS "Drivers can insert their own incidents" ON public.incidents;
DROP POLICY IF EXISTS "Drivers can update their own incidents" ON public.incidents;
DROP POLICY IF EXISTS "Organization admins can view all incidents" ON public.incidents;

CREATE POLICY "Drivers can view their own incidents"
ON public.incidents FOR SELECT
USING (driver_id = auth.uid());

CREATE POLICY "Drivers can insert their own incidents"
ON public.incidents FOR INSERT
WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Drivers can update their own incidents"
ON public.incidents FOR UPDATE
USING (driver_id = auth.uid())
WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Organization admins can view all incidents"
ON public.incidents FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'council')
  )
);

-- Create indexes for incidents
CREATE INDEX IF NOT EXISTS idx_incidents_driver_id ON public.incidents(driver_id);
CREATE INDEX IF NOT EXISTS idx_incidents_vehicle_id ON public.incidents(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_incidents_incident_date ON public.incidents(incident_date);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON public.incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);

-- 6. Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
DROP TRIGGER IF EXISTS update_routes_updated_at ON public.routes;
CREATE TRIGGER update_routes_updated_at
    BEFORE UPDATE ON public.routes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vehicles_updated_at ON public.vehicles;
CREATE TRIGGER update_vehicles_updated_at
    BEFORE UPDATE ON public.vehicles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_driver_vehicle_assignments_updated_at ON public.driver_vehicle_assignments;
CREATE TRIGGER update_driver_vehicle_assignments_updated_at
    BEFORE UPDATE ON public.driver_vehicle_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fuel_purchases_updated_at ON public.fuel_purchases;
CREATE TRIGGER update_fuel_purchases_updated_at
    BEFORE UPDATE ON public.fuel_purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_incidents_updated_at ON public.incidents;
CREATE TRIGGER update_incidents_updated_at
    BEFORE UPDATE ON public.incidents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.routes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.driver_vehicle_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fuel_purchases TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.incidents TO authenticated;

-- 8. Insert sample data for testing
DO $$
DECLARE
    current_driver_id uuid;
    current_org_id uuid;
    sample_vehicle_id uuid;
BEGIN
    -- Get the current authenticated user's ID and organization
    SELECT id, organization_id INTO current_driver_id, current_org_id
    FROM public.profiles
    WHERE id = auth.uid();

    -- If no driver found, use the first driver in the system
    IF current_driver_id IS NULL THEN
        SELECT id, organization_id INTO current_driver_id, current_org_id
        FROM public.profiles
        WHERE role = 'driver'
        LIMIT 1;
    END IF;

    RAISE NOTICE 'Setting up sample data for driver: %', current_driver_id;

    -- Create a sample vehicle
    INSERT INTO public.vehicles (
        organization_id,
        vehicle_number,
        license_plate,
        make,
        model,
        year,
        fuel_level,
        status
    )
    VALUES (
        current_org_id,
        'VH001',
        'AB12 CDE',
        'Mercedes-Benz',
        'Sprinter',
        2022,
        75.5,
        'available'
    )
    ON CONFLICT (vehicle_number) DO NOTHING
    RETURNING id INTO sample_vehicle_id;

    -- If vehicle was created, assign it to the driver
    IF sample_vehicle_id IS NOT NULL THEN
        INSERT INTO public.driver_vehicle_assignments (
            driver_id,
            vehicle_id,
            organization_id,
            status
        )
        VALUES (
            current_driver_id,
            sample_vehicle_id,
            current_org_id,
            'active'
        )
        ON CONFLICT (driver_id, status) DO NOTHING;
    END IF;

    -- Create sample routes
    INSERT INTO public.routes (
        driver_id,
        organization_id,
        name,
        destination,
        start_time,
        end_time,
        status,
        priority
    )
    VALUES 
        (current_driver_id, current_org_id, 'Morning Delivery', 'Central London', 
         CURRENT_DATE + INTERVAL '8 hours', CURRENT_DATE + INTERVAL '12 hours', 'scheduled', 'high'),
        (current_driver_id, current_org_id, 'Afternoon Route', 'Manchester', 
         CURRENT_DATE + INTERVAL '14 hours', CURRENT_DATE + INTERVAL '18 hours', 'scheduled', 'medium')
    ON CONFLICT DO NOTHING;

    -- Create sample fuel purchase
    INSERT INTO public.fuel_purchases (
        driver_id,
        vehicle_id,
        organization_id,
        fuel_station,
        quantity_liters,
        price_per_liter,
        total_amount,
        odometer_reading
    )
    VALUES (
        current_driver_id,
        sample_vehicle_id,
        current_org_id,
        'Shell Station',
        45.5,
        1.85,
        84.18,
        12500.0
    )
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Sample data created successfully';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating sample data: %', SQLERRM;
END $$;

-- 9. Verify the setup
SELECT 
    'routes' as table_name,
    COUNT(*) as record_count
FROM public.routes
UNION ALL
SELECT 
    'vehicles' as table_name,
    COUNT(*) as record_count
FROM public.vehicles
UNION ALL
SELECT 
    'driver_vehicle_assignments' as table_name,
    COUNT(*) as record_count
FROM public.driver_vehicle_assignments
UNION ALL
SELECT 
    'fuel_purchases' as table_name,
    COUNT(*) as record_count
FROM public.fuel_purchases
UNION ALL
SELECT 
    'incidents' as table_name,
    COUNT(*) as record_count
FROM public.incidents;
