-- Create RLS policies for support_tickets table
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own tickets
CREATE POLICY "Users can view their own tickets" 
ON public.support_tickets 
FOR SELECT 
USING (auth.uid() = created_by);

-- Policy for users to create their own tickets
CREATE POLICY "Users can create tickets" 
ON public.support_tickets 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Policy for admins to view all tickets in their organization
CREATE POLICY "Admins can view organization tickets" 
ON public.support_tickets 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin' 
    AND organization_id = support_tickets.organization_id
  )
);

-- Policy for admins to update tickets in their organization
CREATE POLICY "Admins can update organization tickets" 
ON public.support_tickets 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin' 
    AND organization_id = support_tickets.organization_id
  )
);

-- Trigger to automatically set ticket_number when inserting
CREATE OR REPLACE FUNCTION public.set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
        NEW.ticket_number := public.generate_ticket_number();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-generate ticket numbers
CREATE TRIGGER set_support_ticket_number
    BEFORE INSERT ON public.support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.set_ticket_number();

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();