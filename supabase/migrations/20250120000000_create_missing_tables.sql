-- Create missing tables for the fuel system and other components
-- This migration creates the foundational tables that are referenced by other components

-- 1. Create profiles table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  role text DEFAULT 'driver' CHECK (role IN ('driver', 'admin', 'parent', 'council', 'mechanic')),
  organization_id uuid,
  is_active boolean DEFAULT true,
  phone text,
  address text,
  date_of_birth date,
  license_number text,
  license_expiry date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Create organizations table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  address text,
  phone text,
  email text,
  website text,
  subscription_tier text DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'premium', 'enterprise')),
  subscription_status text DEFAULT 'active' CHECK (subscription_status IN ('active', 'suspended', 'cancelled')),
  trial_ends_at timestamp with time zone,
  max_drivers integer DEFAULT 5,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. Create vehicles table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.vehicles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id),
  vehicle_number text NOT NULL,
  license_plate text,
  make text,
  model text,
  year integer,
  vehicle_type text DEFAULT 'bus' CHECK (vehicle_type IN ('bus', 'van', 'car', 'truck')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'retired')),
  fuel_type text DEFAULT 'diesel' CHECK (fuel_type IN ('diesel', 'petrol', 'electric', 'hybrid')),
  capacity integer,
  registration_expiry date,
  insurance_expiry date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 4. Create fuel_purchases table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.fuel_purchases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid NOT NULL REFERENCES public.profiles(id),
  vehicle_id uuid REFERENCES public.vehicles(id),
  organization_id uuid REFERENCES public.organizations(id),
  fuel_type text NOT NULL CHECK (fuel_type IN ('diesel', 'petrol', 'electric')),
  quantity numeric(10,2) NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  total_cost numeric(10,2) NOT NULL,
  location text,
  odometer_reading integer,
  purchase_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  receipt_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 5. Create notifications table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  type text NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  action_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 6. Create license_renewals table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.license_renewals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  license_id uuid NOT NULL REFERENCES public.profiles(id),
  renewal_date date NOT NULL,
  previous_expiry_date date NOT NULL,
  new_expiry_date date NOT NULL,
  renewal_cost numeric(10,2),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 7. Create routes table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.routes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  start_location text,
  end_location text,
  estimated_duration integer, -- in minutes
  distance_km numeric(8,2),
  organization_id uuid REFERENCES public.organizations(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 8. Create tachograph_folders table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.tachograph_folders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  parent_folder_id uuid REFERENCES public.tachograph_folders(id),
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 9. Create vehicle_checks table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.vehicle_checks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid NOT NULL REFERENCES public.profiles(id),
  vehicle_id uuid REFERENCES public.vehicles(id),
  check_date date NOT NULL DEFAULT CURRENT_DATE,
  status text DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
  issues_found text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tachograph_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_checks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Organization admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.id = auth.uid()
      AND admin_profile.role = 'admin'
      AND admin_profile.organization_id = profiles.organization_id
    )
  );

-- Create RLS policies for organizations
CREATE POLICY "Users can view their organization" ON public.organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.organization_id = organizations.id
    )
  );

-- Create RLS policies for vehicles
CREATE POLICY "Organization members can view vehicles" ON public.vehicles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.organization_id = vehicles.organization_id
    )
  );

-- Create RLS policies for fuel_purchases
CREATE POLICY "Drivers can view their own fuel purchases" ON public.fuel_purchases
  FOR SELECT USING (driver_id = auth.uid());

CREATE POLICY "Drivers can insert their own fuel purchases" ON public.fuel_purchases
  FOR INSERT WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Drivers can update their own fuel purchases" ON public.fuel_purchases
  FOR UPDATE USING (driver_id = auth.uid());

CREATE POLICY "Organization admins can view all fuel purchases" ON public.fuel_purchases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.id = auth.uid()
      AND admin_profile.role = 'admin'
      AND admin_profile.organization_id = fuel_purchases.organization_id
    )
  );

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Create RLS policies for license_renewals
CREATE POLICY "Users can view their own license renewals" ON public.license_renewals
  FOR SELECT USING (license_id = auth.uid());

-- Create RLS policies for routes
CREATE POLICY "Organization members can view routes" ON public.routes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.organization_id = routes.organization_id
    )
  );

-- Create RLS policies for tachograph_folders
CREATE POLICY "Organization members can view folders" ON public.tachograph_folders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.organization_id = tachograph_folders.organization_id
    )
  );

CREATE POLICY "Users can create folders in their organization" ON public.tachograph_folders
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.organization_id = tachograph_folders.organization_id
    )
  );

-- Create RLS policies for vehicle_checks
CREATE POLICY "Drivers can view their own vehicle checks" ON public.vehicle_checks
  FOR SELECT USING (driver_id = auth.uid());

CREATE POLICY "Drivers can insert their own vehicle checks" ON public.vehicle_checks
  FOR INSERT WITH CHECK (driver_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_organization_id ON public.vehicles(organization_id);
CREATE INDEX IF NOT EXISTS idx_fuel_purchases_driver_id ON public.fuel_purchases(driver_id);
CREATE INDEX IF NOT EXISTS idx_fuel_purchases_vehicle_id ON public.fuel_purchases(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fuel_purchases_purchase_date ON public.fuel_purchases(purchase_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_license_renewals_license_id ON public.license_renewals(license_id);
CREATE INDEX IF NOT EXISTS idx_routes_organization_id ON public.routes(organization_id);
CREATE INDEX IF NOT EXISTS idx_tachograph_folders_organization_id ON public.tachograph_folders(organization_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_checks_driver_id ON public.vehicle_checks(driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_checks_check_date ON public.vehicle_checks(check_date);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fuel_purchases_updated_at BEFORE UPDATE ON public.fuel_purchases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_license_renewals_updated_at BEFORE UPDATE ON public.license_renewals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON public.routes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tachograph_folders_updated_at BEFORE UPDATE ON public.tachograph_folders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_checks_updated_at BEFORE UPDATE ON public.vehicle_checks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fuel_purchases TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.license_renewals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.routes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tachograph_folders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicle_checks TO authenticated;
