-- Continue with remaining secure functions to replace views

-- Secure function for notification statistics (replaces view)
CREATE OR REPLACE FUNCTION public.get_notification_statistics(org_id uuid DEFAULT NULL)
RETURNS TABLE(
    organization_id uuid,
    total_notifications bigint,
    unread_notifications bigint,
    emergency_notifications bigint,
    high_priority_notifications bigint,
    safety_notifications bigint,
    emergency_category_notifications bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    target_org_id uuid;
BEGIN
    -- Get user's organization if not specified
    IF org_id IS NULL THEN
        SELECT organization_id INTO target_org_id
        FROM public.profiles
        WHERE id = auth.uid();
    ELSE
        target_org_id := org_id;
        
        -- Verify user has access to this organization
        IF NOT EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND (organization_id = target_org_id OR role IN ('admin', 'super_admin'))
        ) THEN
            RAISE EXCEPTION 'Access denied to organization data';
        END IF;
    END IF;

    RETURN QUERY
    SELECT 
        target_org_id,
        COUNT(*) AS total_notifications,
        COUNT(*) FILTER (WHERE read_at IS NULL) AS unread_notifications,
        COUNT(*) FILTER (WHERE priority = 'emergency') AS emergency_notifications,
        COUNT(*) FILTER (WHERE priority = 'high') AS high_priority_notifications,
        COUNT(*) FILTER (WHERE category = 'safety') AS safety_notifications,
        COUNT(*) FILTER (WHERE category = 'emergency') AS emergency_category_notifications
    FROM public.notification_messages
    WHERE notification_messages.organization_id = target_org_id;
END;
$function$;

-- Secure function for school routes (replaces view)
CREATE OR REPLACE FUNCTION public.get_school_routes_summary(org_id uuid DEFAULT NULL)
RETURNS TABLE(
    id uuid,
    name text,
    school_name text,
    route_type text,
    status text,
    start_location text,
    end_location text,
    capacity integer,
    current_passengers integer,
    assigned_vehicle_id uuid,
    assigned_driver_id uuid,
    grade_levels text[],
    pickup_times time[],
    dropoff_times time[],
    days_of_week text[],
    contact_person text,
    contact_phone text,
    contact_email text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    target_org_id uuid;
BEGIN
    -- Get user's organization if not specified
    IF org_id IS NULL THEN
        SELECT organization_id INTO target_org_id
        FROM public.profiles
        WHERE id = auth.uid();
    ELSE
        target_org_id := org_id;
        
        -- Verify user has access to this organization
        IF NOT EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND (organization_id = target_org_id OR role IN ('admin', 'super_admin'))
        ) THEN
            RAISE EXCEPTION 'Access denied to organization data';
        END IF;
    END IF;

    RETURN QUERY
    SELECT 
        r.id,
        r.name,
        r.school_name,
        r.route_type,
        r.status,
        r.start_location,
        r.end_location,
        r.capacity,
        r.current_passengers,
        r.assigned_vehicle_id,
        r.assigned_driver_id,
        r.grade_levels,
        r.pickup_times,
        r.dropoff_times,
        r.days_of_week,
        r.contact_person,
        r.contact_phone,
        r.contact_email,
        r.created_at,
        r.updated_at
    FROM public.routes r
    WHERE r.organization_id = target_org_id
    AND r.route_type = 'school';
END;
$function$;

-- Fix remaining functions with missing search_path
CREATE OR REPLACE FUNCTION public.auto_record_rest_days(p_driver_id uuid, p_start_date date, p_end_date date)
RETURNS TABLE(days_processed integer, rest_days_created integer, worked_days integer, existing_rest_days integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_worked_days INTEGER;
  v_existing_rest_days INTEGER;
  v_rest_days_created INTEGER := 0;
  v_current_date DATE;
BEGIN
  -- Count worked days in the period
  SELECT COUNT(DISTINCT date) INTO v_worked_days
  FROM public.time_entries
  WHERE driver_id = p_driver_id
    AND date >= p_start_date
    AND date <= p_end_date;

  -- Count existing rest days in the period
  SELECT COUNT(*) INTO v_existing_rest_days
  FROM public.daily_rest
  WHERE driver_id = p_driver_id
    AND rest_date >= p_start_date
    AND rest_date <= p_end_date;

  -- Loop through each day in the range
  v_current_date := p_start_date;
  WHILE v_current_date <= p_end_date LOOP
    -- Check if this day has no work and no existing rest record
    IF NOT EXISTS (
      SELECT 1 FROM public.time_entries 
      WHERE driver_id = p_driver_id AND date = v_current_date
    ) AND NOT EXISTS (
      SELECT 1 FROM public.daily_rest 
      WHERE driver_id = p_driver_id AND rest_date = v_current_date
    ) THEN
      -- Insert rest record for this day
      INSERT INTO public.daily_rest (
        driver_id,
        rest_date,
        rest_type,
        duration_hours,
        notes,
        organization_id
      )
      SELECT 
        p_driver_id,
        v_current_date,
        'daily_rest',
        24.0,
        'Automatically recorded rest day - no work activity',
        organization_id
      FROM public.profiles
      WHERE id = p_driver_id;
      
      v_rest_days_created := v_rest_days_created + 1;
    END IF;
    
    v_current_date := v_current_date + INTERVAL '1 day';
  END LOOP;

  RETURN QUERY SELECT 
    (p_end_date - p_start_date + 1)::INTEGER as days_processed,
    v_rest_days_created,
    v_worked_days,
    v_existing_rest_days;
END;
$function$;