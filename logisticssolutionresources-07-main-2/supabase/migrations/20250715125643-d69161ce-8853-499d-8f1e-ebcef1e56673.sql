-- Create support ticket comments table
CREATE TABLE IF NOT EXISTS public.support_ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for comments
ALTER TABLE public.support_ticket_comments ENABLE ROW LEVEL SECURITY;

-- Policy for users to view comments on their tickets
CREATE POLICY "Users can view comments on their tickets" 
ON public.support_ticket_comments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.support_tickets 
    WHERE id = ticket_id 
    AND created_by = auth.uid()
  ) OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy for users to create comments
CREATE POLICY "Users can create comments" 
ON public.support_ticket_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy for admins to manage all comments
CREATE POLICY "Admins can manage organization comments" 
ON public.support_ticket_comments 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.support_tickets st
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE st.id = ticket_id 
    AND st.organization_id = p.organization_id
    AND p.role = 'admin'
  )
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_support_ticket_comments_ticket_id ON public.support_ticket_comments(ticket_id);

-- Add trigger for updated_at
CREATE TRIGGER update_support_ticket_comments_updated_at
  BEFORE UPDATE ON public.support_ticket_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();