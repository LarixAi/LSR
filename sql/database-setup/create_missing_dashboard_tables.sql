-- Create missing tables for Driver Dashboard functionality

-- 1. Create driver_vehicle_assignments table
CREATE TABLE IF NOT EXISTS public.driver_vehicle_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'temporary')),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unassigned_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  organization_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(driver_id, vehicle_id, status)
);

-- 2. Create fuel_purchases table
CREATE TABLE IF NOT EXISTS public.fuel_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('diesel', 'petrol', 'electric')),
  quantity DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  total_cost DECIMAL(10,2) NOT NULL CHECK (total_cost >= 0),
  location TEXT,
  odometer_reading INTEGER,
  purchase_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  organization_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create vehicle_checks table (if not exists)
CREATE TABLE IF NOT EXISTS public.vehicle_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  check_type TEXT NOT NULL CHECK (check_type IN ('daily', 'weekly', 'comprehensive')),
  status TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'pending')),
  issues_found TEXT[],
  notes TEXT,
  check_date DATE DEFAULT CURRENT_DATE,
  organization_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Add missing columns to routes table for dashboard functionality
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS destination TEXT;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high'));

-- 5. Add missing columns to vehicles table for dashboard functionality
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS fuel_level INTEGER DEFAULT 100 CHECK (fuel_level >= 0 AND fuel_level <= 100);
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS last_maintenance_date DATE;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS next_maintenance_date DATE;

-- Enable Row Level Security on new tables
ALTER TABLE public.driver_vehicle_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_checks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for driver_vehicle_assignments
CREATE POLICY "drivers_can_view_own_assignments" ON public.driver_vehicle_assignments
FOR SELECT USING (driver_id = auth.uid());

CREATE POLICY "admins_can_manage_assignments" ON public.driver_vehicle_assignments
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'council')
  )
);

-- Create RLS policies for fuel_purchases
CREATE POLICY "drivers_can_view_own_fuel_purchases" ON public.fuel_purchases
FOR SELECT USING (driver_id = auth.uid());

CREATE POLICY "drivers_can_insert_own_fuel_purchases" ON public.fuel_purchases
FOR INSERT WITH CHECK (driver_id = auth.uid());

CREATE POLICY "admins_can_manage_fuel_purchases" ON public.fuel_purchases
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'council')
  )
);

-- Create RLS policies for vehicle_checks
CREATE POLICY "drivers_can_view_own_vehicle_checks" ON public.vehicle_checks
FOR SELECT USING (driver_id = auth.uid());

CREATE POLICY "drivers_can_insert_own_vehicle_checks" ON public.vehicle_checks
FOR INSERT WITH CHECK (driver_id = auth.uid());

CREATE POLICY "admins_can_manage_vehicle_checks" ON public.vehicle_checks
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'council')
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_driver_vehicle_assignments_driver_id ON public.driver_vehicle_assignments(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_vehicle_assignments_vehicle_id ON public.driver_vehicle_assignments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_driver_vehicle_assignments_status ON public.driver_vehicle_assignments(status);

CREATE INDEX IF NOT EXISTS idx_fuel_purchases_driver_id ON public.fuel_purchases(driver_id);
CREATE INDEX IF NOT EXISTS idx_fuel_purchases_vehicle_id ON public.fuel_purchases(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fuel_purchases_purchase_date ON public.fuel_purchases(purchase_date);

CREATE INDEX IF NOT EXISTS idx_vehicle_checks_driver_id ON public.vehicle_checks(driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_checks_vehicle_id ON public.vehicle_checks(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_checks_check_date ON public.vehicle_checks(check_date);

CREATE INDEX IF NOT EXISTS idx_routes_driver_id ON public.routes(driver_id);
CREATE INDEX IF NOT EXISTS idx_routes_start_time ON public.routes(start_time);

-- Add triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_driver_vehicle_assignments_updated_at 
    BEFORE UPDATE ON public.driver_vehicle_assignments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fuel_purchases_updated_at 
    BEFORE UPDATE ON public.fuel_purchases 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_checks_updated_at 
    BEFORE UPDATE ON public.vehicle_checks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (optional)
-- You can remove these INSERT statements if you don't want sample data

-- Sample driver-vehicle assignment
INSERT INTO public.driver_vehicle_assignments (driver_id, vehicle_id, status, organization_id)
SELECT 
    p.id as driver_id,
    v.id as vehicle_id,
    'active' as status,
    p.organization_id
FROM public.profiles p
CROSS JOIN public.vehicles v
WHERE p.role = 'driver' 
    AND v.organization_id = p.organization_id
    AND NOT EXISTS (
        SELECT 1 FROM public.driver_vehicle_assignments dva 
        WHERE dva.driver_id = p.id AND dva.status = 'active'
    )
LIMIT 1;

-- Sample fuel purchase
INSERT INTO public.fuel_purchases (driver_id, vehicle_id, fuel_type, quantity, unit_price, total_cost, location, odometer_reading)
SELECT 
    dva.driver_id,
    dva.vehicle_id,
    'diesel' as fuel_type,
    50.0 as quantity,
    1.85 as unit_price,
    92.50 as total_cost,
    'Local Gas Station' as location,
    50000 as odometer_reading
FROM public.driver_vehicle_assignments dva
WHERE dva.status = 'active'
LIMIT 1;

-- Sample vehicle check
INSERT INTO public.vehicle_checks (driver_id, vehicle_id, check_type, status, issues_found, notes)
SELECT 
    dva.driver_id,
    dva.vehicle_id,
    'daily' as check_type,
    'passed' as status,
    ARRAY[]::TEXT[] as issues_found,
    'Daily check completed successfully' as notes
FROM public.driver_vehicle_assignments dva
WHERE dva.status = 'active'
LIMIT 1;
