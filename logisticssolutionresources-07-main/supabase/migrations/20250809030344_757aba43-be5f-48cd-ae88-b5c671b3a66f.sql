-- Create license_categories table and seed data
CREATE TABLE IF NOT EXISTS public.license_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.license_categories ENABLE ROW LEVEL SECURITY;

-- Policies: authenticated users can view; admins can manage
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'license_categories' AND policyname = 'Users can view license categories'
  ) THEN
    CREATE POLICY "Users can view license categories"
    ON public.license_categories
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'license_categories' AND policyname = 'Admins can manage license categories'
  ) THEN
    CREATE POLICY "Admins can manage license categories"
    ON public.license_categories
    FOR ALL
    TO authenticated
    USING (is_admin_user(auth.uid()))
    WITH CHECK (is_admin_user(auth.uid()));
  END IF;
END $$;

-- Seed common categories if table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.license_categories) THEN
    INSERT INTO public.license_categories (code, name, description) VALUES
      ('B',   'Car', 'Standard passenger cars'),
      ('C1',  'Medium Goods Vehicle', '3.5t-7.5t vehicles'),
      ('C',   'Large Goods Vehicle', 'Over 7.5t vehicles'),
      ('C1E', 'Medium Goods + Trailer', 'C1 with trailer'),
      ('CE',  'Large Goods + Trailer', 'Articulated/with trailer'),
      ('D1',  'Minibus', 'Up to 16 passenger seats'),
      ('D',   'Bus/Coach', 'More than 16 passenger seats'),
      ('D1E', 'Minibus + Trailer', 'D1 with trailer'),
      ('DE',  'Bus/Coach + Trailer', 'D with trailer');
  END IF;
END $$;