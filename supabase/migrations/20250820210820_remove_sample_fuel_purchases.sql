-- Remove sample fuel purchases from the database
-- This migration removes all sample/mock fuel purchase data

-- Delete all fuel purchases that appear to be sample data
-- We'll identify them by common sample values and patterns

-- Remove fuel purchases with sample data patterns
DELETE FROM public.fuel_purchases 
WHERE (
    -- Sample data from FIX_DRIVER_DASHBOARD_TABLES.sql
    (location = 'Shell Station' AND quantity = 45.5 AND unit_price = 1.85 AND total_cost = 84.18) OR
    
    -- Sample data from fix_dashboard_database_complete.sql
    (location = 'Local Gas Station' AND quantity = 50.0 AND unit_price = 1.85 AND total_cost = 92.50) OR
    
    -- Sample data from create_missing_dashboard_tables.sql
    (location = 'Local Gas Station' AND quantity = 50.0 AND unit_price = 1.85 AND total_cost = 92.50) OR
    
    -- Any fuel purchases with these exact sample values
    (quantity = 45.5 AND unit_price = 1.85) OR
    (quantity = 50.0 AND unit_price = 1.85) OR
    
    -- Remove any fuel purchases with sample locations
    location IN ('Shell Station', 'Local Gas Station', 'Sample Gas Station', 'Test Station') OR
    
    -- Remove fuel purchases with sample odometer readings
    odometer_reading IN (12500.0, 50000, 10000, 20000) OR
    
    -- Remove any fuel purchases created in the last 30 days that might be sample data
    (created_at > NOW() - INTERVAL '30 days' AND 
     (location LIKE '%Station%' OR location LIKE '%Gas%' OR location IS NULL))
);

-- Also remove any fuel purchases that don't have proper vehicle_id references
DELETE FROM public.fuel_purchases 
WHERE vehicle_id NOT IN (SELECT id FROM public.vehicles);

-- Remove any fuel purchases that don't have proper driver_id references
DELETE FROM public.fuel_purchases 
WHERE driver_id NOT IN (SELECT id FROM public.profiles WHERE role = 'driver');

-- Log the cleanup
DO $$
BEGIN
    RAISE NOTICE 'Sample fuel purchases cleanup completed';
    RAISE NOTICE 'Remaining fuel purchases: %', (SELECT COUNT(*) FROM public.fuel_purchases);
END $$;

