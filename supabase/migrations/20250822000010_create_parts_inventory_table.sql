-- Create parts_inventory table for parts management
CREATE TABLE IF NOT EXISTS public.parts_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  part_number TEXT NOT NULL,
  part_name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('engine', 'transmission', 'brakes', 'suspension', 'electrical', 'body', 'interior', 'tires', 'fluids', 'tools', 'other')),
  manufacturer TEXT,
  supplier TEXT,
  supplier_part_number TEXT,
  unit_cost DECIMAL(10,2),
  unit_price DECIMAL(10,2),
  current_stock INTEGER DEFAULT 0,
  minimum_stock INTEGER DEFAULT 0,
  maximum_stock INTEGER,
  reorder_point INTEGER,
  reorder_quantity INTEGER,
  location TEXT,
  bin_location TEXT,
  shelf_life_months INTEGER,
  expiry_date DATE,
  condition TEXT DEFAULT 'new' CHECK (condition IN ('new', 'refurbished', 'used', 'damaged')),
  warranty_months INTEGER,
  warranty_expiry_date DATE,
  serial_number TEXT,
  batch_number TEXT,
  lot_number TEXT,
  dimensions TEXT,
  weight_kg DECIMAL(8,3),
  compatible_vehicles TEXT[],
  compatible_models TEXT[],
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  last_restocked_date DATE,
  last_used_date DATE,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_parts_inventory_organization_id ON public.parts_inventory(organization_id);
CREATE INDEX IF NOT EXISTS idx_parts_inventory_part_number ON public.parts_inventory(part_number);
CREATE INDEX IF NOT EXISTS idx_parts_inventory_part_name ON public.parts_inventory(part_name);
CREATE INDEX IF NOT EXISTS idx_parts_inventory_category ON public.parts_inventory(category);
CREATE INDEX IF NOT EXISTS idx_parts_inventory_manufacturer ON public.parts_inventory(manufacturer);
CREATE INDEX IF NOT EXISTS idx_parts_inventory_supplier ON public.parts_inventory(supplier);
CREATE INDEX IF NOT EXISTS idx_parts_inventory_current_stock ON public.parts_inventory(current_stock);
CREATE INDEX IF NOT EXISTS idx_parts_inventory_location ON public.parts_inventory(location);
CREATE INDEX IF NOT EXISTS idx_parts_inventory_expiry_date ON public.parts_inventory(expiry_date);
CREATE INDEX IF NOT EXISTS idx_parts_inventory_is_active ON public.parts_inventory(is_active);

-- Enable Row Level Security
ALTER TABLE public.parts_inventory ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view parts inventory from their organization" ON public.parts_inventory
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert parts inventory for their organization" ON public.parts_inventory
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update parts inventory from their organization" ON public.parts_inventory
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete parts inventory from their organization" ON public.parts_inventory
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Create updated_at trigger
CREATE TRIGGER handle_parts_inventory_updated_at
  BEFORE UPDATE ON public.parts_inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
