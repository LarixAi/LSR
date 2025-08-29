-- Create license_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.license_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add license_category_id to driver_licenses table
ALTER TABLE public.driver_licenses 
ADD COLUMN IF NOT EXISTS license_category_id UUID REFERENCES public.license_categories(id);

-- Create foreign key constraint
ALTER TABLE public.driver_licenses
DROP CONSTRAINT IF EXISTS fk_driver_licenses_category;

ALTER TABLE public.driver_licenses
ADD CONSTRAINT fk_driver_licenses_category 
FOREIGN KEY (license_category_id) REFERENCES public.license_categories(id);

-- Insert default license categories
INSERT INTO public.license_categories (name, code, description) VALUES
  ('Class A', 'A', 'Heavy trucks, truck-trailer combinations'),
  ('Class B', 'B', 'Large trucks, buses, segmented buses'),
  ('Class C', 'C', 'Regular vehicles, small trucks'),
  ('Class D1', 'D1', 'Minibuses up to 16 seats'),
  ('Class D', 'D', 'Buses over 16 seats'),
  ('Class C1', 'C1', 'Medium-sized vehicles 3.5-7.5 tonnes')
ON CONFLICT (code) DO NOTHING;

-- Set up RLS for license_categories
ALTER TABLE public.license_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "license_categories_org_access" ON public.license_categories
FOR ALL USING (true); -- License categories are global reference data

-- Update existing driver_licenses to have a default category
UPDATE public.driver_licenses 
SET license_category_id = (
  SELECT id FROM public.license_categories WHERE code = 'C' LIMIT 1
)
WHERE license_category_id IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_driver_licenses_category_id ON public.driver_licenses(license_category_id);
CREATE INDEX IF NOT EXISTS idx_license_categories_code ON public.license_categories(code);
CREATE INDEX IF NOT EXISTS idx_license_categories_active ON public.license_categories(is_active) WHERE is_active = true;