-- Fix the search_path security issue for generate_enhanced_defect_number function
-- Update the specific function with arguments to add secure search_path

CREATE OR REPLACE FUNCTION public.generate_enhanced_defect_number(p_vehicle_id uuid, p_inspection_date date)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    defect_num TEXT;
    daily_count INTEGER;
    vehicle_number TEXT;
BEGIN
    -- Get vehicle number for reference
    SELECT vehicles.vehicle_number INTO vehicle_number
    FROM public.vehicles 
    WHERE id = p_vehicle_id;
    
    -- Get count of inspections for this vehicle on this date with defects
    SELECT COUNT(*) INTO daily_count
    FROM public.vehicle_inspections 
    WHERE vehicle_id = p_vehicle_id 
    AND inspection_date = p_inspection_date
    AND defects_found = true;
    
    -- Generate defect number: DEF-VEHICLENUM-YYYYMMDD-XX
    defect_num := 'DEF-' || COALESCE(vehicle_number, 'UNK') || '-' || TO_CHAR(p_inspection_date, 'YYYYMMDD') || '-' || LPAD((daily_count + 1)::TEXT, 2, '0');
    
    RETURN defect_num;
END;
$function$;

-- Also clean up the parameterless version that seems incomplete
DROP FUNCTION IF EXISTS public.generate_enhanced_defect_number();