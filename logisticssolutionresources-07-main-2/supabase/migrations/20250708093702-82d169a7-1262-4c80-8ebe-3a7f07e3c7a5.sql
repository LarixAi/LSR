-- Update driver employment status to active so they can access vehicles
UPDATE profiles 
SET employment_status = 'active' 
WHERE id = '58c6506d-297d-4891-a452-777ab3704781' 
AND role = 'driver';