-- Create customer_profiles table for customer management
CREATE TABLE IF NOT EXISTS public.customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  customer_number TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  date_of_birth DATE,
  address_line_1 TEXT,
  address_line_2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'United Kingdom',
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  customer_type TEXT DEFAULT 'individual' CHECK (customer_type IN ('individual', 'corporate', 'school', 'healthcare', 'government')),
  company_name TEXT,
  company_registration_number TEXT,
  vat_number TEXT,
  preferred_contact_method TEXT CHECK (preferred_contact_method IN ('email', 'phone', 'sms', 'post')),
  preferred_language TEXT DEFAULT 'English',
  accessibility_requirements TEXT[],
  medical_conditions TEXT[],
  allergies TEXT[],
  dietary_restrictions TEXT[],
  loyalty_points INTEGER DEFAULT 0,
  loyalty_tier TEXT DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  total_bookings INTEGER DEFAULT 0,
  total_spent DECIMAL(12,2) DEFAULT 0,
  average_rating DECIMAL(3,2),
  last_booking_date DATE,
  marketing_consent BOOLEAN DEFAULT false,
  marketing_consent_date TIMESTAMPTZ,
  data_protection_consent BOOLEAN DEFAULT false,
  data_protection_consent_date TIMESTAMPTZ,
  terms_accepted BOOLEAN DEFAULT false,
  terms_accepted_date TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'blacklisted')),
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_profiles_organization_id ON public.customer_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_customer_number ON public.customer_profiles(customer_number);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_email ON public.customer_profiles(email);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_phone ON public.customer_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_customer_type ON public.customer_profiles(customer_type);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_company_name ON public.customer_profiles(company_name);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_loyalty_tier ON public.customer_profiles(loyalty_tier);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_status ON public.customer_profiles(status);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_last_booking_date ON public.customer_profiles(last_booking_date);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_created_at ON public.customer_profiles(created_at);

-- Enable Row Level Security
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view customer profiles from their organization" ON public.customer_profiles
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert customer profiles for their organization" ON public.customer_profiles
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update customer profiles from their organization" ON public.customer_profiles
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete customer profiles from their organization" ON public.customer_profiles
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Create updated_at trigger
CREATE TRIGGER handle_customer_profiles_updated_at
  BEFORE UPDATE ON public.customer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
