-- Comprehensive Search Path Security Fix for ALL Functions
-- Fix any remaining functions that might have mutable search paths

-- Update all security definer functions to have explicit search paths

-- Fix api_get_driver_onboarding_status
CREATE OR REPLACE FUNCTION public.api_get_driver_onboarding_status(driver_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  result JSONB;
  driver_profile RECORD;
  missing_docs TEXT[] := ARRAY[]::TEXT[];
  required_docs TEXT[] := ARRAY['license', 'medical_certificate', 'dbs_check', 'cpc_card'];
  completed_tasks INTEGER := 0;
  total_tasks INTEGER := 6;
  started_at TIMESTAMP WITH TIME ZONE;
  completed_at TIMESTAMP WITH TIME ZONE := NULL;
BEGIN
  -- Get driver profile
  SELECT * INTO driver_profile 
  FROM public.profiles 
  WHERE id = driver_id;
  
  IF driver_profile IS NULL THEN
    RETURN jsonb_build_object('error', 'Driver not found');
  END IF;
  
  -- Set started_at to profile creation date
  started_at := driver_profile.created_at;
  
  -- Check for driver license
  IF NOT EXISTS (
    SELECT 1 FROM public.driver_licenses 
    WHERE driver_id = api_get_driver_onboarding_status.driver_id 
    AND status = 'active'
  ) THEN
    missing_docs := array_append(missing_docs, 'license');
  ELSE
    completed_tasks := completed_tasks + 1;
  END IF;
  
  -- Check for medical certificate
  IF driver_profile.medical_card_expiry IS NULL THEN
    missing_docs := array_append(missing_docs, 'medical_certificate');
  ELSE
    completed_tasks := completed_tasks + 1;
  END IF;
  
  -- Check for DBS check
  IF driver_profile.dbs_check_date IS NULL OR driver_profile.dbs_check_expiry IS NULL THEN
    missing_docs := array_append(missing_docs, 'dbs_check');
  ELSE
    completed_tasks := completed_tasks + 1;
  END IF;
  
  -- Check for CPC card
  IF NOT EXISTS (
    SELECT 1 FROM public.documents 
    WHERE related_entity_id = api_get_driver_onboarding_status.driver_id 
    AND related_entity_type = 'driver'
    AND category = 'cpc_card'
  ) THEN
    missing_docs := array_append(missing_docs, 'cpc_card');
  ELSE
    completed_tasks := completed_tasks + 1;
  END IF;
  
  -- Check if profile is complete
  IF driver_profile.first_name IS NOT NULL AND 
     driver_profile.last_name IS NOT NULL AND
     driver_profile.phone IS NOT NULL THEN
    completed_tasks := completed_tasks + 1;
  END IF;
  
  -- Check if address is complete
  IF driver_profile.address IS NOT NULL AND
     driver_profile.city IS NOT NULL AND
     driver_profile.state IS NOT NULL AND
     driver_profile.zip_code IS NOT NULL THEN
    completed_tasks := completed_tasks + 1;
  END IF;
  
  -- If all tasks are complete, set completed_at
  IF completed_tasks = total_tasks THEN
    completed_at := NOW();
    
    -- Update profile status if needed
    IF driver_profile.onboarding_status != 'completed' THEN
      UPDATE public.profiles
      SET onboarding_status = 'completed',
          updated_at = NOW()
      WHERE id = driver_id;
    END IF;
  END IF;
  
  -- Build result
  result := jsonb_build_object(
    'is_complete', (completed_tasks = total_tasks),
    'missing_documents', missing_docs,
    'required_documents', required_docs,
    'started_at', started_at,
    'completed_at', completed_at,
    'total_tasks', total_tasks,
    'completed_tasks', completed_tasks
  );
  
  RETURN result;
END;
$$;

-- Fix api_mark_onboarding_complete
CREATE OR REPLACE FUNCTION public.api_mark_onboarding_complete(driver_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  result JSONB;
BEGIN
  UPDATE public.profiles
  SET onboarding_status = 'completed',
      updated_at = NOW()
  WHERE id = driver_id;
  
  result := jsonb_build_object(
    'success', true,
    'message', 'Onboarding marked as complete',
    'driver_id', driver_id
  );
  
  RETURN result;
END;
$$;

-- Fix api_initialize_driver_onboarding
CREATE OR REPLACE FUNCTION public.api_initialize_driver_onboarding(driver_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  result JSONB;
BEGIN
  UPDATE public.profiles
  SET onboarding_status = 'in_progress',
      updated_at = NOW()
  WHERE id = driver_id;
  
  result := jsonb_build_object(
    'success', true,
    'message', 'Onboarding initialized',
    'driver_id', driver_id
  );
  
  RETURN result;
END;
$$;

-- Fix check_password_change_required
CREATE OR REPLACE FUNCTION public.check_password_change_required(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
    IF user_uuid IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN (
        SELECT COALESCE(must_change_password, FALSE)
        FROM public.profiles 
        WHERE id = user_uuid 
        LIMIT 1
    );
END;
$$;

-- Fix has_admin_privileges
CREATE OR REPLACE FUNCTION public.has_admin_privileges(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
    IF user_uuid IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN (
        SELECT COALESCE(role IN ('admin', 'council'), FALSE)
        FROM public.profiles 
        WHERE id = user_uuid 
        LIMIT 1
    );
END;
$$;

-- Fix archive_driver
CREATE OR REPLACE FUNCTION public.archive_driver(p_driver_id uuid, p_reason text DEFAULT 'Removed from company'::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  user_org_id UUID;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO user_org_id
  FROM public.profiles WHERE id = auth.uid();
  
  -- Verify the driver belongs to the same organization
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = p_driver_id 
    AND organization_id = user_org_id
    AND role = 'driver'
  ) THEN
    RAISE EXCEPTION 'Driver not found in your organization';
  END IF;
  
  -- Archive the driver
  UPDATE public.profiles 
  SET 
    is_archived = true,
    archived_at = now(),
    archived_by = auth.uid(),
    archive_reason = p_reason,
    is_active = false,
    employment_status = 'terminated'
  WHERE id = p_driver_id 
  AND organization_id = user_org_id;
  
  -- Log the archive action
  PERFORM public.log_audit_trail('profiles', p_driver_id, 'ARCHIVE', NULL, NULL, p_reason);
  
  RETURN true;
END;
$$;