-- Create driver_invoices table for tracking driver payment invoices
CREATE TABLE IF NOT EXISTS public.driver_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'overdue')) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  jobs_included JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.driver_invoices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for driver_invoices
CREATE POLICY "drivers_can_view_own_invoices" ON public.driver_invoices
FOR SELECT USING (driver_id = auth.uid());

CREATE POLICY "drivers_can_insert_own_invoices" ON public.driver_invoices
FOR INSERT WITH CHECK (driver_id = auth.uid());

CREATE POLICY "drivers_can_update_own_invoices" ON public.driver_invoices
FOR UPDATE USING (driver_id = auth.uid());

CREATE POLICY "admins_can_manage_all_invoices" ON public.driver_invoices
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'council')
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_driver_invoices_driver_id ON public.driver_invoices(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_invoices_status ON public.driver_invoices(status);
CREATE INDEX IF NOT EXISTS idx_driver_invoices_created_at ON public.driver_invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_driver_invoices_due_date ON public.driver_invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_driver_invoices_organization_id ON public.driver_invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_driver_invoices_invoice_number ON public.driver_invoices(invoice_number);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_driver_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_driver_invoices_updated_at
BEFORE UPDATE ON public.driver_invoices
FOR EACH ROW
EXECUTE FUNCTION update_driver_invoices_updated_at();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.driver_invoices TO authenticated;
