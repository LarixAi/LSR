
-- Create license_categories table for different types of licenses
CREATE TABLE IF NOT EXISTS public.license_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  description text,
  renewal_period_months integer DEFAULT 12,
  grace_period_days integer DEFAULT 30,
  is_mandatory boolean DEFAULT true,
  organization_id uuid REFERENCES public.organizations(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create license_renewals table to track renewal history
CREATE TABLE IF NOT EXISTS public.license_renewals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  license_id uuid REFERENCES public.driver_licenses(id) ON DELETE CASCADE,
  previous_expiry_date date NOT NULL,
  new_expiry_date date NOT NULL,
  renewal_date date DEFAULT CURRENT_DATE,
  renewed_by uuid REFERENCES auth.users(id),
  renewal_cost numeric,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create license_violations table to track license-related violations
CREATE TABLE IF NOT EXISTS public.license_violations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  license_id uuid REFERENCES public.driver_licenses(id) ON DELETE CASCADE,
  violation_date date NOT NULL,
  violation_type text NOT NULL,
  violation_code text,
  points_deducted integer DEFAULT 0,
  fine_amount numeric,
  status text DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'disputed')),
  resolution_date date,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.license_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_violations ENABLE ROW LEVEL SECURITY;

-- RLS policies for license_categories
CREATE POLICY "Users can view organization license categories" 
  ON public.license_categories 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations uo 
      WHERE uo.user_id = auth.uid() 
      AND uo.organization_id = license_categories.organization_id
      AND uo.is_active = true
    )
  );

CREATE POLICY "Admins can manage license categories" 
  ON public.license_categories 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'council', 'compliance_officer')
    )
  );

-- RLS policies for license_renewals
CREATE POLICY "Users can view their license renewals" 
  ON public.license_renewals 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.driver_licenses dl 
      WHERE dl.id = license_renewals.license_id 
      AND dl.driver_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'council', 'compliance_officer')
    )
  );

CREATE POLICY "Admins can manage license renewals" 
  ON public.license_renewals 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'council', 'compliance_officer')
    )
  );

-- RLS policies for license_violations
CREATE POLICY "Users can view their license violations" 
  ON public.license_violations 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.driver_licenses dl 
      WHERE dl.id = license_violations.license_id 
      AND dl.driver_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'council', 'compliance_officer')
    )
  );

CREATE POLICY "Admins can manage license violations" 
  ON public.license_violations 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'council', 'compliance_officer')
    )
  );

-- Insert default license categories
INSERT INTO public.license_categories (name, code, description, renewal_period_months, grace_period_days) VALUES
('Commercial Driver License', 'CDL', 'Commercial Driver License for commercial vehicles', 60, 30),
('Passenger Vehicle License', 'PVL', 'License for passenger transport vehicles', 36, 30),
('Heavy Vehicle License', 'HVL', 'License for heavy commercial vehicles', 60, 30),
('Motorcycle License', 'MCL', 'License for motorcycle operation', 36, 30),
('Bus Driver License', 'BDL', 'Specialized license for bus drivers', 60, 30);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_license_renewals_license_id ON public.license_renewals(license_id);
CREATE INDEX IF NOT EXISTS idx_license_violations_license_id ON public.license_violations(license_id);
CREATE INDEX IF NOT EXISTS idx_driver_licenses_expiry ON public.driver_licenses(expiry_date);
CREATE INDEX IF NOT EXISTS idx_license_categories_code ON public.license_categories(code);

-- Create function to calculate license status
CREATE OR REPLACE FUNCTION public.get_license_status(expiry_date date, grace_period_days integer DEFAULT 30)
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT CASE
    WHEN expiry_date < CURRENT_DATE - INTERVAL '1 day' * grace_period_days THEN 'expired'
    WHEN expiry_date < CURRENT_DATE THEN 'grace_period'
    WHEN expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
    ELSE 'valid'
  END;
$$;
