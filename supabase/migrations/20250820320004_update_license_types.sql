-- =====================================================
-- UPDATE LICENSE TYPE CONSTRAINT
-- =====================================================

-- Drop the existing constraint
ALTER TABLE public.driver_licenses 
DROP CONSTRAINT IF EXISTS driver_licenses_license_type_check;

-- Add the new constraint with all license types
ALTER TABLE public.driver_licenses 
ADD CONSTRAINT driver_licenses_license_type_check 
CHECK (license_type IN (
    -- Commercial Driver Licenses (CDL)
    'CDL-A', 'CDL-B', 'CDL-C',
    
    -- Regular Driver Licenses
    'Regular', 'Provisional', 'Learner',
    
    -- International Licenses
    'International', 'International-Permit',
    
    -- Specialized Licenses
    'Motorcycle', 'Motorcycle-A', 'Motorcycle-A1', 'Motorcycle-A2',
    
    -- Heavy Vehicle Licenses
    'Heavy-Vehicle', 'Heavy-Vehicle-C1', 'Heavy-Vehicle-C', 'Heavy-Vehicle-C+E',
    
    -- Bus and Coach Licenses
    'Bus-D1', 'Bus-D', 'Bus-D+E', 'Coach', 'School-Bus',
    
    -- Specialized Transport
    'Hazmat', 'Tanker', 'Passenger', 'Chauffeur', 'Taxi', 'Private-Hire',
    
    -- Agricultural and Specialized
    'Agricultural', 'Tractor', 'Forklift', 'Crane',
    
    -- Military and Emergency
    'Military', 'Emergency', 'Police', 'Fire', 'Ambulance',
    
    -- Other Specialized
    'Disabled', 'Student', 'Temporary', 'Replacement', 'Duplicate'
));

