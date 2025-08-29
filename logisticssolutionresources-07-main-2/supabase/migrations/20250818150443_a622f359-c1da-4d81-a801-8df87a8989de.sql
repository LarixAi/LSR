-- TARGETED SECURITY FIXES: Address actual security vulnerabilities

-- Fix critical profiles table RLS issue first
-- The profiles table was identified as publicly readable which is a critical security risk

-- Drop existing policies that might be too permissive
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create secure RLS policies for profiles table
CREATE POLICY "Users can view profiles in their organization" 
ON public.profiles FOR SELECT 
USING (
  organization_id = get_current_user_organization_id_safe() OR 
  id = auth.uid()
);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can manage profiles in their organization" 
ON public.profiles FOR ALL 
USING (
  is_current_user_admin_safe() AND 
  organization_id = get_current_user_organization_id_safe()
)
WITH CHECK (
  is_current_user_admin_safe() AND 
  organization_id = get_current_user_organization_id_safe()
);

-- Fix any tables that exist and need RLS (checking table structure first)

-- Fix vehicles table RLS if it exists and has organization_id
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'vehicles' 
    AND column_name = 'organization_id'
  ) THEN
    -- Enable RLS on vehicles table
    ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
    
    -- Drop potentially permissive policies
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.vehicles;
    DROP POLICY IF EXISTS "Public access" ON public.vehicles;
    
    -- Create secure policies
    EXECUTE 'CREATE POLICY "Users can view vehicles in their organization" 
    ON public.vehicles FOR SELECT 
    USING (organization_id = get_current_user_organization_id_safe())';
    
    EXECUTE 'CREATE POLICY "Admins can manage vehicles in their organization" 
    ON public.vehicles FOR ALL 
    USING (
      is_current_user_admin_safe() AND 
      organization_id = get_current_user_organization_id_safe()
    )
    WITH CHECK (
      is_current_user_admin_safe() AND 
      organization_id = get_current_user_organization_id_safe()
    )';
  END IF;
END $$;

-- Fix routes table RLS if it exists and has organization_id
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'routes' 
    AND column_name = 'organization_id'
  ) THEN
    -- Enable RLS on routes table
    ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
    
    -- Drop potentially permissive policies
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.routes;
    DROP POLICY IF EXISTS "Public access" ON public.routes;
    
    -- Create secure policies
    EXECUTE 'CREATE POLICY "Users can view routes in their organization" 
    ON public.routes FOR SELECT 
    USING (organization_id = get_current_user_organization_id_safe())';
    
    EXECUTE 'CREATE POLICY "Admins can manage routes in their organization" 
    ON public.routes FOR ALL 
    USING (
      is_current_user_admin_safe() AND 
      organization_id = get_current_user_organization_id_safe()
    )
    WITH CHECK (
      is_current_user_admin_safe() AND 
      organization_id = get_current_user_organization_id_safe()
    )';
  END IF;
END $$;

-- Fix schools table RLS if it exists and has organization_id
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'schools' 
    AND column_name = 'organization_id'
  ) THEN
    -- Enable RLS on schools table
    ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
    
    -- Drop potentially permissive policies
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.schools;
    DROP POLICY IF EXISTS "Public access" ON public.schools;
    
    -- Create secure policies
    EXECUTE 'CREATE POLICY "Users can view schools in their organization" 
    ON public.schools FOR SELECT 
    USING (organization_id = get_current_user_organization_id_safe())';
    
    EXECUTE 'CREATE POLICY "Admins can manage schools in their organization" 
    ON public.schools FOR ALL 
    USING (
      is_current_user_admin_safe() AND 
      organization_id = get_current_user_organization_id_safe()
    )
    WITH CHECK (
      is_current_user_admin_safe() AND 
      organization_id = get_current_user_organization_id_safe()
    )';
  END IF;
END $$;

-- Ensure helper functions exist with proper search_path (these are critical for security)
CREATE OR REPLACE FUNCTION public.get_current_user_organization_id_safe()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin_safe()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'council', 'compliance_officer')
  );
$function$;