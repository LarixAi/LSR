-- Add question_set_id to walk_around_checks table
-- This allows us to track which question set was used for each inspection

-- Add the question_set_id column
ALTER TABLE public.walk_around_checks 
ADD COLUMN IF NOT EXISTS question_set_id UUID REFERENCES public.inspection_question_sets(id) ON DELETE SET NULL;

-- Add an index for better performance
CREATE INDEX IF NOT EXISTS idx_walk_around_checks_question_set_id 
ON public.walk_around_checks(question_set_id);

-- Add a comment to document the purpose
COMMENT ON COLUMN public.walk_around_checks.question_set_id IS 'References the question set used for this inspection. Allows tracking which custom or default question set was used.';

-- Update existing records to use the default question set if they don't have one
-- This ensures backward compatibility
UPDATE public.walk_around_checks 
SET question_set_id = (
  SELECT id 
  FROM public.inspection_question_sets 
  WHERE is_default = true 
  AND organization_id = (
    SELECT organization_id 
    FROM public.vehicles 
    WHERE id = walk_around_checks.vehicle_id
  )
  LIMIT 1
)
WHERE question_set_id IS NULL;
