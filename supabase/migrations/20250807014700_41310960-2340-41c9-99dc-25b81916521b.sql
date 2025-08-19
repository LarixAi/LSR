-- Add RLS policies for vehicle_inspections table
CREATE POLICY "Organization members can view vehicle inspections" 
ON public.vehicle_inspections 
FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Drivers can view their own inspections" 
ON public.vehicle_inspections 
FOR SELECT 
USING (driver_id = auth.uid());

CREATE POLICY "Organization staff can manage vehicle inspections" 
ON public.vehicle_inspections 
FOR ALL 
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'council', 'driver', 'mechanic')
  )
);

-- Add RLS policies for inspection_questions table
CREATE POLICY "Users can view inspection questions" 
ON public.inspection_questions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.vehicle_inspections vi
    WHERE vi.id = inspection_questions.inspection_id
    AND (
      vi.driver_id = auth.uid() 
      OR vi.organization_id IN (
        SELECT organization_id 
        FROM public.profiles 
        WHERE id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Users can manage inspection questions" 
ON public.inspection_questions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.vehicle_inspections vi
    WHERE vi.id = inspection_questions.inspection_id
    AND vi.organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'council', 'driver', 'mechanic')
    )
  )
);

-- Add RLS policies for inspection_question_templates table
CREATE POLICY "Organization members can view inspection templates" 
ON public.inspection_question_templates 
FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Organization admins can manage inspection templates" 
ON public.inspection_question_templates 
FOR ALL 
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'council')
  )
);