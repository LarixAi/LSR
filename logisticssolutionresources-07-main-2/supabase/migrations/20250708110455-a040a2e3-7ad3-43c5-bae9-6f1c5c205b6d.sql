-- Update RLS policies for app_settings to allow drivers to save their own settings
DROP POLICY IF EXISTS "Admin and council can update app settings" ON app_settings;
DROP POLICY IF EXISTS "Admin and council can view app settings" ON app_settings;

-- Create new policies that allow users to manage their own settings
CREATE POLICY "Users can view their own settings" 
ON app_settings 
FOR SELECT 
USING (
  -- Allow admins/council to view all settings
  (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'council')
  ))
  OR
  -- Allow users to view their own driver settings
  (id LIKE 'driver_%' AND id = 'driver_' || auth.uid()::text)
  OR
  -- Allow viewing global settings
  (id = 'global')
);

CREATE POLICY "Users can manage their own settings" 
ON app_settings 
FOR ALL 
USING (
  -- Allow admins/council to manage all settings
  (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'council')
  ))
  OR
  -- Allow users to manage their own driver settings
  (id LIKE 'driver_%' AND id = 'driver_' || auth.uid()::text)
)
WITH CHECK (
  -- Allow admins/council to manage all settings
  (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'council')
  ))
  OR
  -- Allow users to manage their own driver settings
  (id LIKE 'driver_%' AND id = 'driver_' || auth.uid()::text)
);