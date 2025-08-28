
-- Add payment and run tracking columns to routes table
ALTER TABLE routes ADD COLUMN IF NOT EXISTS morning_run_payment DECIMAL(10,2);
ALTER TABLE routes ADD COLUMN IF NOT EXISTS afternoon_run_payment DECIMAL(10,2);
ALTER TABLE routes ADD COLUMN IF NOT EXISTS afternoon_is_reverse BOOLEAN DEFAULT true;
ALTER TABLE routes ADD COLUMN IF NOT EXISTS transport_company TEXT;
ALTER TABLE routes ADD COLUMN IF NOT EXISTS route_number TEXT;

-- Add run type and sign-on tracking to driver assignments
ALTER TABLE driver_assignments ADD COLUMN IF NOT EXISTS morning_signed_on BOOLEAN DEFAULT false;
ALTER TABLE driver_assignments ADD COLUMN IF NOT EXISTS afternoon_signed_on BOOLEAN DEFAULT false;
ALTER TABLE driver_assignments ADD COLUMN IF NOT EXISTS morning_sign_on_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE driver_assignments ADD COLUMN IF NOT EXISTS afternoon_sign_on_time TIMESTAMP WITH TIME ZONE;

-- Add transport company and route selection to child profiles
ALTER TABLE child_profiles ADD COLUMN IF NOT EXISTS transport_company TEXT;
ALTER TABLE child_profiles ADD COLUMN IF NOT EXISTS route_number TEXT;
ALTER TABLE child_profiles ADD COLUMN IF NOT EXISTS route_id UUID REFERENCES routes(id);

-- Update students table to include more contact details
ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_phone TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_email TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS home_address TEXT;

-- Create a table for tracking daily run sign-ons
CREATE TABLE IF NOT EXISTS daily_run_signons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES profiles(id) NOT NULL,
  route_id UUID REFERENCES routes(id) NOT NULL,
  run_type TEXT NOT NULL CHECK (run_type IN ('morning', 'afternoon')),
  sign_on_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sign_on_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  payment_amount DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on daily_run_signons
ALTER TABLE daily_run_signons ENABLE ROW LEVEL SECURITY;

-- Create policy for drivers to manage their own sign-ons
CREATE POLICY "Drivers can manage their own sign-ons" ON daily_run_signons
  FOR ALL USING (driver_id = auth.uid());

-- Create policy for admins to view all sign-ons
CREATE POLICY "Admins can view all sign-ons" ON daily_run_signons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'council')
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_run_signons_driver_date ON daily_run_signons(driver_id, sign_on_date);
CREATE INDEX IF NOT EXISTS idx_daily_run_signons_route_date ON daily_run_signons(route_id, sign_on_date);
CREATE INDEX IF NOT EXISTS idx_routes_transport_company ON routes(transport_company);
CREATE INDEX IF NOT EXISTS idx_child_profiles_route ON child_profiles(route_id);
