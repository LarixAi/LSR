-- Comprehensive Database Fix for Driver Dashboard
-- This script fixes all missing tables and columns

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

-- 3. Fix vehicle_checks table - add missing columns
ALTER TABLE public.vehicle_checks ADD COLUMN IF NOT EXISTS check_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.vehicle_checks ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'passed'));
ALTER TABLE public.vehicle_checks ADD COLUMN IF NOT EXISTS issues_found TEXT[] DEFAULT '{}';

-- 4. Add missing columns to routes table
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS destination TEXT;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high'));

-- 5. Add missing columns to vehicles table
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS fuel_level INTEGER DEFAULT 100 CHECK (fuel_level >= 0 AND fuel_level <= 100);
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS last_maintenance_date DATE;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS next_maintenance_date DATE;

-- 6. Add missing columns to time_entries table (if it exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'time_entries') THEN
    ALTER TABLE public.time_entries ADD COLUMN IF NOT EXISTS total_hours DECIMAL(5,2);
  END IF;
END $$;

-- Enable Row Level Security on new tables
ALTER TABLE public.driver_vehicle_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_purchases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for driver_vehicle_assignments
DROP POLICY IF EXISTS "drivers_can_view_own_assignments" ON public.driver_vehicle_assignments;
CREATE POLICY "drivers_can_view_own_assignments" ON public.driver_vehicle_assignments
FOR SELECT USING (driver_id = auth.uid());

DROP POLICY IF EXISTS "admins_can_manage_assignments" ON public.driver_vehicle_assignments;
CREATE POLICY "admins_can_manage_assignments" ON public.driver_vehicle_assignments
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'council')
  )
);

-- Create RLS policies for fuel_purchases
DROP POLICY IF EXISTS "drivers_can_view_own_fuel_purchases" ON public.fuel_purchases;
CREATE POLICY "drivers_can_view_own_fuel_purchases" ON public.fuel_purchases
FOR SELECT USING (driver_id = auth.uid());

DROP POLICY IF EXISTS "drivers_can_insert_own_fuel_purchases" ON public.fuel_purchases;
CREATE POLICY "drivers_can_insert_own_fuel_purchases" ON public.fuel_purchases
FOR INSERT WITH CHECK (driver_id = auth.uid());

DROP POLICY IF EXISTS "admins_can_manage_fuel_purchases" ON public.fuel_purchases;
CREATE POLICY "admins_can_manage_fuel_purchases" ON public.fuel_purchases
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

DROP TRIGGER IF EXISTS update_driver_vehicle_assignments_updated_at ON public.driver_vehicle_assignments;
CREATE TRIGGER update_driver_vehicle_assignments_updated_at 
    BEFORE UPDATE ON public.driver_vehicle_assignments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fuel_purchases_updated_at ON public.fuel_purchases;
CREATE TRIGGER update_fuel_purchases_updated_at 
    BEFORE UPDATE ON public.fuel_purchases 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
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
INSERT INTO public.vehicle_checks (driver_id, vehicle_id, check_type, status, issues_found, notes, check_date)
SELECT 
    dva.driver_id,
    dva.vehicle_id,
    'daily' as check_type,
    'passed' as status,
    ARRAY[]::TEXT[] as issues_found,
    'Daily check completed successfully' as notes,
    CURRENT_DATE as check_date
FROM public.driver_vehicle_assignments dva
WHERE dva.status = 'active'
LIMIT 1;

-- Verify all tables and columns exist
SELECT 'Tables Check' as check_type, 
       table_name,
       CASE WHEN table_name IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('driver_vehicle_assignments', 'fuel_purchases', 'vehicle_checks')
ORDER BY table_name;

-- Check key columns exist
SELECT 'Columns Check' as check_type,
       table_name,
       column_name,
       data_type,
       CASE WHEN column_name IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND (
    (table_name = 'routes' AND column_name IN ('name', 'driver_id', 'start_time', 'end_time', 'destination', 'priority')) OR
    (table_name = 'vehicles' AND column_name IN ('fuel_level', 'last_maintenance_date', 'next_maintenance_date')) OR
    (table_name = 'vehicle_checks' AND column_name IN ('check_date', 'status', 'issues_found')) OR
    (table_name = 'time_entries' AND column_name = 'total_hours')
  )
ORDER BY table_name, column_name;
