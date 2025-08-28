-- Fix security issue with mv_fleet_overview materialized view
-- First, create private schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS private;

-- Create materialized view in private schema (rebuild with actual data structure)
CREATE MATERIALIZED VIEW private.mv_fleet_overview AS
SELECT 
    v.organization_id,
    COUNT(*) as total_vehicles,
    COUNT(*) FILTER (WHERE v.status = 'active') as active_vehicles,
    COUNT(*) FILTER (WHERE v.status = 'maintenance') as in_maintenance,
    COUNT(*) FILTER (WHERE vm.due_date <= CURRENT_DATE) as maintenance_due,
    COALESCE(SUM(fc.amount) FILTER (WHERE fc.cost_type = 'maintenance'), 0) as total_maintenance_costs,
    COALESCE(AVG(v.mileage), 0) as avg_mileage
FROM public.vehicles v
LEFT JOIN public.vehicle_maintenance vm ON v.id = vm.vehicle_id 
    AND vm.status = 'scheduled'
LEFT JOIN public.fleet_costs fc ON v.id = fc.vehicle_id 
    AND fc.date_incurred >= CURRENT_DATE - INTERVAL '30 days'
WHERE v.organization_id IS NOT NULL
GROUP BY v.organization_id;

-- Create unique index for refresh performance
CREATE UNIQUE INDEX idx_private_mv_fleet_overview_org 
ON private.mv_fleet_overview (organization_id);

-- Drop the original public materialized view
DROP MATERIALIZED VIEW IF EXISTS public.mv_fleet_overview;

-- Create a security invoker view in public schema
CREATE OR REPLACE VIEW public.mv_fleet_overview 
WITH (security_invoker=on) AS
SELECT * FROM private.mv_fleet_overview
WHERE organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid()
);

-- Revoke public access to private schema
REVOKE ALL ON private.mv_fleet_overview FROM public;
REVOKE ALL ON private.mv_fleet_overview FROM anon, authenticated;

-- Grant select on public view to authenticated users
GRANT SELECT ON public.mv_fleet_overview TO authenticated;