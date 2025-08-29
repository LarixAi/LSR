-- Create app_settings table if not exists
CREATE TABLE IF NOT EXISTS public.app_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  settings JSONB NOT NULL DEFAULT '{}',
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on app_settings table
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin and council can view app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admin and council can update app settings" ON public.app_settings;

-- Create policies for app_settings - only admins and council members can access
CREATE POLICY "Admin and council can view app settings" ON public.app_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'council')
    )
  );

CREATE POLICY "Admin and council can update app settings" ON public.app_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'council')
    )
  );

-- Insert default settings row if not exists
INSERT INTO public.app_settings (id, settings) 
VALUES ('global', '{}')
ON CONFLICT (id) DO NOTHING;