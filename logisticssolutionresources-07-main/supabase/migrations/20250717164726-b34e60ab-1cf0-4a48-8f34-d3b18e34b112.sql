-- Fix materialized view security issue
-- Enable RLS on mv_driver_performance materialized view
ALTER MATERIALIZED VIEW public.mv_driver_performance ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for mv_driver_performance materialized view
-- Only allow users to see driver performance data from their own organization
CREATE POLICY "Users can view driver performance from their organization" 
ON public.mv_driver_performance 
FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Refresh the materialized view to ensure data consistency
REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_driver_performance;