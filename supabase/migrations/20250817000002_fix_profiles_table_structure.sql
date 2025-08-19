-- Fix profiles table structure to properly reference auth.users
-- The recent migration broke the foreign key relationship

-- First, let's check if the profiles table exists and has the wrong structure
DO $$
BEGIN
    -- Check if the profiles table has the wrong primary key structure
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'id' 
        AND column_default LIKE '%gen_random_uuid%'
    ) THEN
        -- The table has the wrong structure, we need to fix it
        RAISE NOTICE 'Fixing profiles table structure...';
        
        -- Create a backup of existing data
        CREATE TABLE IF NOT EXISTS public.profiles_backup AS 
        SELECT * FROM public.profiles;
        
        -- Drop the existing profiles table
        DROP TABLE IF EXISTS public.profiles CASCADE;
        
        -- Recreate the profiles table with correct structure
        CREATE TABLE public.profiles (
            id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
            email TEXT NOT NULL,
            first_name TEXT,
            last_name TEXT,
            role TEXT NOT NULL DEFAULT 'parent',
            avatar_url TEXT,
            employment_status TEXT,
            onboarding_status TEXT,
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
            organization_id UUID,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
        
        -- Restore data from backup (only for users that exist in auth.users)
        INSERT INTO public.profiles (
            id, email, first_name, last_name, role, avatar_url, employment_status,
            onboarding_status, hire_date, employee_id, is_active, phone, address,
            city, state, zip_code, termination_date, cdl_number, medical_card_expiry,
            must_change_password, password_changed_at, organization_id, created_at, updated_at
        )
        SELECT 
            pb.id, pb.email, pb.first_name, pb.last_name, pb.role, pb.avatar_url, pb.employment_status,
            pb.onboarding_status, pb.hire_date, pb.employee_id, pb.is_active, pb.phone, pb.address,
            pb.city, pb.state, pb.zip_code, pb.termination_date, pb.cdl_number, pb.medical_card_expiry,
            pb.must_change_password, pb.password_changed_at, pb.organization_id, pb.created_at, pb.updated_at
        FROM public.profiles_backup pb
        INNER JOIN auth.users au ON pb.id = au.id;
        
        -- Drop the backup table
        DROP TABLE public.profiles_backup;
        
        RAISE NOTICE 'Profiles table structure fixed successfully';
    ELSE
        RAISE NOTICE 'Profiles table structure is already correct';
    END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create the correct RLS policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.profiles;

-- Policy 1: Users can access their own profile
DROP POLICY IF EXISTS "secure_users_own_profile_access" ON public.profiles;
CREATE POLICY "secure_users_own_profile_access" 
ON public.profiles 
FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 2: Service role access for system operations
DROP POLICY IF EXISTS "service_role_profiles_access" ON public.profiles;
CREATE POLICY "service_role_profiles_access" 
ON public.profiles 
FOR ALL
TO service_role
USING (true);

-- Policy 3: Allow authenticated users to create their own profile
DROP POLICY IF EXISTS "secure_profile_creation" ON public.profiles;
CREATE POLICY "secure_profile_creation" 
ON public.profiles 
FOR INSERT
TO authenticated  
WITH CHECK (auth.uid() = id);

-- Policy 4: Admin access using security definer function to avoid recursion
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid()
        AND raw_user_meta_data->>'role' IN ('admin', 'super_admin', 'council')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create a safe admin policy using the function
DROP POLICY IF EXISTS "admin_profile_management" ON public.profiles;
CREATE POLICY "admin_profile_management" 
ON public.profiles 
FOR ALL
TO authenticated
USING (
  auth.uid() = id OR public.is_current_user_admin()
)
WITH CHECK (
  auth.uid() = id OR public.is_current_user_admin()
);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_profiles_updated_at();

-- Log the fix
INSERT INTO public.audit_logs (action, table_name, user_id, organization_id, new_values)
VALUES (
  'FIX_PROFILES_STRUCTURE', 
  'profiles', 
  auth.uid(),
  NULL,
  '{"description": "Fixed profiles table structure to properly reference auth.users", "issue": "profiles_foreign_key_broken"}'::jsonb
);
