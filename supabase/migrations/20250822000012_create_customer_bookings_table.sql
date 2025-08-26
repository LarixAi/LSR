-- Create customer_bookings table for booking management
CREATE TABLE IF NOT EXISTS public.customer_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  booking_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_id UUID REFERENCES public.profiles(id),
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('school_transport', 'medical_transport', 'corporate_transport', 'event_transport', 'airport_transfer', 'charter', 'other')),
  passengers INTEGER,
  wheelchair_required BOOLEAN DEFAULT false,
  wheelchair_type TEXT,
  special_requirements TEXT,
  booking_date DATE NOT NULL,
  pickup_time TIME,
  dropoff_time TIME,
  estimated_duration_minutes INTEGER,
  estimated_distance_km DECIMAL(8,2),
  estimated_price DECIMAL(10,2),
  final_price DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partially_paid', 'refunded')),
  payment_method TEXT,
  assigned_vehicle_id UUID REFERENCES public.vehicles(id),
  assigned_driver_id UUID REFERENCES public.profiles(id),
  actual_pickup_time TIMESTAMPTZ,
  actual_dropoff_time TIMESTAMPTZ,
  actual_duration_minutes INTEGER,
  actual_distance_km DECIMAL(8,2),
  driver_notes TEXT,
  customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
  customer_feedback TEXT,
  cancellation_reason TEXT,
  cancellation_date TIMESTAMPTZ,
  cancelled_by UUID REFERENCES public.profiles(id),
  refund_amount DECIMAL(10,2),
  refund_date TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_bookings_organization_id ON public.customer_bookings(organization_id);
CREATE INDEX IF NOT EXISTS idx_customer_bookings_booking_number ON public.customer_bookings(booking_number);
CREATE INDEX IF NOT EXISTS idx_customer_bookings_customer_email ON public.customer_bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_customer_bookings_customer_id ON public.customer_bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_bookings_service_type ON public.customer_bookings(service_type);
CREATE INDEX IF NOT EXISTS idx_customer_bookings_status ON public.customer_bookings(status);
CREATE INDEX IF NOT EXISTS idx_customer_bookings_payment_status ON public.customer_bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_customer_bookings_booking_date ON public.customer_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_customer_bookings_assigned_vehicle_id ON public.customer_bookings(assigned_vehicle_id);
CREATE INDEX IF NOT EXISTS idx_customer_bookings_assigned_driver_id ON public.customer_bookings(assigned_driver_id);
CREATE INDEX IF NOT EXISTS idx_customer_bookings_created_at ON public.customer_bookings(created_at);

-- Enable Row Level Security
ALTER TABLE public.customer_bookings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view customer bookings from their organization" ON public.customer_bookings
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert customer bookings for their organization" ON public.customer_bookings
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update customer bookings from their organization" ON public.customer_bookings
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete customer bookings from their organization" ON public.customer_bookings
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Create updated_at trigger
CREATE TRIGGER handle_customer_bookings_updated_at
  BEFORE UPDATE ON public.customer_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
