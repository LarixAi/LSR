
-- Drop the existing function and recreate it properly
DROP FUNCTION IF EXISTS public.check_driver_limit() CASCADE;

-- Recreate the function with the correct return type for triggers
CREATE OR REPLACE FUNCTION public.check_driver_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_driver_count INTEGER;
  max_drivers_allowed INTEGER;
BEGIN
  -- Get current driver count for the organization
  SELECT COUNT(*) INTO current_driver_count
  FROM public.profiles p
  JOIN public.user_organizations uo ON p.id = uo.user_id
  WHERE uo.organization_id = (
    SELECT organization_id FROM public.user_organizations 
    WHERE user_id = NEW.id AND is_active = true
    LIMIT 1
  ) AND p.role = 'driver' AND p.is_active = true;

  -- Get max drivers allowed for the organization's subscription
  SELECT sp.max_drivers INTO max_drivers_allowed
  FROM public.subscription_plans sp
  JOIN public.company_subscriptions cs ON sp.id = cs.plan_id
  JOIN public.user_organizations uo ON cs.organization_id = uo.organization_id
  WHERE uo.user_id = NEW.id AND uo.is_active = true
  LIMIT 1;

  -- If no subscription found, default to basic plan limit
  IF max_drivers_allowed IS NULL THEN
    max_drivers_allowed := 5;
  END IF;

  -- Check if adding this driver would exceed the limit
  IF NEW.role = 'driver' AND current_driver_count >= max_drivers_allowed THEN
    RAISE EXCEPTION 'Driver limit exceeded. Your current plan allows up to % drivers.', max_drivers_allowed;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS enforce_driver_limit ON public.profiles;
CREATE TRIGGER enforce_driver_limit
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (NEW.role = 'driver' AND NEW.is_active = true)
  EXECUTE FUNCTION check_driver_limit();
