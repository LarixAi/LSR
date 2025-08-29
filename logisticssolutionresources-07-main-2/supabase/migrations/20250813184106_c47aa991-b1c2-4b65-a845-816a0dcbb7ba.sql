-- Final cleanup of profiles table security policies
-- Remove any remaining unsafe policies

-- Drop policies that may still exist and allow public access
DROP POLICY IF EXISTS "profiles_select_safe" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_safe" ON public.profiles;  
DROP POLICY IF EXISTS "profiles_insert_safe" ON public.profiles;

-- Only create policies that don't exist yet
DO $$
BEGIN
    -- Create secure admin access policy if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'secure_admin_org_access'
    ) THEN
        CREATE POLICY "secure_admin_org_access" 
        ON public.profiles 
        FOR ALL
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles admin_profile 
            WHERE admin_profile.id = auth.uid() 
            AND admin_profile.role IN ('admin', 'council', 'super_admin')
            AND admin_profile.organization_id = profiles.organization_id
          )
        );
    END IF;

    -- Create service role policy if it doesn't exist  
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'service_role_profiles_access'
    ) THEN
        CREATE POLICY "service_role_profiles_access" 
        ON public.profiles 
        FOR ALL
        TO service_role
        USING (true);
    END IF;
END
$$;