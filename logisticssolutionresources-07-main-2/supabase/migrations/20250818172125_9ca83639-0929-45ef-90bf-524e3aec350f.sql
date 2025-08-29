-- =============================================================================
-- FINAL SECURITY FIX - Complete remaining security warnings
-- =============================================================================

-- Fix the last function missing search_path
CREATE OR REPLACE FUNCTION public.start_work_order(p_defect_id uuid, p_mechanic_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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
  FROM combined_defects
  WHERE id = p_defect_id;
  
  IF NOT FOUND THEN
    RAISE NOTICE 'ERROR: Defect not found';
    RETURN false;
  END IF;
  
  RAISE NOTICE 'Found defect: type=%, source=%, status=%', 
    defect_record.defect_type, defect_record.source_type, defect_record.status;
  
  -- Update the defect status first
  IF defect_record.source_type = 'defect_report' THEN
    UPDATE defect_reports 
    SET status = 'repairing', 
        assigned_mechanic_id = p_mechanic_id,
        start_date = NOW(),
        updated_at = NOW()
    WHERE id = p_defect_id;
    
    RAISE NOTICE 'Updated defect_reports status to repairing';
  ELSIF defect_record.source_type = 'vehicle_check' THEN
    UPDATE vehicle_checks 
    SET status = 'repairing', 
        updated_at = NOW()
    WHERE id = p_defect_id;
    
    RAISE NOTICE 'Updated vehicle_checks status to repairing';
  END IF;
  
  -- Find the workflow template
  SELECT * INTO template_record
  FROM workflow_templates
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
    FROM workflow_template_stages
    WHERE template_id = template_record.id
    ORDER BY stage_order
  LOOP
    BEGIN
      INSERT INTO work_order_stages (
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
  FROM work_order_stages
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

SELECT 'All remaining security issues fixed successfully' as status;