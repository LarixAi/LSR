-- Check Vehicle Assignment Issue
-- This script will diagnose and fix the vehicle assignment problem

-- First, let's check what data exists
DO $$
DECLARE
    current_driver_id uuid;
    current_org_id uuid;
    vehicle_count integer;
    assignment_count integer;
BEGIN
    -- Get the current authenticated user's ID and organization
    SELECT id, organization_id INTO current_driver_id, current_org_id
    FROM public.profiles
    WHERE id = auth.uid();

    -- If no driver found, use the first driver in the system
    IF current_driver_id IS NULL THEN
        SELECT id, organization_id INTO current_driver_id, current_org_id
        FROM public.profiles
        WHERE role = 'driver'
        LIMIT 1;
    END IF;

    RAISE NOTICE 'Checking data for driver: %', current_driver_id;

    -- Check vehicles count
    SELECT COUNT(*) INTO vehicle_count
    FROM public.vehicles
    WHERE organization_id = current_org_id;

    RAISE NOTICE 'Vehicles in organization: %', vehicle_count;

    -- Check assignments count
    SELECT COUNT(*) INTO assignment_count
    FROM public.driver_vehicle_assignments
    WHERE driver_id = current_driver_id;

    RAISE NOTICE 'Assignments for driver: %', assignment_count;

    -- If no vehicles exist, create one
    IF vehicle_count = 0 THEN
        RAISE NOTICE 'No vehicles found. Creating a sample vehicle...';
        
        INSERT INTO public.vehicles (
            organization_id,
            vehicle_number,
            license_plate,
            make,
            model,
            year,
            fuel_level,
            status
        )
        VALUES (
            current_org_id,
            'VH001',
            'AB12 CDE',
            'Mercedes-Benz',
            'Sprinter',
            2022,
            75.5,
            'available'
        );
        
        RAISE NOTICE 'Sample vehicle created successfully';
    END IF;

    -- If no assignments exist, create one
    IF assignment_count = 0 THEN
        RAISE NOTICE 'No assignments found. Creating a sample assignment...';
        
        -- Get the first available vehicle
        DECLARE
            available_vehicle_id uuid;
        BEGIN
            SELECT id INTO available_vehicle_id
            FROM public.vehicles
            WHERE organization_id = current_org_id
            AND status = 'available'
            LIMIT 1;

            IF available_vehicle_id IS NOT NULL THEN
                INSERT INTO public.driver_vehicle_assignments (
                    driver_id,
                    vehicle_id,
                    organization_id,
                    status
                )
                VALUES (
                    current_driver_id,
                    available_vehicle_id,
                    current_org_id,
                    'active'
                );
                
                RAISE NOTICE 'Assignment created successfully for vehicle: %', available_vehicle_id;
            ELSE
                RAISE NOTICE 'No available vehicles found for assignment';
            END IF;
        END;
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error checking vehicle assignment: %', SQLERRM;
END $$;