-- FINAL DATABASE SECURITY FIXES: Fix remaining functions

-- Fix the remaining functions that still need search_path settings

-- Handle the analyze_weekly_rest_compliance function
CREATE OR REPLACE FUNCTION public.analyze_weekly_rest_compliance(p_driver_id uuid, p_week_start_date date)
 RETURNS TABLE(week_start_date date, week_end_date date, total_work_hours numeric, total_rest_hours numeric, weekly_rest_hours numeric, rest_compliance boolean, rest_type text, compensation_required boolean, violations text[], warnings text[])
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
DECLARE
  v_week_end_date DATE;
  v_total_work_hours DECIMAL(5,2) := 0;
  v_total_rest_hours DECIMAL(5,2) := 0;
  v_weekly_rest_hours DECIMAL(5,2) := 0;
  v_rest_type TEXT;
  v_compensation_required BOOLEAN;
  v_rest_compliance BOOLEAN := false;
  v_violations TEXT[] := '{}';
  v_warnings TEXT[] := '{}';
BEGIN
  -- Calculate week end date
  v_week_end_date := p_week_start_date + INTERVAL '6 days';
  
  -- Get total work hours for the week
  SELECT COALESCE(SUM(total_hours), 0) INTO v_total_work_hours
  FROM public.time_entries
  WHERE driver_id = p_driver_id
    AND date >= p_week_start_date
    AND date <= v_week_end_date;
  
  -- Get total daily rest hours for the week
  SELECT COALESCE(SUM(duration_hours), 0) INTO v_total_rest_hours
  FROM public.daily_rest
  WHERE driver_id = p_driver_id
    AND rest_date >= p_week_start_date
    AND rest_date <= v_week_end_date;
  
  -- Get weekly rest record
  SELECT total_rest_hours, rest_type, compensation_required
  INTO v_weekly_rest_hours, v_rest_type, v_compensation_required
  FROM public.weekly_rest
  WHERE driver_id = p_driver_id
    AND week_start_date = p_week_start_date
    AND week_end_date = v_week_end_date;
  
  -- Analyze compliance
  IF v_weekly_rest_hours >= 45 THEN
    v_rest_compliance := true;
    v_rest_type := 'full_weekly_rest';
  ELSIF v_weekly_rest_hours >= 24 THEN
    v_rest_compliance := true;
    v_rest_type := 'reduced_weekly_rest';
    v_compensation_required := true;
  ELSE
    v_rest_compliance := false;
    v_rest_type := 'missing';
  END IF;
  
  -- Check for violations
  IF v_total_work_hours > 60 THEN
    v_violations := array_append(v_violations, 'Weekly working time exceeds 60 hours');
  END IF;
  
  IF v_weekly_rest_hours < 24 THEN
    v_violations := array_append(v_violations, 'Weekly rest period below minimum requirement');
  END IF;
  
  -- Check for warnings
  IF v_total_work_hours > 55 AND v_total_work_hours <= 60 THEN
    v_warnings := array_append(v_warnings, 'Weekly working time approaching limit');
  END IF;
  
  IF v_compensation_required AND v_weekly_rest_hours < 45 THEN
    v_warnings := array_append(v_warnings, 'Compensation required for reduced weekly rest');
  END IF;
  
  RETURN QUERY SELECT 
    p_week_start_date,
    v_week_end_date,
    v_total_work_hours,
    v_total_rest_hours,
    COALESCE(v_weekly_rest_hours, 0),
    v_rest_compliance,
    COALESCE(v_rest_type, 'missing'),
    COALESCE(v_compensation_required, false),
    v_violations,
    v_warnings;
END;
$function$;

-- Fix auto_record_rest_days function
CREATE OR REPLACE FUNCTION public.auto_record_rest_days(p_driver_id uuid, p_start_date date, p_end_date date)
 RETURNS TABLE(days_processed integer, rest_days_created integer, worked_days integer, existing_rest_days integer)
 LANGUAGE plpgsql
 SET search_path = 'public'
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

-- Fix auto_record_weekly_rest function
CREATE OR REPLACE FUNCTION public.auto_record_weekly_rest(p_driver_id uuid, p_week_start_date date)
 RETURNS TABLE(week_processed date, weekly_rest_created boolean, rest_type text, total_rest_hours numeric, compensation_required boolean)
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
DECLARE
  v_week_end_date DATE;
  v_total_work_hours DECIMAL(5,2) := 0;
  v_total_rest_hours DECIMAL(5,2) := 0;
  v_rest_type TEXT := 'full_weekly_rest';
  v_compensation_required BOOLEAN := false;
  v_existing_rest_id UUID;
