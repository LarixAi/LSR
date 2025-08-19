-- =====================================================
-- ADD SAMPLE DATA TO NATIONAL BUS GROUP (VEHICLES & PARTS ONLY)
-- =====================================================
-- This script will add sample vehicles and parts to the National Bus Group organization
-- We'll skip defect_reports until we know the correct status values

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

    -- 2. ADD SAMPLE PARTS INVENTORY
    INSERT INTO public.parts_inventory (
        id,
        organization_id,
        part_number,
        name,
        description,
        category,
        quantity,
        min_quantity,
        max_quantity,
        unit_price,
        supplier,
        location,
        status
    ) VALUES 
    (gen_random_uuid(), national_bus_group_id, 'ENG-001', 'Engine Oil Filter', 'High-quality engine oil filter', 'engine', 25, 5, 50, 12.99, 'AutoParts Ltd', 'Warehouse A - Shelf 1', 'in_stock'),
    (gen_random_uuid(), national_bus_group_id, 'BRK-001', 'Brake Pads Set', 'Front brake pads for commercial vehicles', 'brakes', 8, 3, 20, 45.99, 'BrakeTech', 'Warehouse A - Shelf 2', 'low_stock'),
    (gen_random_uuid(), national_bus_group_id, 'ELC-001', 'Battery 12V', 'Heavy-duty 12V battery', 'electrical', 3, 2, 10, 89.99, 'PowerSource', 'Warehouse B - Shelf 1', 'low_stock'),
    (gen_random_uuid(), national_bus_group_id, 'TIR-001', 'Tire 275/70R22.5', 'All-season tire for commercial vehicles', 'tires', 12, 4, 20, 199.99, 'TireWorld', 'Warehouse C - Shelf 1', 'in_stock'),
    (gen_random_uuid(), national_bus_group_id, 'FLU-001', 'Engine Oil 15W-40', 'Synthetic engine oil for diesel engines', 'fluids', 15, 10, 30, 24.99, 'OilCo', 'Warehouse A - Shelf 3', 'in_stock');

    RAISE NOTICE 'Added sample data to National Bus Group organization';
    RAISE NOTICE 'Vehicles: NBG-001, NBG-002, NBG-003';
    RAISE NOTICE 'Parts: 5 inventory items added';

END $$;

-- 3. VERIFY THE DATA WAS ADDED
SELECT 
    'Verification' as check_type,
    'Vehicles' as data_type,
    COUNT(*) as count
FROM public.vehicles 
WHERE organization_id = 'd1ad845e-8989-4563-9691-dc1b3c86c4ce'
UNION ALL
SELECT 
    'Verification' as check_type,
    'Parts' as data_type,
    COUNT(*) as count
FROM public.parts_inventory 
WHERE organization_id = 'd1ad845e-8989-4563-9691-dc1b3c86c4ce';

-- 4. SHOW SAMPLE VEHICLES
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

-- 5. SHOW SAMPLE PARTS
SELECT 
    'Sample parts' as check_type,
    part_number,
    name,
    category,
    quantity,
    status,
    unit_price
FROM public.parts_inventory 
WHERE organization_id = 'd1ad845e-8989-4563-9691-dc1b3c86c4ce'
ORDER BY part_number;

-- 6. CHECK DEFECT_REPORTS STATUS CONSTRAINT
SELECT 
    'defect_reports status constraint' as check_type,
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_schema = 'public'
AND constraint_name LIKE '%defect%';

-- =====================================================
-- SAMPLE DATA ADDED (VEHICLES & PARTS ONLY)
-- =====================================================
-- The mechanic should now see vehicles and parts when they select National Bus Group
-- We'll add defect_reports once we know the correct status values
