-- =====================================================
-- CHECK NATIONAL BUS GROUP DATA
-- =====================================================
-- This script will check what data exists in the National Bus Group organization

-- 1. CHECK ORGANIZATION DETAILS
SELECT 
    'Organization details' as check_type,
    id,
    name,
    slug,
    created_at
FROM public.organizations 
WHERE name = 'National Bus Group';

-- 2. CHECK VEHICLES IN NATIONAL BUS GROUP
SELECT 
    'Vehicles in National Bus Group' as check_type,
    COUNT(*) as total_vehicles,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_vehicles,
    COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenance_vehicles,
    COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_vehicles
FROM public.vehicles 
WHERE organization_id = 'd1ad845e-8989-4563-9691-dc1b3c86c4ce';

-- 3. CHECK DRIVERS IN NATIONAL BUS GROUP
SELECT 
    'Drivers in National Bus Group' as check_type,
    COUNT(*) as total_drivers,
    COUNT(CASE WHEN employment_status = 'active' THEN 1 END) as active_drivers,
    COUNT(CASE WHEN employment_status = 'inactive' THEN 1 END) as inactive_drivers
FROM public.profiles 
WHERE organization_id = 'd1ad845e-8989-4563-9691-dc1b3c86c4ce'
AND role = 'driver';

-- 4. CHECK WORK ORDERS/DEFECT REPORTS IN NATIONAL BUS GROUP
SELECT 
    'Work orders in National Bus Group' as check_type,
    COUNT(*) as total_work_orders,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_orders,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders
FROM public.defect_reports 
WHERE organization_id = 'd1ad845e-8989-4563-9691-dc1b3c86c4ce';

-- 5. CHECK VEHICLE INSPECTIONS IN NATIONAL BUS GROUP (FIXED COLUMN NAME)
SELECT 
    'Vehicle inspections in National Bus Group' as check_type,
    COUNT(*) as total_inspections,
    COUNT(CASE WHEN status = 'passed' THEN 1 END) as passed_inspections,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_inspections,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_inspections
FROM public.vehicle_inspections 
WHERE organization_id = 'd1ad845e-8989-4563-9691-dc1b3c86c4ce';

-- 6. CHECK PARTS INVENTORY IN NATIONAL BUS GROUP
SELECT 
    'Parts inventory in National Bus Group' as check_type,
    COUNT(*) as total_parts,
    COUNT(CASE WHEN status = 'in_stock' THEN 1 END) as in_stock_parts,
    COUNT(CASE WHEN status = 'low_stock' THEN 1 END) as low_stock_parts,
    COUNT(CASE WHEN status = 'out_of_stock' THEN 1 END) as out_of_stock_parts
FROM public.parts_inventory 
WHERE organization_id = 'd1ad845e-8989-4563-9691-dc1b3c86c4ce';

-- 7. CHECK INCIDENTS IN NATIONAL BUS GROUP
SELECT 
    'Incidents in National Bus Group' as check_type,
    COUNT(*) as total_incidents,
    COUNT(CASE WHEN status = 'open' THEN 1 END) as open_incidents,
    COUNT(CASE WHEN status = 'investigating' THEN 1 END) as investigating_incidents,
    COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_incidents
FROM public.incidents 
WHERE organization_id = 'd1ad845e-8989-4563-9691-dc1b3c86c4ce';

-- 8. SAMPLE VEHICLES (if any exist)
SELECT 
    'Sample vehicles' as check_type,
    id,
    vehicle_number,
    make,
    model,
    license_plate,
    status,
    created_at
FROM public.vehicles 
WHERE organization_id = 'd1ad845e-8989-4563-9691-dc1b3c86c4ce'
ORDER BY created_at DESC
LIMIT 5;

-- 9. SAMPLE DRIVERS (if any exist)
SELECT 
    'Sample drivers' as check_type,
    id,
    first_name,
    last_name,
    email,
    employment_status,
    created_at
FROM public.profiles 
WHERE organization_id = 'd1ad845e-8989-4563-9691-dc1b3c86c4ce'
AND role = 'driver'
ORDER BY created_at DESC
LIMIT 5;

-- 10. SAMPLE WORK ORDERS (if any exist)
SELECT 
    'Sample work orders' as check_type,
    id,
    title,
    description,
    defect_type,
    severity,
    status,
    created_at
FROM public.defect_reports 
WHERE organization_id = 'd1ad845e-8989-4563-9691-dc1b3c86c4ce'
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- CHECK COMPLETE
-- =====================================================
-- This will show us what data exists in the National Bus Group organization
-- If all counts are 0, that's why the mechanic sees no data
