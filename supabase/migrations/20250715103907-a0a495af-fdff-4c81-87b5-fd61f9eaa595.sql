-- Create the user_role enum first if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'driver', 'mechanic', 'parent', 'council', 'compliance_officer');
        RAISE NOTICE 'Created user_role enum';
    ELSE
        RAISE NOTICE 'user_role enum already exists';
    END IF;
END $$;

-- Ensure organizations table exists
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

-- Enable RLS on organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Ensure profiles table has organization_id column and correct role type
DO $$
BEGIN
    -- Add organization_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public' 
        AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
        RAISE NOTICE 'Added organization_id column to profiles';
    END IF;
    
    -- Update role column to use user_role enum
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public' 
        AND column_name = 'role'
        AND data_type = 'text'
    ) THEN
        -- First update any existing data to valid enum values
        UPDATE public.profiles SET role = 'parent' WHERE role NOT IN ('admin', 'driver', 'mechanic', 'parent', 'council', 'compliance_officer');
        
        -- Change column type
        ALTER TABLE public.profiles ALTER COLUMN role TYPE user_role USING role::user_role;
        RAISE NOTICE 'Updated role column to use user_role enum';
    END IF;
END $$;

-- Recreate the handle_new_user function with proper error handling
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

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure RLS is enabled and policies are correct
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Organization members can view profiles" ON public.profiles;

-- Allow users to insert their own profile (needed for the trigger)
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow users to view their own profile and admins to view all
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT 
USING (
  auth.uid() = id 
  OR EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role IN ('admin', 'council')
  )
);

-- Create organization access policy
CREATE POLICY "Organization members can view profiles"
ON public.profiles
FOR SELECT
USING (
  organization_id = get_user_organization_id() 
  OR EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role IN ('admin', 'council')
  )
);

-- Test the enum exists and contains mechanic
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
    
    RAISE NOTICE 'SUCCESS: mechanic role exists in user_role enum';
END $$;