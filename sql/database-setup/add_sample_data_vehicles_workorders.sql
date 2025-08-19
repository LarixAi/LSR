-- =====================================================
-- ADD SAMPLE DATA TO NATIONAL BUS GROUP (VEHICLES & WORK ORDERS)
-- =====================================================
-- This script will add sample vehicles and work orders to the National Bus Group organization
-- Skipping parts since they already exist from previous script

DO $$
DECLARE
    national_bus_group_id UUID := 'd1ad845e-8989-4563-9691-dc1b3c86c4ce';
    sample_vehicle_id_1 UUID;
    sample_vehicle_id_2 UUID;
    sample_vehicle_id_3 UUID;
    existing_driver_id UUID;
    defect_counter INTEGER := 1;
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

    -- Get the vehicle IDs
    SELECT id INTO sample_vehicle_id_1 FROM public.vehicles WHERE vehicle_number = 'NBG-001' AND organization_id = national_bus_group_id LIMIT 1;
    SELECT id INTO sample_vehicle_id_2 FROM public.vehicles WHERE vehicle_number = 'NBG-002' AND organization_id = national_bus_group_id LIMIT 1;
    SELECT id INTO sample_vehicle_id_3 FROM public.vehicles WHERE vehicle_number = 'NBG-003' AND organization_id = national_bus_group_id LIMIT 1;

    -- Get an existing driver ID from the organization (or use a default)
    SELECT id INTO existing_driver_id FROM public.profiles 
    WHERE organization_id = national_bus_group_id AND role = 'driver' 
    LIMIT 1;

    -- If no driver exists, we'll use NULL for reported_by
    IF existing_driver_id IS NULL THEN
        RAISE NOTICE 'No existing drivers found, work orders will have NULL reported_by';
    END IF;

    -- 2. ADD SAMPLE WORK ORDERS (DEFECT REPORTS) WITH CORRECT STATUS VALUES
    INSERT INTO public.defect_reports (
        id,
        defect_number,
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
    (gen_random_uuid(), 'DEF-' || LPAD(defect_counter::text, 6, '0'), national_bus_group_id, 'Engine Warning Light', 'Check engine light is on, possible sensor issue', sample_vehicle_id_1, 'electrical', 'medium', 'medium', 'reported', 'Engine Bay', 150.00, 2.0, 'Driver reported warning light during morning route', existing_driver_id),
    (gen_random_uuid(), 'DEF-' || LPAD((defect_counter + 1)::text, 6, '0'), national_bus_group_id, 'Brake Pad Replacement', 'Front brake pads need replacement, squeaking noise', sample_vehicle_id_2, 'mechanical', 'high', 'high', 'repairing', 'Front Wheels', 200.00, 3.0, 'Safety critical - needs immediate attention', existing_driver_id),
    (gen_random_uuid(), 'DEF-' || LPAD((defect_counter + 2)::text, 6, '0'), national_bus_group_id, 'Air Conditioning Fault', 'AC not cooling properly, possible refrigerant leak', sample_vehicle_id_3, 'mechanical', 'medium', 'medium', 'investigating', 'HVAC System', 300.00, 4.0, 'Passenger comfort issue', existing_driver_id),
    (gen_random_uuid(), 'DEF-' || LPAD((defect_counter + 3)::text, 6, '0'), national_bus_group_id, 'Tire Pressure Sensor', 'Tire pressure warning light on dashboard', sample_vehicle_id_1, 'electrical', 'low', 'low', 'resolved', 'Wheels', 50.00, 1.0, 'Sensor replaced, all tires checked', existing_driver_id),
    (gen_random_uuid(), 'DEF-' || LPAD((defect_counter + 4)::text, 6, '0'), national_bus_group_id, 'Fuel Gauge Inaccurate', 'Fuel gauge showing incorrect readings', sample_vehicle_id_2, 'electrical', 'medium', 'medium', 'reported', 'Fuel Tank', 100.00, 2.0, 'Driver cannot rely on fuel gauge', existing_driver_id);

    RAISE NOTICE 'Added sample data to National Bus Group organization';
    RAISE NOTICE 'Vehicles: NBG-001, NBG-002, NBG-003';
    RAISE NOTICE 'Work Orders: 5 defect reports added (DEF-000001 to DEF-000005)';

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

-- 5. SHOW SAMPLE WORK ORDERS
SELECT 
    'Sample work orders' as check_type,
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

-- 6. SHOW EXISTING PARTS
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
-- SAMPLE DATA ADDED (VEHICLES & WORK ORDERS)
-- =====================================================
-- The mechanic should now see vehicles, work orders, and parts when they select National Bus Group
-- Try refreshing the page and selecting the organization
