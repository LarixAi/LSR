-- Fix Smart Inspections by creating proper relationships and RLS policies

-- Check if inspection_id column exists in inspection_questions
-- If not, we need to add it and create the relationship
ALTER TABLE public.inspection_questions 
ADD COLUMN IF NOT EXISTS inspection_id UUID REFERENCES public.vehicle_inspections(id) ON DELETE CASCADE;

-- Create proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_inspection_questions_inspection_id ON public.inspection_questions(inspection_id);

-- Fix RLS policies for inspection_questions to match vehicle_inspections access patterns
DROP POLICY IF EXISTS "inspection_questions_final_service_policy" ON public.inspection_questions;

-- Allow users to view inspection questions for inspections they can access
CREATE POLICY "inspection_questions_read_access" ON public.inspection_questions
FOR SELECT 
TO authenticated
USING (
  inspection_id IN (
    SELECT id FROM public.vehicle_inspections 
    WHERE organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  )
);

-- Allow users to insert inspection questions for their own inspections
CREATE POLICY "inspection_questions_insert_access" ON public.inspection_questions
FOR INSERT 
TO authenticated
WITH CHECK (
  inspection_id IN (
    SELECT id FROM public.vehicle_inspections 
    WHERE driver_id = auth.uid()
  )
);

-- Allow drivers to update their own pending inspection questions
CREATE POLICY "inspection_questions_update_access" ON public.inspection_questions
FOR UPDATE 
TO authenticated
USING (
  inspection_id IN (
    SELECT id FROM public.vehicle_inspections 
    WHERE driver_id = auth.uid() AND overall_status = 'pending'
  )
);

-- Clean up duplicate/overly permissive policies on vehicle_inspections
DROP POLICY IF EXISTS "vehicle_inspections_delete" ON public.vehicle_inspections;
DROP POLICY IF EXISTS "vehicle_inspections_insert" ON public.vehicle_inspections;
DROP POLICY IF EXISTS "vehicle_inspections_select" ON public.vehicle_inspections;
DROP POLICY IF EXISTS "vehicle_inspections_update" ON public.vehicle_inspections;

-- Add organization_id to vehicle_inspections where missing
UPDATE public.vehicle_inspections 
SET organization_id = (
  SELECT p.organization_id 
  FROM public.profiles p 
  WHERE p.id = vehicle_inspections.driver_id
)
WHERE organization_id IS NULL;