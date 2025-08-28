-- Fix the organization ID mismatch and add prevention measures

-- 1. First, let's update the user's profile to match their JWT metadata organization_id
UPDATE profiles 
SET organization_id = '23608795-a6e7-4667-be62-84470e1bf65a'
WHERE id = '1681f826-8a8a-40e7-9300-5142a30698f3';

-- 2. Create a function to sync organization IDs and prevent mismatches
CREATE OR REPLACE FUNCTION public.sync_user_organization_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  jwt_org_id UUID;
BEGIN
  -- Extract organization_id from JWT metadata
  jwt_org_id := (NEW.raw_user_meta_data->>'organization_id')::UUID;
  
  -- If JWT has organization_id and it differs from profile, update profile
  IF jwt_org_id IS NOT NULL THEN
    UPDATE public.profiles 
    SET organization_id = jwt_org_id,
        updated_at = now()
    WHERE id = NEW.id 
    AND (organization_id IS NULL OR organization_id != jwt_org_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- 3. Create trigger to automatically sync organization IDs on auth user updates
DROP TRIGGER IF EXISTS sync_organization_id_trigger ON auth.users;
CREATE TRIGGER sync_organization_id_trigger
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_organization_id();

-- 4. Create a function to validate organization access for vehicles
CREATE OR REPLACE FUNCTION public.validate_user_organization_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  profile_org_id UUID;
  jwt_org_id UUID;
  user_id UUID;
BEGIN
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get organization_id from profile
  SELECT organization_id INTO profile_org_id
  FROM public.profiles 
  WHERE id = user_id;
  
  -- Get organization_id from JWT metadata
  SELECT (auth.jwt()->>'organization_id')::UUID INTO jwt_org_id;
  
  -- Return true if both exist and match, or if profile org exists (fallback)
  RETURN (profile_org_id IS NOT NULL AND 
          (jwt_org_id IS NULL OR profile_org_id = jwt_org_id));
END;
$$;

-- 5. Add RLS policy for vehicles table to ensure proper organization access
DROP POLICY IF EXISTS "Users can view organization vehicles" ON public.vehicles;
CREATE POLICY "Users can view organization vehicles" 
ON public.vehicles 
FOR SELECT 
USING (
  organization_id_new IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  ) AND public.validate_user_organization_access()
);

-- 6. Add logging table for organization ID mismatches
CREATE TABLE IF NOT EXISTS public.organization_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  profile_org_id UUID,
  jwt_org_id UUID,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on the logging table
ALTER TABLE public.organization_sync_logs ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view sync logs
CREATE POLICY "Admins can view sync logs" 
ON public.organization_sync_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- 7. Enhanced sync function with logging
CREATE OR REPLACE FUNCTION public.sync_user_organization_id_with_logging()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  jwt_org_id UUID;
  current_profile_org_id UUID;
BEGIN
  -- Extract organization_id from JWT metadata
  jwt_org_id := (NEW.raw_user_meta_data->>'organization_id')::UUID;
  
  -- Get current profile organization_id
  SELECT organization_id INTO current_profile_org_id
  FROM public.profiles 
  WHERE id = NEW.id;
  
  -- Log any mismatch detection
  IF jwt_org_id IS NOT NULL AND current_profile_org_id IS NOT NULL 
     AND jwt_org_id != current_profile_org_id THEN
    INSERT INTO public.organization_sync_logs 
    (user_id, profile_org_id, jwt_org_id, action)
    VALUES (NEW.id, current_profile_org_id, jwt_org_id, 'mismatch_detected');
  END IF;
  
  -- If JWT has organization_id and it differs from profile, update profile
  IF jwt_org_id IS NOT NULL AND 
     (current_profile_org_id IS NULL OR current_profile_org_id != jwt_org_id) THEN
    
    UPDATE public.profiles 
    SET organization_id = jwt_org_id,
        updated_at = now()
    WHERE id = NEW.id;
    
    -- Log the sync action
    INSERT INTO public.organization_sync_logs 
    (user_id, profile_org_id, jwt_org_id, action)
    VALUES (NEW.id, current_profile_org_id, jwt_org_id, 'synced_to_jwt');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update the trigger to use the enhanced function
DROP TRIGGER IF EXISTS sync_organization_id_trigger ON auth.users;
CREATE TRIGGER sync_organization_id_trigger
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_organization_id_with_logging();