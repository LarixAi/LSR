-- Fix the driver's organization assignment
UPDATE profiles 
SET organization_id = 'd1ad845e-8989-4563-9691-dc1b3c86c4ce' 
WHERE email = 'laronelaing1@outlook.com' AND role = 'driver';

-- Add some sample vehicles to your fleet
INSERT INTO vehicles (organization_id, vehicle_number, license_plate, make, model, year, vehicle_type, status) VALUES
('d1ad845e-8989-4563-9691-dc1b3c86c4ce', 'BUS001', 'LDN 001A', 'Mercedes', 'Citaro', 2022, 'Bus', 'active'),
('d1ad845e-8989-4563-9691-dc1b3c86c4ce', 'BUS002', 'LDN 002B', 'Volvo', 'B8RLE', 2021, 'Bus', 'active'),
('d1ad845e-8989-4563-9691-dc1b3c86c4ce', 'BUS003', 'LDN 003C', 'Alexander Dennis', 'Enviro200', 2023, 'Bus', 'maintenance'),
('d1ad845e-8989-4563-9691-dc1b3c86c4ce', 'VAN001', 'LDN 101V', 'Ford', 'Transit', 2022, 'Van', 'active'),
('d1ad845e-8989-4563-9691-dc1b3c86c4ce', 'VAN002', 'LDN 102W', 'Mercedes', 'Sprinter', 2023, 'Van', 'active');

-- Add some sample maintenance requests
INSERT INTO maintenance_requests (organization_id, vehicle_id, user_id, description, status) 
SELECT 
    'd1ad845e-8989-4563-9691-dc1b3c86c4ce',
    v.id,
    'ab16ec78-d131-428d-9538-1e33d5b7d7ce',
    'Routine brake inspection required',
    'pending'
FROM vehicles v 
WHERE v.license_plate = 'LDN 003C'
LIMIT 1;

INSERT INTO maintenance_requests (organization_id, vehicle_id, user_id, description, status) 
SELECT 
    'd1ad845e-8989-4563-9691-dc1b3c86c4ce',
    v.id,
    'ab16ec78-d131-428d-9538-1e33d5b7d7ce',
    'Air conditioning system making unusual noises',
    'pending'
FROM vehicles v 
WHERE v.license_plate = 'LDN 001A'
LIMIT 1;

-- Add a sample incident report
INSERT INTO incidents (organization_id, title, description, incident_type, severity, status, reported_by, incident_date) VALUES
('d1ad845e-8989-4563-9691-dc1b3c86c4ce', 'Minor Traffic Incident', 'Vehicle BUS001 experienced a minor bump in the depot parking area. No injuries reported.', 'accident', 'low', 'open', 'ab16ec78-d131-428d-9538-1e33d5b7d7ce', CURRENT_DATE);

-- Add some mechanics to your team
INSERT INTO mechanics (organization_id, mechanic_name, profile_id) VALUES
('d1ad845e-8989-4563-9691-dc1b3c86c4ce', 'John Smith', null),
('d1ad845e-8989-4563-9691-dc1b3c86c4ce', 'Sarah Wilson', null),
('d1ad845e-8989-4563-9691-dc1b3c86c4ce', 'Mike Johnson', null);