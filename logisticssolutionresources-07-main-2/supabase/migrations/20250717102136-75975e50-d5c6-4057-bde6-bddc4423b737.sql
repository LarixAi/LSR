-- Complete the security implementation with performance indexes
-- (without CONCURRENTLY to avoid transaction issues)

-- 1. Create optimized indexes for RLS policy performance
CREATE INDEX IF NOT EXISTS idx_vehicles_org_id_active 
ON public.vehicles (organization_id, is_active) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_vehicle_checks_vehicle_org 
ON public.vehicle_checks (vehicle_id, check_date DESC);

CREATE INDEX IF NOT EXISTS idx_driver_assignments_org_active 
ON public.driver_assignments (organization_id, is_active) 
WHERE is_active = true;

-- 2. Add audit logging for vehicle access
CREATE OR REPLACE FUNCTION public.log_vehicle_access()
RETURNS TRIGGER AS $$
BEGIN
    -- Log vehicle access for security monitoring
    PERFORM public.log_audit_trail(
        'vehicles',
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
        'Vehicle ' || TG_OP || ' operation'
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit trigger
DROP TRIGGER IF EXISTS vehicle_audit_trigger ON public.vehicles;
CREATE TRIGGER vehicle_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.vehicles
    FOR EACH ROW EXECUTE FUNCTION public.log_vehicle_access();

-- 3. Refresh the materialized view with new data
REFRESH MATERIALIZED VIEW private.mv_fleet_overview;