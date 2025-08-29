-- Create profile for existing signed-in user
INSERT INTO public.profiles (id, email, role) 
SELECT 
  au.id,
  au.email,
  'admin' as role
FROM auth.users au
WHERE au.id = '554293d5-98f4-4526-8597-db1352f7026e'
AND NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
);