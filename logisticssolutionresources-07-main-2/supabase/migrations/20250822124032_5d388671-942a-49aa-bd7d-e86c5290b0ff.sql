-- Fix remaining functions with missing search_path

-- Fix generate_vehicle_check_reference function
CREATE OR REPLACE FUNCTION public.generate_vehicle_check_reference(company_prefix text, check_date date DEFAULT CURRENT_DATE)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  week_number INTEGER;
  date_suffix TEXT;
  reference_number TEXT;
  counter INTEGER := 1;
BEGIN
  -- Get week number (1-52)
  week_number := EXTRACT(WEEK FROM check_date);
  
  -- Get date suffix (MMDD format)
  date_suffix := TO_CHAR(check_date, 'MMDD');
  
  -- Generate base reference
  reference_number := company_prefix || LPAD(week_number::TEXT, 2, '0') || date_suffix;
  
  -- Check if this reference already exists and add counter if needed
  WHILE EXISTS (
    SELECT 1 FROM public.vehicle_check_sessions 
    WHERE reference_number = reference_number || LPAD(counter::TEXT, 2, '0')
  ) LOOP
    counter := counter + 1;
  END LOOP;
  
  -- Return final reference number
  IF counter > 1 THEN
    RETURN reference_number || LPAD(counter::TEXT, 2, '0');
  ELSE
    RETURN reference_number;
  END IF;
END;
$function$;

-- Fix expire_trials function
CREATE OR REPLACE FUNCTION public.expire_trials()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    UPDATE organization_trials
    SET trial_status = 'expired'
    WHERE trial_status = 'active'
    AND trial_end_date < NOW();
END;
$function$;

-- Fix complete_work_order function
CREATE OR REPLACE FUNCTION public.complete_work_order(p_defect_id uuid, p_mechanic_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    invoice_id UUID;
BEGIN
    -- Update defect report status to 'resolved'
    UPDATE public.defect_reports 
    SET 
        status = 'resolved',
        completion_date = NOW(),
        updated_at = NOW()
    WHERE id = p_defect_id;
    
    -- Complete all remaining stages
    UPDATE public.work_order_stages 
    SET 
        status = 'completed',
        completed_at = NOW(),
        updated_at = NOW()
    WHERE defect_id = p_defect_id 
    AND status IN ('pending', 'in_progress');
    
    -- Create invoice if not exists
    INSERT INTO public.repair_invoices (
        defect_id,
        labor_hours,
        labor_rate,
        labor_total,
        parts_total,
        total_amount,
        status,
        created_by
    )
    SELECT 
        p_defect_id,
        dr.actual_hours,
        75.00, -- Default labor rate
        dr.actual_hours * 75.00,
        COALESCE(SUM(pr.total_cost), 0),
        (dr.actual_hours * 75.00) + COALESCE(SUM(pr.total_cost), 0),
        'draft',
        p_mechanic_id
    FROM public.defect_reports dr
    LEFT JOIN public.parts_requests pr ON dr.id = pr.defect_id AND pr.status = 'installed'
    WHERE dr.id = p_defect_id
    GROUP BY dr.id, dr.actual_hours
    ON CONFLICT (defect_id) DO NOTHING;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$function$;

-- Fix check_driver_limit function  
CREATE OR REPLACE FUNCTION public.check_driver_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    current_drivers INTEGER;
    max_drivers INTEGER;
    trial_status TEXT;
    subscription_status TEXT;
BEGIN
    -- Get current driver count for the organization
    SELECT COUNT(*) INTO current_drivers
    FROM profiles
    WHERE organization_id = NEW.organization_id AND role = 'driver';
    
    -- Check trial status
    SELECT trial_status, max_drivers INTO trial_status, max_drivers
    FROM organization_trials
    WHERE organization_id = NEW.organization_id
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Check subscription status
    SELECT status INTO subscription_status
    FROM organization_subscriptions
    WHERE organization_id = NEW.organization_id
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- If no trial or subscription found, allow (for initial setup)
    IF trial_status IS NULL AND subscription_status IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- If trial is active, check trial limits
    IF trial_status = 'active' THEN
        IF current_drivers >= max_drivers THEN
            RAISE EXCEPTION 'Driver limit reached for trial. Maximum % drivers allowed.', max_drivers;
        END IF;
    END IF;
    
    -- If subscription is active, check subscription limits
    IF subscription_status = 'active' THEN
        -- Get plan limits based on subscription plan_id
        -- This would need to be implemented based on your plan structure
        -- For now, we'll allow it
        RETURN NEW;
    END IF;
    
    -- If trial expired and no active subscription, block
    IF trial_status = 'expired' AND (subscription_status IS NULL OR subscription_status != 'active') THEN
        RAISE EXCEPTION 'Trial has expired. Please upgrade to continue adding drivers.';
    END IF;
    
    RETURN NEW;
END;
$function$;