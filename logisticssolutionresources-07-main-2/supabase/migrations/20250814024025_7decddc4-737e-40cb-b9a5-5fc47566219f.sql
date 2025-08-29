-- Update the transport@nationalbusgroup.co.uk user role to admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'transport@nationalbusgroup.co.uk';