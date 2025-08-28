
-- Create inventory_items table
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  cost_per_unit DECIMAL(10,2) DEFAULT 0,
  supplier TEXT,
  location TEXT,
  description TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory_transactions table
CREATE TABLE public.inventory_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('in', 'out', 'adjustment')),
  quantity INTEGER NOT NULL,
  reason TEXT NOT NULL,
  performed_by UUID NOT NULL REFERENCES auth.users(id),
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for inventory_items
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view inventory items in their organization"
  ON public.inventory_items 
  FOR SELECT 
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage inventory items in their organization"
  ON public.inventory_items 
  FOR ALL 
  USING ((organization_id = get_user_organization_id()) AND is_organization_admin());

CREATE POLICY "Mechanics can view inventory items in their organization"
  ON public.inventory_items 
  FOR SELECT 
  USING ((organization_id = get_user_organization_id()) AND (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'council', 'mechanic')
    )
  ));

-- Add RLS policies for inventory_transactions
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view inventory transactions in their organization"
  ON public.inventory_transactions 
  FOR SELECT 
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage inventory transactions in their organization"
  ON public.inventory_transactions 
  FOR ALL 
  USING ((organization_id = get_user_organization_id()) AND is_organization_admin());

CREATE POLICY "Mechanics can create inventory transactions in their organization"
  ON public.inventory_transactions 
  FOR INSERT 
  WITH CHECK ((organization_id = get_user_organization_id()) AND performed_by = auth.uid() AND (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'council', 'mechanic')
    )
  ));

-- Add updated_at trigger for inventory_items
CREATE OR REPLACE FUNCTION update_inventory_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inventory_items_updated_at
    BEFORE UPDATE ON public.inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_items_updated_at();

-- Create function to update inventory quantity based on transactions
CREATE OR REPLACE FUNCTION public.update_inventory_quantity(
  item_id UUID,
  transaction_type TEXT,
  quantity_change INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF transaction_type = 'in' THEN
    UPDATE public.inventory_items 
    SET quantity = quantity + quantity_change, updated_at = now()
    WHERE id = item_id;
  ELSIF transaction_type = 'out' THEN
    UPDATE public.inventory_items 
    SET quantity = quantity - quantity_change, updated_at = now()
    WHERE id = item_id;
  ELSIF transaction_type = 'adjustment' THEN
    UPDATE public.inventory_items 
    SET quantity = quantity_change, updated_at = now()
    WHERE id = item_id;
  END IF;
END;
$$;
