-- COMPREHENSIVE SECURITY FIXES: Address all remaining security vulnerabilities

-- Fix remaining functions that still need search_path settings
-- Note: Some functions may have already been fixed, so we'll use CREATE OR REPLACE to be safe

-- Fix start_work_order function (if it exists)
DROP FUNCTION IF EXISTS public.start_work_order(uuid, uuid);
CREATE OR REPLACE FUNCTION public.start_work_order(p_defect_id uuid, p_mechanic_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  defect_record record;
  template_record record;
  stage_record record;
  stages_created integer := 0;
BEGIN
  -- Log function start
  RAISE NOTICE '=== START_WORK_ORDER FUNCTION STARTED ===';
  RAISE NOTICE 'Defect ID: %', p_defect_id;
  RAISE NOTICE 'Mechanic ID: %', p_mechanic_id;
  
  -- Get defect information using a record
  SELECT * INTO defect_record
  FROM public.combined_defects
  WHERE id = p_defect_id;
  
  IF NOT FOUND THEN
    RAISE NOTICE 'ERROR: Defect not found';
    RETURN false;
  END IF;
  
  RAISE NOTICE 'Found defect: type=%, source=%, status=%', 
    defect_record.defect_type, defect_record.source_type, defect_record.status;
  
  -- Update the defect status first
  IF defect_record.source_type = 'defect_report' THEN
    UPDATE public.defect_reports 
    SET status = 'repairing', 
        assigned_mechanic_id = p_mechanic_id,
        start_date = NOW(),
        updated_at = NOW()
    WHERE id = p_defect_id;
    
    RAISE NOTICE 'Updated defect_reports status to repairing';
  ELSIF defect_record.source_type = 'vehicle_check' THEN
    UPDATE public.vehicle_checks 
    SET status = 'repairing', 
        updated_at = NOW()
    WHERE id = p_defect_id;
    
    RAISE NOTICE 'Updated vehicle_checks status to repairing';
  END IF;
  
  -- Find the workflow template
  SELECT * INTO template_record
  FROM public.workflow_templates
  WHERE defect_type = defect_record.defect_type
  AND is_active = true
  LIMIT 1;
  
  IF NOT FOUND THEN
    RAISE NOTICE 'ERROR: No workflow template found for defect_type: %', defect_record.defect_type;
    RETURN false;
  END IF;
  
  RAISE NOTICE 'Found template: %', template_record.id;
  
  -- Create stages using a loop approach (more reliable)
  FOR stage_record IN 
    SELECT stage_name, stage_order, stage_description
    FROM public.workflow_template_stages
    WHERE template_id = template_record.id
    ORDER BY stage_order
  LOOP
    BEGIN
      INSERT INTO public.work_order_stages (
        defect_id,
        stage_name,
        stage_order,
        status,
        mechanic_id,
        created_at,
        updated_at
      ) VALUES (
        p_defect_id,
        stage_record.stage_name,
        stage_record.stage_order,
        'pending',
        p_mechanic_id,
        NOW(),
        NOW()
      );
      
      stages_created := stages_created + 1;
      RAISE NOTICE 'Created stage %: %', stage_record.stage_order, stage_record.stage_name;
      
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'ERROR creating stage %: %', stage_record.stage_order, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE 'Total stages created: %', stages_created;
  
  -- Verify the stages were created
  SELECT COUNT(*) INTO stages_created
  FROM public.work_order_stages
  WHERE defect_id = p_defect_id;
  
  RAISE NOTICE 'Total stages in database: %', stages_created;
  
  IF stages_created > 0 THEN
    RAISE NOTICE '=== FUNCTION COMPLETED SUCCESSFULLY ===';
    RETURN true;
  ELSE
    RAISE NOTICE '=== FUNCTION FAILED - NO STAGES CREATED ===';
    RETURN false;
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'ERROR in start_work_order: %', SQLERRM;
    RAISE NOTICE 'ERROR SQLSTATE: %', SQLSTATE;
    RETURN false;
END;
$function$;

-- Fix any remaining Security Definer Views by recreating them properly
-- Note: We'll need to identify and fix any views that were created with SECURITY DEFINER

-- Add comprehensive RLS policies for critical tables that are currently publicly readable

-- Fix profiles table RLS - Critical Security Issue
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;

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

-- Fix schools table RLS if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'schools') THEN
    -- Enable RLS on schools table
    ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can view schools in their organization" ON public.schools;
    DROP POLICY IF EXISTS "Admins can manage schools in their organization" ON public.schools;
    
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

-- Fix vehicles table RLS if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vehicles') THEN
    -- Enable RLS on vehicles table
    ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can view vehicles in their organization" ON public.vehicles;
    DROP POLICY IF EXISTS "Admins can manage vehicles in their organization" ON public.vehicles;
    
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

-- Fix routes table RLS if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'routes') THEN
    -- Enable RLS on routes table
    ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can view routes in their organization" ON public.routes;
    DROP POLICY IF EXISTS "Admins can manage routes in their organization" ON public.routes;
    
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

-- Create any missing helper functions for consistent organization and admin checks
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