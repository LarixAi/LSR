-- Fix vehicle organization mismatch
-- Update the vehicle to belong to the correct organization where users exist
UPDATE vehicles 
SET organization_id_new = 'aabfb0bf-b3ff-4f45-bd6f-4835193d555e'
WHERE organization_id_new = 'aaafb0bf-b3ff-4f45-bd6f-4835193d555e';