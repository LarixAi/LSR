-- =====================================================
-- STEP 1: ADD ORGANIZATION_ID TO PARTS_INVENTORY
-- =====================================================
-- This script ONLY adds the organization_id column
-- Run this first, then run the main integration script

-- Add organization_id if it doesn't exist
DO $$
BEGIN
    -- Add organization_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'parts_inventory' 
        AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE public.parts_inventory 
        ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
        
        -- Update existing parts to assign them to the default organization
        UPDATE public.parts_inventory 
        SET organization_id = (
            SELECT id FROM public.organizations 
            WHERE name = 'ABC Transport Ltd' 
            LIMIT 1
        )
        WHERE organization_id IS NULL;
        
        -- Make organization_id NOT NULL after populating
        ALTER TABLE public.parts_inventory 
        ALTER COLUMN organization_id SET NOT NULL;
        
        RAISE NOTICE 'Successfully added organization_id column to parts_inventory table';
    ELSE
        RAISE NOTICE 'organization_id column already exists in parts_inventory table';
    END IF;

    -- Add max_quantity if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'parts_inventory' 
        AND column_name = 'max_quantity'
    ) THEN
        ALTER TABLE public.parts_inventory 
        ADD COLUMN max_quantity INTEGER DEFAULT 1000;
        RAISE NOTICE 'Successfully added max_quantity column to parts_inventory table';
    ELSE
        RAISE NOTICE 'max_quantity column already exists in parts_inventory table';
    END IF;

    -- Add discontinued status if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'parts_inventory' 
        AND column_name = 'discontinued'
    ) THEN
        ALTER TABLE public.parts_inventory 
        ADD COLUMN discontinued BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Successfully added discontinued column to parts_inventory table';
    ELSE
        RAISE NOTICE 'discontinued column already exists in parts_inventory table';
    END IF;
END $$;

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'parts_inventory' 
AND column_name IN ('organization_id', 'max_quantity', 'discontinued')
ORDER BY column_name;