BEGIN
  -- Calculate week end date (Sunday)
  v_week_end_date := p_week_start_date + INTERVAL '6 days';
  
  -- Check if weekly rest already exists for this week
  SELECT id INTO v_existing_rest_id
  FROM public.weekly_rest
  WHERE driver_id = p_driver_id
    AND week_start_date = p_week_start_date
    AND week_end_date = v_week_end_date;
  
  IF v_existing_rest_id IS NOT NULL THEN
    -- Weekly rest already exists
    RETURN QUERY SELECT 
      p_week_start_date,
      false,
      'existing',
      0.0,
      false;
    RETURN;
  END IF;
  
  -- Calculate total work hours for the week
  SELECT COALESCE(SUM(total_hours), 0) INTO v_total_work_hours
  FROM public.time_entries
  WHERE driver_id = p_driver_id
    AND date >= p_week_start_date
    AND date <= v_week_end_date;
  
  -- Calculate total daily rest hours for the week
  SELECT COALESCE(SUM(duration_hours), 0) INTO v_total_rest_hours
  FROM public.daily_rest
  WHERE driver_id = p_driver_id
    AND rest_date >= p_week_start_date
    AND rest_date <= v_week_end_date;
  
  -- Determine rest type based on WTD regulations
  IF v_total_work_hours > 60 THEN
    -- If weekly work hours exceed 60, this might require reduced rest
    v_rest_type := 'reduced_weekly_rest';
    v_compensation_required := true;
  END IF;
  
  -- Default weekly rest hours (45 hours for full rest)
  IF v_total_rest_hours = 0 THEN
    v_total_rest_hours := 45.0;
  END IF;
  
  -- Insert weekly rest record
  INSERT INTO public.weekly_rest (
    driver_id,
    week_start_date,
    week_end_date,
    total_rest_hours,
    rest_type,
    compensation_required,
    notes,
    organization_id
  )
  SELECT 
    p_driver_id,
    p_week_start_date,
    v_week_end_date,
    v_total_rest_hours,
    v_rest_type,
    v_compensation_required,
    'Automatically recorded weekly rest period',
    organization_id
  FROM public.profiles
  WHERE id = p_driver_id;
  
  RETURN QUERY SELECT 
    p_week_start_date,
    true,
    v_rest_type,
    v_total_rest_hours,
    v_compensation_required;
END;
$function$;

-- Fix calculate_vehicle_check_result function
CREATE OR REPLACE FUNCTION public.calculate_vehicle_check_result(session_uuid uuid)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
DECLARE
  total_questions INTEGER;
  passed_questions INTEGER;
  failed_questions INTEGER;
  critical_failed BOOLEAN;
BEGIN
  -- Get question counts
  SELECT 
    COUNT(*),
    COUNT(CASE WHEN vca.is_correct = true THEN 1 END),
    COUNT(CASE WHEN vca.is_correct = false THEN 1 END)
  INTO total_questions, passed_questions, failed_questions
  FROM public.vehicle_check_answers vca
  WHERE vca.session_id = session_uuid;
  
  -- Check if any critical questions failed
  SELECT EXISTS (
    SELECT 1 FROM public.vehicle_check_answers vca
    JOIN public.vehicle_check_questions vcq ON vca.question_id = vcq.id
    WHERE vca.session_id = session_uuid 
    AND vcq.is_critical = true 
    AND vca.is_correct = false
  ) INTO critical_failed;
  
  -- Update session with results
  UPDATE public.vehicle_check_sessions 
  SET 
    total_questions = total_questions,
    passed_questions = passed_questions,
    failed_questions = failed_questions,
    overall_result = CASE 
      WHEN critical_failed THEN 'failed'
      WHEN failed_questions = 0 THEN 'passed'
      ELSE 'failed'
    END
  WHERE id = session_uuid;
  
  -- Return the result
  RETURN CASE 
    WHEN critical_failed THEN 'failed'
    WHEN failed_questions = 0 THEN 'passed'
    ELSE 'failed'
  END;
END;
$function$;

-- Fix update_daily_usage function
CREATE OR REPLACE FUNCTION public.update_daily_usage()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
DECLARE
    org_record RECORD;
    driver_count INTEGER;
    vehicle_count INTEGER;
BEGIN
    FOR org_record IN SELECT id FROM organizations LOOP
        -- Count drivers
        SELECT COUNT(*) INTO driver_count
        FROM profiles
        WHERE organization_id = org_record.id AND role = 'driver';
        
        -- Count vehicles
        SELECT COUNT(*) INTO vehicle_count
        FROM vehicles
        WHERE organization_id = org_record.id;
        
        -- Insert or update usage record
        INSERT INTO organization_usage (organization_id, drivers_count, vehicles_count)
        VALUES (org_record.id, driver_count, vehicle_count)
        ON CONFLICT (organization_id, date)
        DO UPDATE SET
            drivers_count = EXCLUDED.drivers_count,
            vehicles_count = EXCLUDED.vehicles_count,
            updated_at = NOW();
    END LOOP;
END;
$function$;

-- Fix generate_vehicle_check_reference function
CREATE OR REPLACE FUNCTION public.generate_vehicle_check_reference(company_prefix text, check_date date DEFAULT CURRENT_DATE)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = 'public'
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

-- Fix start_work_order_debug function
CREATE OR REPLACE FUNCTION public.start_work_order_debug(p_defect_id uuid, p_mechanic_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
    found_template_id UUID;
    stage_count INTEGER := 0;
    defect_type_val TEXT;
    defect_status TEXT;
BEGIN
    -- Get defect information
    SELECT cd.defect_type, cd.status INTO defect_type_val, defect_status
    FROM public.combined_defects cd
    WHERE cd.id = p_defect_id;
    
    IF defect_type_val IS NULL THEN
        RETURN 'Defect not found';
    END IF;
    
    -- Get template ID
    SELECT wt.id INTO found_template_id
    FROM public.workflow_templates wt
    WHERE wt.defect_type = defect_type_val AND wt.is_active = TRUE
    LIMIT 1;
    
    IF found_template_id IS NULL THEN
        RETURN 'No template found for defect type: ' || defect_type_val;
    END IF;
    
    -- Count stages
    SELECT COUNT(*) INTO stage_count
    FROM public.workflow_template_stages wts
    WHERE wts.template_id = found_template_id;
    
    RETURN 'Success: Template found with ' || stage_count || ' stages for defect type: ' || defect_type_val || ' (status: ' || defect_status || ')';
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'Error: ' || SQLERRM;
END;
$function$;