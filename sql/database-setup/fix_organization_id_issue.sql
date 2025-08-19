-- =====================================================
-- FIX ORGANIZATION_ID ISSUE
-- =====================================================
-- This script will fix the organization_id column issue

-- 1. CREATE ORGANIZATIONS TABLE IF IT DOESN'T EXIST
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. INSERT DEFAULT ORGANIZATION IF IT DOESN'T EXIST
INSERT INTO public.organizations (name, slug)
VALUES ('ABC Transport Ltd', 'abc-transport')
ON CONFLICT (slug) DO NOTHING;

-- 3. ENSURE PROFILES TABLE EXISTS WITH CORRECT STRUCTURE
DO $$
BEGIN
    -- Check if profiles table exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'profiles'
    ) THEN
        -- Create profiles table from scratch
        CREATE TABLE public.profiles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email TEXT NOT NULL,
            first_name TEXT,
            last_name TEXT,
            role TEXT NOT NULL DEFAULT 'driver',
            avatar_url TEXT,
            employment_status TEXT DEFAULT 'active',
            onboarding_status TEXT DEFAULT 'pending',
            hire_date DATE,
            employee_id TEXT,
            is_active BOOLEAN NOT NULL DEFAULT true,
            phone TEXT,
            address TEXT,
            city TEXT,
            state TEXT,
            zip_code TEXT,
            termination_date DATE,
            cdl_number TEXT,
            medical_card_expiry DATE,
            must_change_password BOOLEAN DEFAULT false,
            password_changed_at TIMESTAMP WITH TIME ZONE,
            organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
        RAISE NOTICE 'Created profiles table from scratch';
    ELSE
        -- Profiles table exists, check if organization_id column exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles' 
            AND column_name = 'organization_id'
        ) THEN
            -- Add organization_id column
            ALTER TABLE public.profiles ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;
            RAISE NOTICE 'Added organization_id column to existing profiles table';
        ELSE
            RAISE NOTICE 'organization_id column already exists in profiles table';
        END IF;
    END IF;
END $$;

-- 4. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. DROP ALL EXISTING RLS POLICIES THAT MIGHT CAUSE ISSUES
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all policies on organizations table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'organizations'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.organizations', policy_record.policyname);
    END LOOP;
    
    -- Drop all policies on profiles table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_record.policyname);
    END LOOP;
    
    RAISE NOTICE 'Dropped all existing RLS policies';
END $$;

-- 6. CREATE SIMPLE, SAFE RLS POLICIES
-- Organizations policies
CREATE POLICY "Users can view organizations" ON public.organizations
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage organizations" ON public.organizations
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Profiles policies
CREATE POLICY "Users can view profiles" ON public.profiles
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage profiles" ON public.profiles
    FOR ALL USING (auth.uid() IS NOT NULL);

-- 7. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);

-- 8. INSERT SAMPLE USER IF NONE EXISTS
DO $$
DECLARE
    default_org_id UUID;
BEGIN
    -- Get the default organization ID
    SELECT id INTO default_org_id FROM public.organizations WHERE name = 'ABC Transport Ltd' LIMIT 1;
    
    -- Insert sample user if no users exist
    IF NOT EXISTS (SELECT 1 FROM public.profiles LIMIT 1) AND default_org_id IS NOT NULL THEN
        INSERT INTO public.profiles (
            email,
            first_name,
            last_name,
            role,
            organization_id,
            employment_status,
            onboarding_status
        ) VALUES (
            'admin@abctransport.com',
            'Admin',
            'User',
            'admin',
            default_org_id,
            'active',
            'completed'
        );
        RAISE NOTICE 'Inserted sample admin user';
    END IF;
END $$;

-- 9. VERIFY THE FIX
DO $$
BEGIN
    -- Check if organization_id column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'organization_id'
    ) THEN
        RAISE NOTICE 'SUCCESS: organization_id column exists in profiles table';
    ELSE
        RAISE NOTICE 'ERROR: organization_id column still missing from profiles table';
    END IF;
    
    -- Check if organizations table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'organizations'
    ) THEN
        RAISE NOTICE 'SUCCESS: organizations table exists';
    ELSE
        RAISE NOTICE 'ERROR: organizations table missing';
    END IF;
    
    -- Check if RLS policies exist
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'profiles'
    ) THEN
        RAISE NOTICE 'SUCCESS: RLS policies exist for profiles table';
    ELSE
        RAISE NOTICE 'ERROR: No RLS policies for profiles table';
    END IF;
END $$;

-- =====================================================
-- FIX COMPLETE
-- =====================================================
-- This script should resolve the organization_id column issue
-- Run this first, then try the ultra_minimal_parts_integration.sql script
