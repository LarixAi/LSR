-- Promote transportbusgroup@gmail.com to admin
-- Ensure profile exists and set role
INSERT INTO public.profiles (id, user_id, email, role)
VALUES (
  'd81ac385-bc1d-43dd-bb1e-25b0608ff037',
  'd81ac385-bc1d-43dd-bb1e-25b0608ff037',
  'transportbusgroup@gmail.com',
  'admin'
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin',
    email = EXCLUDED.email;

-- Optionally ensure active flag is true
UPDATE public.profiles
SET is_active = true
WHERE id = 'd81ac385-bc1d-43dd-bb1e-25b0608ff037';