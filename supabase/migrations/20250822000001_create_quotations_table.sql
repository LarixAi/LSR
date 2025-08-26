-- Create quotations table for quote management
CREATE TABLE IF NOT EXISTS public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  quote_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  contact_person TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  service_type TEXT,
  description TEXT,
  route_details TEXT,
  passengers INTEGER,
  duration TEXT,
  frequency TEXT,
  base_amount DECIMAL(10,2),
  discount_amount DECIMAL(10,2),
  vat_rate DECIMAL(5,2),
  vat_amount DECIMAL(10,2),
  total_amount DECIMAL(10,2),
  status TEXT DEFAULT 'draft',
  priority TEXT,
  created_date DATE,
  valid_until DATE,
  accepted_date DATE,
  converted_date DATE,
  invoice_id UUID REFERENCES public.invoices(id),
  created_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  expires_at TIMESTAMPTZ, -- Add expires_at field for better expiration tracking
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quotations_organization_id ON public.quotations(organization_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON public.quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_created_at ON public.quotations(created_at);
CREATE INDEX IF NOT EXISTS idx_quotations_valid_until ON public.quotations(valid_until);
CREATE INDEX IF NOT EXISTS idx_quotations_expires_at ON public.quotations(expires_at);
CREATE INDEX IF NOT EXISTS idx_quotations_invoice_id ON public.quotations(invoice_id);

-- Enable Row Level Security
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view quotations from their organization" ON public.quotations
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert quotations for their organization" ON public.quotations
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update quotations from their organization" ON public.quotations
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete quotations from their organization" ON public.quotations
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Create updated_at trigger
CREATE TRIGGER handle_quotations_updated_at
  BEFORE UPDATE ON public.quotations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
