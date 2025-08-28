-- Fix inventory system database issues
-- 1. Fix the min_quantity column type issue
ALTER TABLE public.inventory_items 
DROP COLUMN IF EXISTS min_quantity CASCADE;

ALTER TABLE public.inventory_items 
ADD COLUMN min_quantity INTEGER NOT NULL DEFAULT 5;

-- 2. Fix foreign key relationship for inventory_transactions
-- Make sure performed_by references profiles table
ALTER TABLE public.inventory_transactions 
DROP CONSTRAINT IF EXISTS inventory_transactions_performed_by_fkey;

ALTER TABLE public.inventory_transactions 
ADD CONSTRAINT inventory_transactions_performed_by_fkey 
FOREIGN KEY (performed_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3. Ensure item_id references inventory_items properly
ALTER TABLE public.inventory_transactions 
DROP CONSTRAINT IF EXISTS inventory_transactions_item_id_fkey;

ALTER TABLE public.inventory_transactions 
ADD CONSTRAINT inventory_transactions_item_id_fkey 
FOREIGN KEY (item_id) REFERENCES public.inventory_items(id) ON DELETE CASCADE;

-- 4. Fix the low stock items function
CREATE OR REPLACE FUNCTION public.get_low_stock_items_fixed(org_id uuid)
RETURNS TABLE(
  id uuid,
  name text,
  category text,
  quantity integer,
  min_quantity integer,
  unit text,
  cost_per_unit numeric,
  supplier text,
  location text,
  description text,
  organization_id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    inventory_items.id,
    inventory_items.name,
    inventory_items.category,
    inventory_items.quantity,
    inventory_items.min_quantity,
    inventory_items.unit,
    inventory_items.cost_per_unit,
    inventory_items.supplier,
    inventory_items.location,
    inventory_items.description,
    inventory_items.organization_id,
    inventory_items.created_at,
    inventory_items.updated_at
  FROM public.inventory_items
  WHERE inventory_items.organization_id = org_id
    AND inventory_items.quantity <= inventory_items.min_quantity
  ORDER BY inventory_items.quantity ASC;
$$;