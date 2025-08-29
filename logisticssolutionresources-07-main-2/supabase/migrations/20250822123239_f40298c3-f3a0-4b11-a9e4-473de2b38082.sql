-- Fix remaining security definer functions by adding SET search_path
-- This addresses the Function Search Path Mutable warnings

-- Fix get_licenses_with_drivers function
CREATE OR REPLACE FUNCTION public.get_licenses_with_drivers(org_id uuid)
RETURNS TABLE(id uuid, driver_id uuid, license_number text, license_type text, issuing_authority text, issue_date date, expiry_date date, status text, license_class text, endorsements text[], restrictions text[], points_balance integer, notes text, organization_id uuid, created_at timestamp with time zone, updated_at timestamp with time zone, medical_certificate_expiry date, background_check_expiry date, drug_test_expiry date, training_expiry date, driver_name text, driver_email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    dl.id,
    dl.driver_id,
    dl.license_number,
    dl.license_type,
    dl.issuing_authority,
    dl.issue_date,
    dl.expiry_date,
    dl.status,
    dl.license_class,
    dl.endorsements,
    dl.restrictions,
    dl.points_balance,
    dl.notes,
    dl.organization_id,
    dl.created_at,
    dl.updated_at,
    dl.medical_certificate_expiry,
    dl.background_check_expiry,
    dl.drug_test_expiry,
    dl.training_expiry,
    COALESCE(p.first_name || ' ' || p.last_name, 'Unknown Driver') as driver_name,
    COALESCE(p.email, '') as driver_email
  FROM public.driver_licenses dl
  LEFT JOIN public.profiles p ON dl.driver_id = p.id
  WHERE dl.organization_id = org_id
  ORDER BY dl.created_at DESC;
END;
$function$;

-- Fix get_mechanic_organizations function  
CREATE OR REPLACE FUNCTION public.get_mechanic_organizations(mechanic_uuid uuid)
RETURNS TABLE(organization_id uuid, organization_name text, role text, status text, is_primary boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        mo.organization_id,
        o.name as organization_name,
        mo.role,
        mo.status,
        (p.organization_id = mo.organization_id) as is_primary
    FROM public.mechanic_organizations mo
    JOIN public.organizations o ON o.id = mo.organization_id
    JOIN public.profiles p ON p.id = mechanic_uuid
    WHERE mo.mechanic_id = mechanic_uuid
    AND mo.status = 'active'
    ORDER BY is_primary DESC, o.name;
END;
$function$;

-- Fix get_available_organizations_for_mechanic function
CREATE OR REPLACE FUNCTION public.get_available_organizations_for_mechanic(mechanic_uuid uuid)
RETURNS TABLE(id uuid, name text, slug text, type text, is_active boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT o.id, o.name, o.slug, o.type, o.is_active
    FROM public.organizations o
    WHERE o.is_active = true
    AND o.id NOT IN (
        SELECT mor.organization_id 
        FROM public.mechanic_organization_requests mor
        WHERE mor.mechanic_id = mechanic_uuid
        AND mor.status IN ('pending', 'approved', 'active')
    );
END;
$function$;

-- Fix get_mechanic_organization_preferences function  
CREATE OR REPLACE FUNCTION public.get_mechanic_organization_preferences(mechanic_uuid uuid, org_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    prefs JSONB;
BEGIN
    SELECT 
        jsonb_build_object(
            'preferences', COALESCE(preferences, '{}'::jsonb),
            'notification_settings', COALESCE(notification_settings, '{}'::jsonb),
            'default_organization', (organization_id = org_uuid)
        )
    INTO prefs
    FROM public.mechanic_org_preferences
    WHERE mechanic_id = mechanic_uuid 
    AND organization_id = org_uuid;
    
    RETURN COALESCE(prefs, '{}'::jsonb);
END;
$function$;

-- Fix analyze_weekly_rest_compliance function
CREATE OR REPLACE FUNCTION public.analyze_weekly_rest_compliance(p_driver_id uuid, p_week_start_date date)
RETURNS TABLE(week_start_date date, week_end_date date, total_work_hours numeric, total_rest_hours numeric, weekly_rest_hours numeric, rest_compliance boolean, rest_type text, compensation_required boolean, violations text[], warnings text[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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