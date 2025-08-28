-- Create support tickets table with proper structure
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number TEXT NOT NULL UNIQUE DEFAULT generate_ticket_number(),
  subject TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  organization_id UUID NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ticket comments table for real-time updates
CREATE TABLE IF NOT EXISTS public.ticket_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  comment TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sequence for ticket numbers
CREATE SEQUENCE IF NOT EXISTS public.ticket_number_seq START 1;

-- Create function to generate ticket numbers
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  ticket_num TEXT;
BEGIN
  SELECT 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('public.ticket_number_seq')::TEXT, 4, '0')
  INTO ticket_num;
  
  RETURN ticket_num;
END;
$$;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_ticket_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for support_tickets
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ticket_updated_at();

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_tickets
CREATE POLICY "Users can create tickets in their organization" ON public.support_tickets
  FOR INSERT WITH CHECK (
    organization_id = get_user_organization_id() AND created_by = auth.uid()
  );

CREATE POLICY "Users can view their own tickets" ON public.support_tickets
  FOR SELECT USING (
    created_by = auth.uid() OR assigned_to = auth.uid() OR is_organization_admin()
  );

CREATE POLICY "Assigned users can update their tickets" ON public.support_tickets
  FOR UPDATE USING (
    assigned_to = auth.uid() OR created_by = auth.uid() OR is_organization_admin()
  );

CREATE POLICY "Admins can manage all tickets in their organization" ON public.support_tickets
  FOR ALL USING (
    organization_id = get_user_organization_id() AND is_organization_admin()
  );

-- RLS Policies for ticket_comments
CREATE POLICY "Users can view comments on their tickets" ON public.ticket_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets st 
      WHERE st.id = ticket_comments.ticket_id 
      AND (st.created_by = auth.uid() OR st.assigned_to = auth.uid() OR is_organization_admin())
    )
  );

CREATE POLICY "Users can create comments on accessible tickets" ON public.ticket_comments
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.support_tickets st 
      WHERE st.id = ticket_comments.ticket_id 
      AND (st.created_by = auth.uid() OR st.assigned_to = auth.uid() OR is_organization_admin())
    )
  );

-- Enable realtime for both tables
ALTER TABLE public.support_tickets REPLICA IDENTITY FULL;
ALTER TABLE public.ticket_comments REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_comments;