-- Add missing RLS policy for work_order_stages table
-- This table had RLS enabled but no policies after the combined_defects view was dropped

CREATE POLICY "Organization users can manage work order stages" 
ON public.work_order_stages 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.defect_reports dr 
    WHERE dr.id = work_order_stages.defect_id 
    AND dr.organization_id = get_current_user_organization_id_safe()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.defect_reports dr 
    WHERE dr.id = work_order_stages.defect_id 
    AND dr.organization_id = get_current_user_organization_id_safe()
  )
);