-- CRITICAL SECURITY FIXES MIGRATION

-- ============================================================================
-- 1. ADD MISSING RLS POLICIES FOR CRITICAL TABLES
-- ============================================================================

-- Enable RLS and add policies for combined_defects table
ALTER TABLE public.combined_defects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view defects in their organization" 
ON public.combined_defects 
FOR SELECT 
USING (organization_id = get_current_user_organization_id_safe());

CREATE POLICY "Users can manage defects in their organization" 
ON public.combined_defects 
FOR ALL 
USING (organization_id = get_current_user_organization_id_safe())
WITH CHECK (organization_id = get_current_user_organization_id_safe());

-- Add policies for defect_reports table
CREATE POLICY "Users can view defect reports in their organization" 
ON public.defect_reports 
FOR SELECT 
USING (organization_id = get_current_user_organization_id_safe());

CREATE POLICY "Users can manage defect reports in their organization" 
ON public.defect_reports 
FOR ALL 
USING (organization_id = get_current_user_organization_id_safe())
WITH CHECK (organization_id = get_current_user_organization_id_safe());

-- ============================================================================
-- 2. SECURE DATABASE FUNCTIONS BY ADDING SEARCH_PATH SETTINGS
-- ============================================================================

-- Fix all functions identified by the linter to have proper search_path
CREATE OR REPLACE FUNCTION public.is_admin_or_council()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT role IN ('admin', 'council', 'super_admin') FROM public.profiles WHERE id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.get_mechanic_organization_preferences(mechanic_uuid uuid, org_uuid uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
    prefs JSONB;
BEGIN
    SELECT 
        jsonb_build_object(
            'preferences', COALESCE(preferences, '{}'::jsonb),
            'notification_settings', COALESCE(notification_settings, '{}'::jsonb),
            'ui_settings', COALESCE(ui_settings, '{}'::jsonb)
        ) INTO prefs
    FROM public.mechanic_organization_preferences
    WHERE mechanic_id = mechanic_uuid
    AND organization_id = org_uuid;
    
    RETURN COALESCE(prefs, '{}'::jsonb);
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_repair_time(p_defect_id uuid, p_mechanic_id uuid, p_activity_type character varying, p_description text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
    INSERT INTO public.repair_time_logs (
        defect_id,
        mechanic_id,
        activity_type,
        start_time,
        description
    ) VALUES (
        p_defect_id,
        p_mechanic_id,
        p_activity_type,
        NOW(),
        p_description
    );
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.end_repair_time_log(p_defect_id uuid, p_mechanic_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
    UPDATE public.repair_time_logs 
    SET 
        end_time = NOW(),
        duration_minutes = EXTRACT(EPOCH FROM (NOW() - start_time)) / 60
    WHERE defect_id = p_defect_id 
    AND mechanic_id = p_mechanic_id 
    AND end_time IS NULL;
    
    -- Update total actual hours on defect report
    UPDATE public.defect_reports 
    SET actual_hours = (
        SELECT COALESCE(SUM(duration_minutes), 0) / 60.0
        FROM public.repair_time_logs
        WHERE defect_id = p_defect_id
    )
    WHERE id = p_defect_id;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_time_entry_hours()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  -- Calculate total hours if both clock in and out times are set
  IF NEW.clock_in_time IS NOT NULL AND NEW.clock_out_time IS NOT NULL THEN
    NEW.total_hours := EXTRACT(EPOCH FROM (NEW.clock_out_time - NEW.clock_in_time)) / 3600;
  END IF;
  
  -- Calculate break hours if both break start and end times are set
  IF NEW.break_start_time IS NOT NULL AND NEW.break_end_time IS NOT NULL THEN
    NEW.break_hours := EXTRACT(EPOCH FROM (NEW.break_end_time - NEW.break_start_time)) / 3600;
    -- Subtract break time from total hours
    NEW.total_hours := NEW.total_hours - NEW.break_hours;
  END IF;
  
  -- Calculate overtime hours (anything over 8 hours per day)
  IF NEW.total_hours > 8 THEN
    NEW.overtime_hours := NEW.total_hours - 8;
  END IF;
  
  -- Set driving hours equal to total hours (can be adjusted later)
  NEW.driving_hours := NEW.total_hours;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_mechanic_organizations(mechanic_uuid uuid)
 RETURNS TABLE(organization_id uuid, organization_name text, role text, status text, is_primary boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.get_current_mechanic_organization()
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
    current_org_id UUID;
BEGIN
    -- First try to get from active session
    SELECT organization_id INTO current_org_id
    FROM public.mechanic_sessions
    WHERE mechanic_id = auth.uid()
    AND is_active = true
    ORDER BY session_start DESC
    LIMIT 1;
    
    -- If no active session, get primary organization from profile
    IF current_org_id IS NULL THEN
        SELECT organization_id INTO current_org_id
        FROM public.profiles
        WHERE id = auth.uid();
    END IF;
    
    RETURN current_org_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.switch_mechanic_organization(new_org_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
    has_access BOOLEAN;
BEGIN
    -- Check if mechanic has access to this organization
    SELECT EXISTS (
        SELECT 1 FROM public.mechanic_organizations
        WHERE mechanic_id = auth.uid()
        AND organization_id = new_org_id
        AND status = 'active'
    ) INTO has_access;
    
    IF has_access THEN
        -- End current active session
        UPDATE public.mechanic_sessions
        SET session_end = NOW(), is_active = false
        WHERE mechanic_id = auth.uid()
        AND is_active = true;
        
        -- Start new session
        INSERT INTO public.mechanic_sessions (mechanic_id, organization_id)
        VALUES (auth.uid(), new_org_id);
        
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid()
        AND raw_user_meta_data->>'role' IN ('admin', 'super_admin', 'council')
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_service_role()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT current_setting('role') IN ('service_role', 'postgres', 'supabase_admin');
$function$;

CREATE OR REPLACE FUNCTION public.get_user_organization_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$function$;

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

CREATE OR REPLACE FUNCTION public.get_user_organization_safe()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.is_user_admin_safe()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT role IN ('admin', 'council', 'super_admin') FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_org_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.is_user_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT role IN ('admin', 'council', 'super_admin') FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$function$;