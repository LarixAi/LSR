-- =====================================================
-- ADD SAMPLE DATA TO NATIONAL BUS GROUP (SIMPLE VERSION)
-- =====================================================
-- This script will add sample data to the National Bus Group organization
-- using a simpler approach that handles table structure issues

DO $$
DECLARE
    national_bus_group_id UUID := 'd1ad845e-8989-4563-9691-dc1b3c86c4ce';
    sample_vehicle_id_1 UUID;
    sample_vehicle_id_2 UUID;
    sample_vehicle_id_3 UUID;
    sample_driver_id_1 UUID;
    sample_driver_id_2 UUID;
    sample_driver_id_3 UUID;
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

    -- 2. ADD SAMPLE DRIVERS (with proper ID generation)
    INSERT INTO public.profiles (
        id,
        email,
        first_name,
        last_name,
        role,
        organization_id,
        employment_status,
        onboarding_status,
        phone,
        employee_id
    ) VALUES 
    (gen_random_uuid(), 'driver1@nationalbusgroup.co.uk', 'John', 'Smith', 'driver', national_bus_group_id, 'active', 'completed', '+44 7700 900001', 'NBG-DR-001'),
    (gen_random_uuid(), 'driver2@nationalbusgroup.co.uk', 'Sarah', 'Johnson', 'driver', national_bus_group_id, 'active', 'completed', '+44 7700 900002', 'NBG-DR-002'),
    (gen_random_uuid(), 'driver3@nationalbusgroup.co.uk', 'Michael', 'Brown', 'driver', national_bus_group_id, 'active', 'completed', '+44 7700 900003', 'NBG-DR-003');

    -- Get the vehicle IDs
    SELECT id INTO sample_vehicle_id_1 FROM public.vehicles WHERE vehicle_number = 'NBG-001' AND organization_id = national_bus_group_id LIMIT 1;
    SELECT id INTO sample_vehicle_id_2 FROM public.vehicles WHERE vehicle_number = 'NBG-002' AND organization_id = national_bus_group_id LIMIT 1;
    SELECT id INTO sample_vehicle_id_3 FROM public.vehicles WHERE vehicle_number = 'NBG-003' AND organization_id = national_bus_group_id LIMIT 1;

    -- Get the driver IDs
    SELECT id INTO sample_driver_id_1 FROM public.profiles WHERE email = 'driver1@nationalbusgroup.co.uk' AND organization_id = national_bus_group_id LIMIT 1;
    SELECT id INTO sample_driver_id_2 FROM public.profiles WHERE email = 'driver2@nationalbusgroup.co.uk' AND organization_id = national_bus_group_id LIMIT 1;
    SELECT id INTO sample_driver_id_3 FROM public.profiles WHERE email = 'driver3@nationalbusgroup.co.uk' AND organization_id = national_bus_group_id LIMIT 1;

    -- 3. ADD SAMPLE WORK ORDERS (DEFECT REPORTS)
    INSERT INTO public.defect_reports (
        id,
        organization_id,
        title,
        description,
        vehicle_id,
        defect_type,
        severity,
        priority,
        status,
        location,
        estimated_cost,
        estimated_hours,
        work_notes,
        reported_by
    ) VALUES 
    (gen_random_uuid(), national_bus_group_id, 'Engine Warning Light', 'Check engine light is on, possible sensor issue', sample_vehicle_id_1, 'electrical', 'medium', 'medium', 'pending', 'Engine Bay', 150.00, 2.0, 'Driver reported warning light during morning route', sample_driver_id_1),
    (gen_random_uuid(), national_bus_group_id, 'Brake Pad Replacement', 'Front brake pads need replacement, squeaking noise', sample_vehicle_id_2, 'brakes', 'high', 'high', 'in_progress', 'Front Wheels', 200.00, 3.0, 'Safety critical - needs immediate attention', sample_driver_id_2),
    (gen_random_uuid(), national_bus_group_id, 'Air Conditioning Fault', 'AC not cooling properly, possible refrigerant leak', sample_vehicle_id_3, 'hvac', 'medium', 'medium', 'pending', 'HVAC System', 300.00, 4.0, 'Passenger comfort issue', sample_driver_id_3),
    (gen_random_uuid(), national_bus_group_id, 'Tire Pressure Sensor', 'Tire pressure warning light on dashboard', sample_vehicle_id_1, 'electrical', 'low', 'low', 'completed', 'Wheels', 50.00, 1.0, 'Sensor replaced, all tires checked', sample_driver_id_1),
    (gen_random_uuid(), national_bus_group_id, 'Fuel Gauge Inaccurate', 'Fuel gauge showing incorrect readings', sample_vehicle_id_2, 'electrical', 'medium', 'medium', 'pending', 'Fuel Tank', 100.00, 2.0, 'Driver cannot rely on fuel gauge', sample_driver_id_2);

    -- 4. ADD SAMPLE PARTS INVENTORY
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
    RAISE NOTICE 'Drivers: John Smith, Sarah Johnson, Michael Brown';
    RAISE NOTICE 'Work Orders: 5 defect reports added';
    RAISE NOTICE 'Parts: 5 inventory items added';

END $$;

-- 5. VERIFY THE DATA WAS ADDED
SELECT 
    'Verification' as check_type,
    'Vehicles' as data_type,
    COUNT(*) as count
FROM public.vehicles 
WHERE organization_id = 'd1ad845e-8989-4563-9691-dc1b3c86c4ce'
UNION ALL
SELECT 
    'Verification' as check_type,
    'Drivers' as data_type,
    COUNT(*) as count
FROM public.profiles 
WHERE organization_id = 'd1ad845e-8989-4563-9691-dc1b3c86c4ce'
AND role = 'driver'
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

-- =====================================================
-- SAMPLE DATA ADDED
-- =====================================================
-- The mechanic should now see data when they select National Bus Group
-- Try refreshing the page and selecting the organization
