-- Fix security issue with mv_fleet_overview materialized view
-- Enable RLS on the materialized view
ALTER MATERIALIZED VIEW public.mv_fleet_overview SET (security_invoker = on);

-- Enable RLS on the materialized view
ALTER MATERIALIZED VIEW public.mv_fleet_overview ENABLE ROW LEVEL SECURITY;

-- Create policy to restrict access to organization members only
CREATE POLICY "Users can only view their organization fleet overview" 
ON public.mv_fleet_overview 
FOR SELECT 
USING (
    organization_id IN (
        SELECT organization_id 
        FROM public.profiles 
        WHERE id = auth.uid()
    )
);

-- Revoke public access
REVOKE ALL ON public.mv_fleet_overview FROM public;
REVOKE ALL ON public.mv_fleet_overview FROM anon, authenticated;

-- Grant select to authenticated users (policies will handle authorization)
GRANT SELECT ON public.mv_fleet_overview TO authenticated;