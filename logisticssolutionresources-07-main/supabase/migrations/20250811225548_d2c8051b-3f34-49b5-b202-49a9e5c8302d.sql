-- Fix recursive RLS policy on profiles causing 500 errors
DO $$BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='profiles' AND policyname='Admins can manage profiles'
  ) THEN
    DROP POLICY "Admins can manage profiles" ON public.profiles;
  END IF;
END$$;

-- Recreate admin policy using security definer helpers to avoid recursion
CREATE POLICY "Admins can manage profiles"
ON public.profiles
FOR ALL
USING (
  is_admin_user(auth.uid())
  AND organization_id = get_current_user_organization()
)
WITH CHECK (
  is_admin_user(auth.uid())
  AND organization_id = get_current_user_organization()
);
