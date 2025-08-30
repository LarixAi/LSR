-- Create support_tickets table for customer support tracking
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  ticket_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('technical', 'billing', 'service', 'complaint', 'feature_request', 'general', 'emergency')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent', 'critical')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  user_email TEXT,
  user_name TEXT,
  user_phone TEXT,
  user_id UUID REFERENCES public.profiles(id),
  app_version TEXT,
  device_info TEXT,
  browser_info TEXT,
  operating_system TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_for_customer', 'waiting_for_third_party', 'resolved', 'closed')),
  assigned_to UUID REFERENCES public.profiles(id),
  assigned_date TIMESTAMPTZ,
  resolution TEXT,
  resolution_date TIMESTAMPTZ,
  customer_satisfaction_rating INTEGER CHECK (customer_satisfaction_rating >= 1 AND customer_satisfaction_rating <= 5),
  customer_feedback TEXT,
  internal_notes TEXT,
  tags TEXT[],
  attachments TEXT[], -- URLs to attached files
  related_tickets TEXT[], -- Array of related ticket IDs
  escalation_level INTEGER DEFAULT 1,
  escalation_date TIMESTAMPTZ,
  escalated_to UUID REFERENCES public.profiles(id),
  sla_target_hours INTEGER,
  sla_breach_hours INTEGER,
  first_response_time TIMESTAMPTZ,
  resolution_time TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_organization_id ON public.support_tickets(organization_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_ticket_id ON public.support_tickets(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_type ON public.support_tickets(type);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON public.support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_email ON public.support_tickets(user_email);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON public.support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.support_tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_support_tickets_escalation_level ON public.support_tickets(escalation_level);

-- Enable Row Level Security
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view support tickets from their organization" ON public.support_tickets
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert support tickets for their organization" ON public.support_tickets
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update support tickets from their organization" ON public.support_tickets
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete support tickets from their organization" ON public.support_tickets
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Create updated_at trigger
CREATE TRIGGER handle_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
