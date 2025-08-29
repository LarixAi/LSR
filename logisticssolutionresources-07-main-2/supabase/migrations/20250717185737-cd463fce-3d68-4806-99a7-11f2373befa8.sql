-- Clear all sample/test data from the application

-- Clear incidents table
DELETE FROM public.incidents;

-- Clear any sample vehicles if they exist
DELETE FROM public.vehicles WHERE make = 'Sample' OR model LIKE '%Sample%' OR vehicle_number LIKE 'SAMPLE%';

-- Clear any sample jobs
DELETE FROM public.jobs WHERE pickup_location LIKE '%Sample%' OR dropoff_location LIKE '%Sample%';

-- Clear any sample customer bookings
DELETE FROM public.customer_bookings WHERE pickup_location LIKE '%Sample%' OR dropoff_location LIKE '%Sample%';

-- Clear any sample notifications
DELETE FROM public.enhanced_notifications WHERE title LIKE '%Sample%' OR body LIKE '%Sample%';

-- Clear any sample driver assignments
DELETE FROM public.driver_assignments WHERE id IN (
  SELECT da.id FROM public.driver_assignments da
  JOIN public.vehicles v ON da.vehicle_id = v.id
  WHERE v.make = 'Sample' OR v.model LIKE '%Sample%'
);

-- Clear any sample profiles that might be test data (be careful with this)
-- Only remove profiles that are clearly test data
DELETE FROM public.profiles WHERE 
  email LIKE '%test%' OR 
  email LIKE '%sample%' OR 
  first_name = 'Sample' OR 
  last_name = 'Sample';

-- Reset any sequences if needed
-- This ensures new records start with clean IDs