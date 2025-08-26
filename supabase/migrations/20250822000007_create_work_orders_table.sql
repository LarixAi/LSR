-- Create work_orders table for maintenance tracking
CREATE TABLE IF NOT EXISTS public.work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  assigned_mechanic_id UUID REFERENCES public.profiles(id),
  work_order_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent', 'critical')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  work_type TEXT CHECK (work_type IN ('preventive', 'corrective', 'emergency', 'inspection', 'modification', 'other')),
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  parts_required TEXT[],
  labor_cost DECIMAL(10,2),
  parts_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  scheduled_date DATE,
  started_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  due_date DATE,
  location TEXT,
  work_area TEXT,
  tools_required TEXT[],
  safety_requirements TEXT[],
  quality_check_required BOOLEAN DEFAULT false,
  quality_check_completed BOOLEAN DEFAULT false,
  quality_check_by UUID REFERENCES public.profiles(id),
  quality_check_date TIMESTAMPTZ,
  customer_approval_required BOOLEAN DEFAULT false,
  customer_approval_received BOOLEAN DEFAULT false,
  customer_approval_date TIMESTAMPTZ,
  warranty_work BOOLEAN DEFAULT false,
  warranty_details TEXT,
  photos_before TEXT[], -- URLs to before photos
  photos_after TEXT[], -- URLs to after photos
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_work_orders_organization_id ON public.work_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_vehicle_id ON public.work_orders(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_assigned_mechanic_id ON public.work_orders(assigned_mechanic_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON public.work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_priority ON public.work_orders(priority);
CREATE INDEX IF NOT EXISTS idx_work_orders_work_type ON public.work_orders(work_type);
CREATE INDEX IF NOT EXISTS idx_work_orders_scheduled_date ON public.work_orders(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_work_orders_due_date ON public.work_orders(due_date);
CREATE INDEX IF NOT EXISTS idx_work_orders_created_at ON public.work_orders(created_at);

-- Enable Row Level Security
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view work orders from their organization" ON public.work_orders
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert work orders for their organization" ON public.work_orders
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update work orders from their organization" ON public.work_orders
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete work orders from their organization" ON public.work_orders
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Create updated_at trigger
CREATE TRIGGER handle_work_orders_updated_at
  BEFORE UPDATE ON public.work_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
