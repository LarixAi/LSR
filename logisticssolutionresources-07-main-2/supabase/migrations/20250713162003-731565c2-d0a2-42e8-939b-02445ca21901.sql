-- Drop the conflicting policy and recreate it
DROP POLICY IF EXISTS "Users can view their own permissions" ON public.user_permissions;

-- Create RLS policy for user_permissions
CREATE POLICY "Users can view their own permissions" 
ON public.user_permissions 
FOR SELECT 
USING (user_id = auth.uid());