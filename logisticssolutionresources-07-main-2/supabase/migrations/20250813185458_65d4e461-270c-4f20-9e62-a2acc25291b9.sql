-- Clean up unsafe public policies on vehicles table that allow unrestricted access
-- This completes the security fix for the vehicle data vulnerability

-- Drop all unsafe policies that allow public access to vehicles
DROP POLICY IF EXISTS "vehicles_select_safe" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_insert_safe" ON public.vehicles; 
DROP POLICY IF EXISTS "vehicles_update_safe" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_auto_org_access" ON public.vehicles;

-- Drop duplicate policies with weaker security
DROP POLICY IF EXISTS "Admins can manage vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Admins can manage org vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can view org vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can view their organization's vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Org members can view vehicles" ON public.vehicles;

-- Verify RLS is enabled
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Ensure we only have the secure policies we created:
-- 1. vehicles_org_members_select (authenticated users can view org vehicles)
-- 2. vehicles_org_admins_manage (admins can manage org vehicles) 
-- 3. vehicles_service_role_access (service role access)
-- 4. vehicles_assigned_drivers_view (drivers can view assigned vehicles)

-- These should already exist from the previous migration, but let's make sure
-- they exist and are properly configured

DO $$
BEGIN
    -- Recreate the secure SELECT policy for organization members if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'vehicles' 
        AND policyname = 'vehicles_org_members_select'
        AND roles = '{authenticated}'
    ) THEN
        DROP POLICY IF EXISTS "vehicles_org_members_select" ON public.vehicles;
        CREATE POLICY "vehicles_org_members_select" 
        ON public.vehicles 
        FOR SELECT
        TO authenticated
        USING (
          organization_id IN (
            SELECT profiles.organization_id 
            FROM public.profiles 
            WHERE profiles.id = auth.uid()
          )
        );
    END IF;

    -- Recreate the secure management policy for admins if it doesn't exist properly
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'vehicles' 
        AND policyname = 'vehicles_org_admins_manage'
        AND roles = '{authenticated}'
        AND cmd = 'ALL'
    ) THEN
        DROP POLICY IF EXISTS "vehicles_org_admins_manage" ON public.vehicles;
        CREATE POLICY "vehicles_org_admins_manage" 
        ON public.vehicles 
        FOR ALL
        TO authenticated
        USING (
          organization_id IN (
            SELECT profiles.organization_id 
            FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'council', 'super_admin')
          )
        )
        WITH CHECK (
          organization_id IN (
            SELECT profiles.organization_id 
            FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'council', 'super_admin')
          )
        );
    END IF;
END
$$;