-- Create app_settings table for storing global application settings
CREATE TABLE IF NOT EXISTS public.app_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admins and council members to read settings
CREATE POLICY "Admins and council can read settings"
  ON public.app_settings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'council', 'super_admin')
    )
  );

-- Create policy for admins and council members to update settings
CREATE POLICY "Admins and council can update settings"
  ON public.app_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'council')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'council')
    )
  );

-- Create policy for admins and council members to insert settings
CREATE POLICY "Admins and council can insert settings"
  ON public.app_settings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'council')
    )
  );

-- Insert default settings row if it doesn't exist
INSERT INTO public.app_settings (id, settings)
VALUES ('global', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;