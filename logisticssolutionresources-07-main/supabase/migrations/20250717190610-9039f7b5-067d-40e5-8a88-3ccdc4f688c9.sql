-- Clear all sample/test data from the application

-- Clear incidents table
DELETE FROM public.incidents;

-- Clear any sample vehicles if they exist  
DELETE FROM public.vehicles WHERE make = 'Sample' OR model LIKE '%Sample%' OR vehicle_number LIKE 'SAMPLE%';

-- Clear any sample customer bookings
DELETE FROM public.customer_bookings WHERE pickup_location LIKE '%Sample%' OR dropoff_location LIKE '%Sample%';

-- Clear any sample notifications
DELETE FROM public.enhanced_notifications WHERE title LIKE '%Sample%' OR body LIKE '%Sample%';

-- Clear any sample compliance alerts
DELETE FROM public.compliance_alerts WHERE title LIKE '%Sample%' OR description LIKE '%Sample%';

-- Clear any sample compliance violations
DELETE FROM public.compliance_violations WHERE description LIKE '%Sample%';

-- Clear any sample driver assignments for sample vehicles
DELETE FROM public.driver_assignments WHERE vehicle_id IN (
  SELECT id FROM public.vehicles WHERE make = 'Sample' OR model LIKE '%Sample%'
);