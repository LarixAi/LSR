-- =============================================================================
-- SIMPLE DATA ISOLATION FIX - IMMEDIATE SECURITY PATCH
-- This fixes data isolation for all user roles without complex migrations
-- =============================================================================

-- Step 1: Create basic security functions
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION is_admin_or_council()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role IN ('admin', 'council', 'super_admin') FROM public.profiles WHERE id = auth.uid();
$$;

-- Step 2: FIX PROFILES TABLE (CRITICAL)
-- Drop all existing policies on profiles table
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_record.policyname);
    END LOOP;
    RAISE NOTICE 'Dropped all existing policies on profiles table';
END $$;

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create SECURE policies for profiles
CREATE POLICY "profiles_org_isolation" ON public.profiles
FOR SELECT USING (
  organization_id = get_user_organization_id() OR id = auth.uid()
);

CREATE POLICY "profiles_own_update" ON public.profiles
FOR UPDATE USING (
  id = auth.uid() OR 
  (organization_id = get_user_organization_id() AND is_admin_or_council())
);

CREATE POLICY "profiles_admin_create" ON public.profiles
FOR INSERT WITH CHECK (
  organization_id = get_user_organization_id() AND is_admin_or_council()
);

CREATE POLICY "profiles_admin_delete" ON public.profiles
FOR DELETE USING (
  organization_id = get_user_organization_id() AND is_admin_or_council()
);

-- Step 3: FIX VEHICLES TABLE
DROP POLICY IF EXISTS "vehicles_org_isolation" ON public.vehicles;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vehicles_org_isolation" ON public.vehicles
FOR ALL USING (
  organization_id = get_user_organization_id()
);

-- Step 4: FIX ALL OTHER BUSINESS TABLES (if they exist)
-- Jobs table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'jobs') THEN
        DROP POLICY IF EXISTS "jobs_org_isolation" ON public.jobs;
        ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "jobs_org_isolation" ON public.jobs
        FOR ALL USING (
          organization_id = get_user_organization_id()
        );
    END IF;
END $$;

-- Routes table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'routes') THEN
        DROP POLICY IF EXISTS "routes_org_isolation" ON public.routes;
        ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "routes_org_isolation" ON public.routes
        FOR ALL USING (
          organization_id = get_user_organization_id()
        );
    END IF;
END $$;

-- Incidents table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'incidents') THEN
        DROP POLICY IF EXISTS "incidents_org_isolation" ON public.incidents;
        ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "incidents_org_isolation" ON public.incidents
        FOR ALL USING (
          organization_id = get_user_organization_id()
        );
    END IF;
END $$;

-- Documents table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'documents') THEN
        DROP POLICY IF EXISTS "documents_org_isolation" ON public.documents;
        ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "documents_org_isolation" ON public.documents
        FOR ALL USING (
          organization_id = get_user_organization_id()
        );
    END IF;
END $$;

-- Step 5: CREATE AUDIT LOGGING
CREATE TABLE IF NOT EXISTS public.security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_admin_access" ON public.security_audit_log
FOR SELECT USING (
  organization_id = get_user_organization_id() AND is_admin_or_council()
);

-- Step 6: LOG THE SECURITY FIX
DO $$ 
BEGIN
    INSERT INTO public.security_audit_log (
        user_id,
        organization_id,
        action,
        table_name
    ) VALUES (
        auth.uid(),
        get_user_organization_id(),
        'SIMPLE_SECURITY_FIX_APPLIED',
        'ALL_TABLES'
    );
    
    RAISE NOTICE 'SIMPLE DATA ISOLATION FIX APPLIED SUCCESSFULLY';
    RAISE NOTICE 'All organizations are now properly isolated';
END $$;






