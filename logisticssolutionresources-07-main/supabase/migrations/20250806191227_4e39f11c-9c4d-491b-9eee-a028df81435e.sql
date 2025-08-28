-- Add analysis_results column to tachograph_records table
ALTER TABLE public.tachograph_records 
ADD COLUMN analysis_results JSONB DEFAULT '{}'::jsonb;

-- Create index for better performance on analysis results
CREATE INDEX idx_tachograph_records_analysis_results ON public.tachograph_records USING GIN(analysis_results);

-- Add source column to infringements table to track tachograph-generated ones
ALTER TABLE public.infringements 
ADD COLUMN source TEXT DEFAULT 'manual',
ADD COLUMN tachograph_record_id UUID REFERENCES public.tachograph_records(id);

-- Create index for tachograph-sourced infringements
CREATE INDEX idx_infringements_tachograph_source ON public.infringements(tachograph_record_id, source);

-- Update RLS policy for infringements to allow tachograph system to create records
CREATE POLICY "Tachograph system can create infringements" 
ON public.infringements 
FOR INSERT 
WITH CHECK (source = 'tachograph');

-- Create function to detect tachograph violations and create infringements
CREATE OR REPLACE FUNCTION public.process_tachograph_violations(
  p_tachograph_record_id UUID,
  p_organization_id UUID,
  p_driver_id UUID,
  p_vehicle_id UUID,
  p_analysis_results JSONB
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  violations_created INTEGER := 0;
  violation_type TEXT;
  infringement_type_id UUID;
  severity TEXT;
  points INTEGER;
  fine_amount NUMERIC;
BEGIN
  -- Check for driving time violations
  IF (p_analysis_results->>'driving_time_violation')::boolean = true THEN
    -- Find driving time infringement type
    SELECT id, severity, penalty_points, fine_amount INTO infringement_type_id, severity, points, fine_amount
    FROM public.infringement_types 
    WHERE organization_id = p_organization_id 
    AND LOWER(name) LIKE '%driving time%' 
    AND is_active = true
    LIMIT 1;
    
    IF infringement_type_id IS NOT NULL THEN
      INSERT INTO public.infringements (
        organization_id, driver_id, vehicle_id, infringement_type_id,
        incident_date, location, description, severity, penalty_points, fine_amount,
        source, tachograph_record_id, status
      ) VALUES (
        p_organization_id, p_driver_id, p_vehicle_id, infringement_type_id,
        NOW()::date, 'Tachograph Data', 
        'Driving time violation detected: ' || (p_analysis_results->>'driving_time_details')::text,
        severity, points, fine_amount, 'tachograph', p_tachograph_record_id, 'confirmed'
      );
      violations_created := violations_created + 1;
    END IF;
  END IF;
  
  -- Check for rest period violations
  IF (p_analysis_results->>'rest_period_violation')::boolean = true THEN
    SELECT id, severity, penalty_points, fine_amount INTO infringement_type_id, severity, points, fine_amount
    FROM public.infringement_types 
    WHERE organization_id = p_organization_id 
    AND LOWER(name) LIKE '%rest%' 
    AND is_active = true
    LIMIT 1;
    
    IF infringement_type_id IS NOT NULL THEN
      INSERT INTO public.infringements (
        organization_id, driver_id, vehicle_id, infringement_type_id,
        incident_date, location, description, severity, penalty_points, fine_amount,
        source, tachograph_record_id, status
      ) VALUES (
        p_organization_id, p_driver_id, p_vehicle_id, infringement_type_id,
        NOW()::date, 'Tachograph Data',
        'Rest period violation detected: ' || (p_analysis_results->>'rest_period_details')::text,
        severity, points, fine_amount, 'tachograph', p_tachograph_record_id, 'confirmed'
      );
      violations_created := violations_created + 1;
    END IF;
  END IF;
  
  -- Check for speed violations
  IF (p_analysis_results->>'speed_violation')::boolean = true THEN
    SELECT id, severity, penalty_points, fine_amount INTO infringement_type_id, severity, points, fine_amount
    FROM public.infringement_types 
    WHERE organization_id = p_organization_id 
    AND LOWER(name) LIKE '%speed%' 
    AND is_active = true
    LIMIT 1;
    
    IF infringement_type_id IS NOT NULL THEN
      INSERT INTO public.infringements (
        organization_id, driver_id, vehicle_id, infringement_type_id,
        incident_date, location, description, severity, penalty_points, fine_amount,
        source, tachograph_record_id, status
      ) VALUES (
        p_organization_id, p_driver_id, p_vehicle_id, infringement_type_id,
        NOW()::date, 'Tachograph Data',
        'Speed violation detected: Max speed ' || (p_analysis_results->>'max_speed_recorded')::text || ' km/h',
        severity, points, fine_amount, 'tachograph', p_tachograph_record_id, 'confirmed'
      );
      violations_created := violations_created + 1;
    END IF;
  END IF;
  
  -- Check for card insertion violations
  IF (p_analysis_results->>'card_insertion_violation')::boolean = true THEN
    SELECT id, severity, penalty_points, fine_amount INTO infringement_type_id, severity, points, fine_amount
    FROM public.infringement_types 
    WHERE organization_id = p_organization_id 
    AND (LOWER(name) LIKE '%card%' OR LOWER(name) LIKE '%insertion%')
    AND is_active = true
    LIMIT 1;
    
    IF infringement_type_id IS NOT NULL THEN
      INSERT INTO public.infringements (
        organization_id, driver_id, vehicle_id, infringement_type_id,
        incident_date, location, description, severity, penalty_points, fine_amount,
        source, tachograph_record_id, status
      ) VALUES (
        p_organization_id, p_driver_id, p_vehicle_id, infringement_type_id,
        NOW()::date, 'Tachograph Data',
        'Driver card insertion violation: ' || (p_analysis_results->>'card_details')::text,
        severity, points, fine_amount, 'tachograph', p_tachograph_record_id, 'confirmed'
      );
      violations_created := violations_created + 1;
    END IF;
  END IF;
  
  RETURN violations_created;
END;
$function$;