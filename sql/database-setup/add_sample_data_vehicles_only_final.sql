-- =====================================================
-- ADD SAMPLE DATA TO NATIONAL BUS GROUP (VEHICLES ONLY - FINAL)
-- =====================================================
-- This script will add sample vehicles to the National Bus Group organization
-- Parts and defect reports already exist from previous scripts

DO $$
DECLARE
    national_bus_group_id UUID := 'd1ad845e-8989-4563-9691-dc1b3c86c4ce';
BEGIN
    -- 1. ADD SAMPLE VEHICLES (with proper ID generation)
    INSERT INTO public.vehicles (
        id,
        organization_id,
        vehicle_number,
        make,
        model,
        year,
        license_plate,
        vehicle_type,
        status,
        fuel_level,
        last_maintenance_date,
        next_maintenance_date
    ) VALUES 
    (gen_random_uuid(), national_bus_group_id, 'NBG-001', 'Mercedes-Benz', 'Sprinter', 2022, 'NBG 001A', 'passenger', 'active', 85, '2025-07-15', '2025-09-15'),
    (gen_random_uuid(), national_bus_group_id, 'NBG-002', 'Ford', 'Transit', 2021, 'NBG 002B', 'passenger', 'active', 65, '2025-08-01', '2025-10-01'),
    (gen_random_uuid(), national_bus_group_id, 'NBG-003', 'Volkswagen', 'Crafter', 2023, 'NBG 003C', 'passenger', 'maintenance', 45, '2025-06-20', '2025-08-20');

    RAISE NOTICE 'Added sample vehicles to National Bus Group organization';
    RAISE NOTICE 'Vehicles: NBG-001, NBG-002, NBG-003';

END $$;

-- 2. VERIFY THE DATA WAS ADDED
SELECT 
    'Verification' as check_type,
    'Vehicles' as data_type,
    COUNT(*) as count
FROM public.vehicles 
WHERE organization_id = 'd1ad845e-8989-4563-9691-dc1b3c86c4ce'
UNION ALL
SELECT 
    'Verification' as check_type,
    'Work Orders' as data_type,
    COUNT(*) as count
FROM public.defect_reports 
WHERE organization_id = 'd1ad845e-8989-4563-9691-dc1b3c86c4ce'
UNION ALL
SELECT 
    'Verification' as check_type,
    'Parts' as data_type,
    COUNT(*) as count
FROM public.parts_inventory 
WHERE organization_id = 'd1ad845e-8989-4563-9691-dc1b3c86c4ce';

-- 3. SHOW SAMPLE VEHICLES
SELECT 
    'Sample vehicles' as check_type,
    vehicle_number,
    make,
    model,
    license_plate,
    status,
    fuel_level
FROM public.vehicles 
WHERE organization_id = 'd1ad845e-8989-4563-9691-dc1b3c86c4ce'
ORDER BY vehicle_number;

-- 4. SHOW EXISTING WORK ORDERS
SELECT 
    'Existing work orders' as check_type,
    defect_number,
    title,
    defect_type,
    severity,
    status,
    estimated_cost
FROM public.defect_reports 
WHERE organization_id = 'd1ad845e-8989-4563-9691-dc1b3c86c4ce'
ORDER BY created_at DESC
LIMIT 5;

-- 5. SHOW EXISTING PARTS
SELECT 
    'Existing parts' as check_type,
    part_number,
    name,
    category,
    quantity,
    status,
    unit_price
FROM public.parts_inventory 
WHERE organization_id = 'd1ad845e-8989-4563-9691-dc1b3c86c4ce'
ORDER BY part_number;

-- =====================================================
-- SAMPLE DATA ADDED (VEHICLES ONLY - FINAL)
-- =====================================================
-- The mechanic should now see vehicles, work orders, and parts when they select National Bus Group
-- Try refreshing the page and selecting the organization
