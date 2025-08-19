-- Create customer bookings table
CREATE TABLE public.customer_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  pickup_datetime TIMESTAMPTZ NOT NULL,
  passenger_count INTEGER NOT NULL,
  special_requirements TEXT,
  estimated_price DECIMAL(10,2) NOT NULL,
  final_price DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_driver_id UUID REFERENCES public.profiles(id),
  assigned_vehicle_id UUID REFERENCES public.vehicles(id),
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  stripe_payment_intent_id TEXT,
  tracking_data JSONB DEFAULT '{}',
  customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
  customer_feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for customer bookings
CREATE POLICY "Customers can view their own bookings" ON public.customer_bookings
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Customers can create bookings" ON public.customer_bookings
  FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can update their own bookings" ON public.customer_bookings
  FOR UPDATE USING (customer_id = auth.uid());

CREATE POLICY "Organization members can view bookings" ON public.customer_bookings
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Organization admins can manage bookings" ON public.customer_bookings
  FOR ALL USING (organization_id = get_user_organization_id() AND is_organization_admin());

-- Create real-time location tracking table
CREATE TABLE public.booking_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.customer_bookings(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.profiles(id),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  heading DECIMAL(5, 2),
  speed DECIMAL(5, 2),
  status TEXT NOT NULL DEFAULT 'en_route',
  estimated_arrival TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for tracking
ALTER TABLE public.booking_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view tracking for their bookings" ON public.booking_tracking
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.customer_bookings cb 
    WHERE cb.id = booking_tracking.booking_id AND cb.customer_id = auth.uid()
  ));

CREATE POLICY "Drivers can update their tracking" ON public.booking_tracking
  FOR ALL USING (driver_id = auth.uid());

-- Create customer profiles table for non-auth customer data
CREATE TABLE public.customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'UK',
  preferred_payment_method TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  special_needs TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for customer profiles
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own customer profile" ON public.customer_profiles
  FOR ALL USING (user_id = auth.uid());

-- Create payment records table
CREATE TABLE public.payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.customer_bookings(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES auth.users(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'GBP',
  payment_method TEXT NOT NULL,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  refund_amount DECIMAL(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for payment records
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view their payment records" ON public.payment_records
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Organization admins can view payment records" ON public.payment_records
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.customer_bookings cb 
    WHERE cb.id = payment_records.booking_id 
    AND cb.organization_id = get_user_organization_id() 
    AND is_organization_admin()
  ));

-- Create driver location updates table for real-time tracking
CREATE TABLE public.driver_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  heading DECIMAL(5, 2),
  speed DECIMAL(5, 2),
  accuracy DECIMAL(5, 2),
  is_online BOOLEAN DEFAULT true,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for driver locations
ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can update their own location" ON public.driver_locations
  FOR ALL USING (driver_id = auth.uid());

CREATE POLICY "Organization can view driver locations" ON public.driver_locations
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = driver_locations.driver_id 
    AND p.organization_id = get_user_organization_id()
  ));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_customer_bookings_updated_at
    BEFORE UPDATE ON public.customer_bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_profiles_updated_at
    BEFORE UPDATE ON public.customer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_customer_bookings_customer_id ON public.customer_bookings(customer_id);
CREATE INDEX idx_customer_bookings_organization_id ON public.customer_bookings(organization_id);
CREATE INDEX idx_customer_bookings_status ON public.customer_bookings(status);
CREATE INDEX idx_customer_bookings_pickup_datetime ON public.customer_bookings(pickup_datetime);
CREATE INDEX idx_booking_tracking_booking_id ON public.booking_tracking(booking_id);
CREATE INDEX idx_driver_locations_driver_id ON public.driver_locations(driver_id);
CREATE INDEX idx_payment_records_booking_id ON public.payment_records(booking_id);