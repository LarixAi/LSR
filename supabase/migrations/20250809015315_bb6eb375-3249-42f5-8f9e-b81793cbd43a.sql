-- Expand admin function to include council
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.user_id = is_admin_user.user_id 
        AND role IN ('admin', 'council')
    );
END;
$function$;

-- Allow council to manage jobs like admins
DROP POLICY IF EXISTS "Council can manage jobs" ON public.jobs;
CREATE POLICY "Council can manage jobs"
ON public.jobs
FOR ALL
USING (
  auth.uid() IN (
    SELECT p.user_id FROM public.profiles p WHERE p.role = 'council'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT p.user_id FROM public.profiles p WHERE p.role = 'council'
  )
);

-- Allow council to manage incidents like admins
DROP POLICY IF EXISTS "Council can manage incidents" ON public.incidents;
CREATE POLICY "Council can manage incidents"
ON public.incidents
FOR ALL
USING (
  auth.uid() IN (
    SELECT p.user_id FROM public.profiles p WHERE p.role = 'council'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT p.user_id FROM public.profiles p WHERE p.role = 'council'
  )
);
