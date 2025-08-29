-- Update transport@nationalbusgroup.co.uk to admin role
-- This user should be an admin, not a parent

UPDATE public.profiles 
SET 
    role = 'admin',
    updated_at = now()
WHERE email = 'transport@nationalbusgroup.co.uk';

-- Log the role change
INSERT INTO public.audit_logs (action, table_name, user_id, organization_id, new_values)
VALUES (
  'ROLE_CHANGE', 
  'profiles', 
  (SELECT id FROM public.profiles WHERE email = 'transport@nationalbusgroup.co.uk'),
  (SELECT organization_id FROM public.profiles WHERE email = 'transport@nationalbusgroup.co.uk'),
  '{"description": "Changed transport@nationalbusgroup.co.uk from parent to admin role", "old_role": "parent", "new_role": "admin"}'::jsonb
);