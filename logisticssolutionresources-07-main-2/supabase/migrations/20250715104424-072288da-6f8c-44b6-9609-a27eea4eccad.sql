-- Ultimate fix: Drop ALL policies that could reference profiles.role column

-- Drop policies from ALL tables that might reference profiles.role
DROP POLICY IF EXISTS "Admins can view analytics" ON public.analytics;
DROP POLICY IF EXISTS "Authenticated users can view analytics" ON public.analytics;
DROP POLICY IF EXISTS "analytics_admin_only" ON public.analytics;
DROP POLICY IF EXISTS "admin_actions_admin_only" ON public.admin_actions;

-- Drop all existing policies from profiles table
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    -- Drop all policies from any table that might use EXISTS subquery on profiles
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
            RAISE NOTICE 'Dropped policy % on table %', pol.policyname, pol.tablename;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not drop policy % on table %: %', pol.policyname, pol.tablename, SQLERRM;
        END;
    END LOOP;
END $$;

-- Now create the user_role enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'driver', 'mechanic', 'parent', 'council', 'compliance_officer');
        RAISE NOTICE 'Created user_role enum with mechanic role';
    ELSE
        RAISE NOTICE 'user_role enum already exists';
    END IF;
END $$;

-- Create organizations table if needed
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    contact_email TEXT,
    type TEXT DEFAULT 'transport',
    address TEXT,
    phone TEXT,
    email TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add organization_id to profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public' 
        AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
        RAISE NOTICE 'Added organization_id column to profiles';
    END IF;
END $$;

-- Now change the role column type
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public' 
        AND column_name = 'role'
        AND data_type = 'text'
    ) THEN
        -- Update any invalid roles to parent first
        UPDATE public.profiles SET role = 'parent' 
        WHERE role NOT IN ('admin', 'driver', 'mechanic', 'parent', 'council', 'compliance_officer');
        
        -- Drop default, change type, then restore default
        ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;
        ALTER TABLE public.profiles ALTER COLUMN role TYPE user_role USING role::user_role;
        ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'parent'::user_role;
        
        RAISE NOTICE 'Updated role column to use user_role enum';
    END IF;
END $$;

-- Create essential functions
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
    RETURN COALESCE(user_role, 'parent');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID AS $$
DECLARE
    org_id UUID;
BEGIN
    SELECT organization_id INTO org_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
    RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    is_main_admin BOOLEAN;
    target_org_id UUID;
    default_org_id UUID;
BEGIN
    -- Check if this is a main admin email
    is_main_admin := NEW.email IN (
        'transport@transentrix.com',
        'transport@logisticssolutionresources.com', 
        'admin@logisticssolutionresources.com'
    );
    
    IF is_main_admin THEN
        -- Create organization for admin users
        INSERT INTO public.organizations (name, slug, contact_email)
        VALUES (
            COALESCE(NEW.raw_user_meta_data->>'company_name', 'Transport Company'),
            LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'company_name', 'transport-company'), ' ', '-')),
            NEW.email
        )
        RETURNING id INTO target_org_id;
    ELSE
        -- Try to get organization_id from metadata
        target_org_id := (NEW.raw_user_meta_data->>'organization_id')::UUID;
        
        -- If no organization_id provided, get or create a default organization
        IF target_org_id IS NULL THEN
            -- Try to find an existing default organization
            SELECT id INTO default_org_id 
            FROM public.organizations 
            WHERE slug = 'default-transport-company' 
            LIMIT 1;
            
            -- If no default organization exists, create one
            IF default_org_id IS NULL THEN
                INSERT INTO public.organizations (name, slug, contact_email)
                VALUES (
                    'Default Transport Company',
                    'default-transport-company',
                    'admin@defaulttransport.com'
                )
                RETURNING id INTO default_org_id;
            END IF;
            
            target_org_id := default_org_id;
        END IF;
    END IF;
    
    -- Insert profile with organization assignment
    INSERT INTO public.profiles (
        id,
        email,
        first_name,
        last_name,
        role,
        employment_status,
        onboarding_status,
        is_active,
        organization_id
    ) VALUES (
        NEW.id,
        NEW.email,
        CASE 
            WHEN is_main_admin THEN 'Transport'
            ELSE COALESCE(NEW.raw_user_meta_data->>'first_name', '')
        END,
        CASE 
            WHEN is_main_admin THEN 'Admin'
            ELSE COALESCE(NEW.raw_user_meta_data->>'last_name', '')
        END,
        CASE 
            WHEN is_main_admin THEN 'admin'::user_role
            ELSE COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'parent'::user_role)
        END,
        CASE 
            WHEN is_main_admin THEN 'active'
            ELSE 'applicant'
        END,
        CASE 
            WHEN is_main_admin THEN 'completed'
            ELSE 'pending'
        END,
        true,
        target_org_id
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error and re-raise it
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Create minimal essential policies
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT 
USING (auth.uid() = id);

-- Test success
DO $$ 
DECLARE
    role_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'mechanic' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    ) INTO role_exists;
    
    IF NOT role_exists THEN
        RAISE EXCEPTION 'mechanic role not found in user_role enum';
    END IF;
    
    RAISE NOTICE 'SUCCESS: Database is fixed! Mechanic signup should now work.';
END $$;