-- Fix the materialized view dependency first, then standardize the organization_id field

-- 1. Update the materialized view to use the correct column name
DROP MATERIALIZED VIEW IF EXISTS private.mv_fleet_overview CASCADE;

-- Recreate the materialized view with the correct column reference
CREATE MATERIALIZED VIEW private.mv_fleet_overview AS
SELECT 
    v.organization_id_new as organization_id,
    COUNT(*) as total_vehicles,
    COUNT(*) FILTER (WHERE v.status = 'active') as active_vehicles,
    COUNT(*) FILTER (WHERE v.status = 'maintenance') as in_maintenance,
    0 as maintenance_due,
    COALESCE(SUM(fc.amount) FILTER (WHERE fc.cost_type = 'maintenance'), 0) as total_maintenance_costs,
    COALESCE(AVG(v.mileage), 0) as avg_mileage
FROM public.vehicles v
LEFT JOIN public.fleet_costs fc ON v.id = fc.vehicle_id 
    AND fc.date_incurred >= CURRENT_DATE - INTERVAL '30 days'
WHERE v.organization_id_new IS NOT NULL
GROUP BY v.organization_id_new;

-- Create unique index for refresh performance
CREATE UNIQUE INDEX idx_private_mv_fleet_overview_org 
ON private.mv_fleet_overview (organization_id);

-- Recreate the secure public view
CREATE OR REPLACE VIEW public.mv_fleet_overview 
WITH (security_invoker=on) AS
SELECT * FROM private.mv_fleet_overview
WHERE organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid()
);

-- Grant access
GRANT SELECT ON public.mv_fleet_overview TO authenticated;

-- 2. Now standardize the organization ID field
ALTER TABLE public.vehicles 
DROP COLUMN IF EXISTS organization_id;

ALTER TABLE public.vehicles 
RENAME COLUMN organization_id_new TO organization_id;

-- Ensure NOT NULL constraint for data integrity
ALTER TABLE public.vehicles 
ALTER COLUMN organization_id SET NOT NULL;

-- 3. Update the materialized view to use the new column name
DROP MATERIALIZED VIEW IF EXISTS private.mv_fleet_overview CASCADE;

CREATE MATERIALIZED VIEW private.mv_fleet_overview AS
SELECT 
    v.organization_id,
    COUNT(*) as total_vehicles,
    COUNT(*) FILTER (WHERE v.status = 'active') as active_vehicles,
    COUNT(*) FILTER (WHERE v.status = 'maintenance') as in_maintenance,
    0 as maintenance_due,
    COALESCE(SUM(fc.amount) FILTER (WHERE fc.cost_type = 'maintenance'), 0) as total_maintenance_costs,
    COALESCE(AVG(v.mileage), 0) as avg_mileage
FROM public.vehicles v
LEFT JOIN public.fleet_costs fc ON v.id = fc.vehicle_id 
    AND fc.date_incurred >= CURRENT_DATE - INTERVAL '30 days'
WHERE v.organization_id IS NOT NULL
GROUP BY v.organization_id;

-- Create unique index for refresh performance
CREATE UNIQUE INDEX idx_private_mv_fleet_overview_org_final 
ON private.mv_fleet_overview (organization_id);

-- Recreate the secure public view
CREATE OR REPLACE VIEW public.mv_fleet_overview 
WITH (security_invoker=on) AS
SELECT * FROM private.mv_fleet_overview
WHERE organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid()
);

-- Grant access
GRANT SELECT ON public.mv_fleet_overview TO authenticated;