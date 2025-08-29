
-- Check existing driver assignments
SELECT 
  da.*,
  p.first_name,
  p.last_name,
  p.email,
  r.name as route_name,
  v.vehicle_number
FROM driver_assignments da
LEFT JOIN profiles p ON da.driver_id = p.id
LEFT JOIN routes r ON da.route_id = r.id
LEFT JOIN vehicles v ON da.vehicle_id = v.id
ORDER BY da.created_at DESC;

-- Check routes
SELECT id, name, transport_company, route_number, is_active FROM routes;

-- Check if we have any vehicles
SELECT id, vehicle_number, license_plate FROM vehicles LIMIT 5;
