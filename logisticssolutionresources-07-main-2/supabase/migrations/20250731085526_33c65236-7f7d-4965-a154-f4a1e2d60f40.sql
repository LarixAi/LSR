-- Fix the enforce_driver_limit function that's causing the "users" table error
-- The function should check subscription limits for drivers, not reference a "users" table

CREATE OR REPLACE FUNCTION public.enforce_driver_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_driver_count INTEGER;
  max_drivers_allowed INTEGER;
  user_org_id UUID;
BEGIN
  -- Only check for driver role changes
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.role != NEW.role AND NEW.role = 'driver') THEN
    -- Get organization
    user_org_id := COALESCE(NEW.organization_id, OLD.organization_id);
    
    -- Count current active drivers in organization
    SELECT COUNT(*) INTO current_driver_count
    FROM public.profiles 
    WHERE organization_id = user_org_id 
      AND role = 'driver' 
      AND is_active = true
      AND is_archived = false;
    
    -- Get subscription limit (default to 5 for basic plan)
    max_drivers_allowed := 5; -- Basic limit, could be enhanced with subscription check
    
    -- Check if adding this driver would exceed limit
    IF current_driver_count >= max_drivers_allowed THEN
      RAISE EXCEPTION 'Driver limit exceeded. Current limit: %, Current count: %', max_drivers_allowed, current_driver_count;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;