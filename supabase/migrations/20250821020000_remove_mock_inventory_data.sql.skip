-- Remove mock data from parts_inventory table
-- This migration removes sample/mock data that was inserted for testing purposes

-- Delete sample parts that were inserted by the sample data scripts
DELETE FROM public.parts_inventory 
WHERE part_number IN (
    'ENG-001',  -- Engine Oil Filter
    'BRK-001',  -- Brake Pads Set
    'ELC-001',  -- Battery 12V
    'TIR-001',  -- Tire 275/70R22.5
    'FLU-001'   -- Engine Oil 15W-40
);

-- Also remove any other sample parts that might have been added
DELETE FROM public.parts_inventory 
WHERE name LIKE '%Sample%' 
   OR name LIKE '%Test%' 
   OR name LIKE '%Mock%'
   OR description LIKE '%sample%'
   OR description LIKE '%test%'
   OR description LIKE '%mock%';

-- Remove any sample approval requests that might exist
DELETE FROM public.parts_approval_requests 
WHERE reason LIKE '%sample%' 
   OR reason LIKE '%test%' 
   OR reason LIKE '%mock%';

-- Remove any sample stock movements
DELETE FROM public.stock_movements 
WHERE notes LIKE '%sample%' 
   OR notes LIKE '%test%' 
   OR notes LIKE '%mock%';

-- Log the cleanup
DO $$
BEGIN
    RAISE NOTICE 'Mock inventory data cleanup completed';
    RAISE NOTICE 'Removed sample parts and related mock data';
END $$;

