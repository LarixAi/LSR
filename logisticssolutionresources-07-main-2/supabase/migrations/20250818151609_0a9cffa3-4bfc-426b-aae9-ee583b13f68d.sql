-- CRITICAL SECURITY FIXES: Fix remaining issues step by step

-- First, fix the most critical issue: profiles table is still publicly readable
-- Drop ALL existing policies on profiles table to start fresh
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_record.policyname);
    END LOOP;
END $$;

-- Create secure RLS policies for profiles table (CRITICAL)
CREATE POLICY "Users can view their own profile and org profiles" 
ON public.profiles FOR SELECT 
USING (
  id = auth.uid() OR 
  (organization_id IS NOT NULL AND organization_id = (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1
  ))
);

CREATE POLICY "Users can update their own profile only" 
ON public.profiles FOR UPDATE 
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can manage profiles in their organization" 
ON public.profiles FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'council', 'compliance_officer')
    AND organization_id = profiles.organization_id
  )
);

-- Fix vehicles table if it exists (drop all policies first)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vehicles') THEN
        -- Enable RLS
        EXECUTE 'ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY';
        
        -- Drop all existing policies
        FOR policy_record IN 
            SELECT policyname 
            FROM pg_policies 
            WHERE schemaname = 'public' AND tablename = 'vehicles'
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.vehicles', policy_record.policyname);
        END LOOP;
        
        -- Create secure policy
        EXECUTE 'CREATE POLICY "Organization vehicles access" 
        ON public.vehicles FOR ALL 
        USING (
          organization_id = (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1
          )
        )';
    END IF;
END $$;

-- Fix routes table if it exists (drop all policies first)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'routes') THEN
        -- Enable RLS
        EXECUTE 'ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY';
        
        -- Drop all existing policies
        FOR policy_record IN 
            SELECT policyname 
            FROM pg_policies 
            WHERE schemaname = 'public' AND tablename = 'routes'
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.routes', policy_record.policyname);
        END LOOP;
        
        -- Create secure policy
        EXECUTE 'CREATE POLICY "Organization routes access" 
        ON public.routes FOR ALL 
        USING (
          organization_id = (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1
          )
        )';
    END IF;
END $$;

-- Fix schools table if it exists (drop all policies first)  
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'schools') THEN
        -- Enable RLS
        EXECUTE 'ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY';
        
        -- Drop all existing policies
        FOR policy_record IN 
            SELECT policyname 
            FROM pg_policies 
            WHERE schemaname = 'public' AND tablename = 'schools'
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.schools', policy_record.policyname);
        END LOOP;
        
        -- Create secure policy (check if organization_id column exists)
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'schools' 
          AND column_name = 'organization_id'
        ) THEN
          EXECUTE 'CREATE POLICY "Organization schools access" 
          ON public.schools FOR ALL 
          USING (
            organization_id = (
              SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1
            )
          )';
        ELSE
          -- If no organization_id, restrict to authenticated users only
          EXECUTE 'CREATE POLICY "Authenticated users can access schools" 
          ON public.schools FOR SELECT 
          USING (auth.role() = ''authenticated'')';
        END IF;
    END IF;
END $$;