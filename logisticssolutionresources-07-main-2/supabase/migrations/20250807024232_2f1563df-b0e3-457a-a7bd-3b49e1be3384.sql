-- Fix the search_path security issue for generate_enhanced_defect_number function
-- Drop and recreate the function with secure search_path

DROP FUNCTION IF EXISTS public.generate_enhanced_defect_number;

CREATE OR REPLACE FUNCTION public.generate_enhanced_defect_number(p_vehicle_id uuid, p_inspection_date date)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    defect_num TEXT;
    inspection_count INTEGER;
BEGIN
    -- Get count of inspections for this vehicle on this date
    SELECT COUNT(*) INTO inspection_count
    FROM public.vehicle_inspections 
    WHERE vehicle_id = p_vehicle_id 
    AND inspection_date = p_inspection_date;
    
    -- Only generate defect number for second+ inspections
    IF inspection_count > 0 THEN
        defect_num := 'DF-' || TO_CHAR(p_inspection_date, 'YYYYMMDD') || '-' || (inspection_count + 1)::TEXT;
        RETURN defect_num;
    END IF;
    
    RETURN NULL;
END;
$function$;