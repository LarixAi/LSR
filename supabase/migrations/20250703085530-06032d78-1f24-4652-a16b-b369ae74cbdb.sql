-- Enable realtime for support tickets table (if not already enabled)
ALTER TABLE public.support_tickets REPLICA IDENTITY FULL;
ALTER TABLE public.ticket_comments REPLICA IDENTITY FULL;

-- Add tables to realtime publication (ignore if already exists)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
  EXCEPTION
    WHEN duplicate_object THEN
      -- Table already in publication, ignore
      NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_comments;
  EXCEPTION
    WHEN duplicate_object THEN
      -- Table already in publication, ignore
      NULL;
  END;
END $$;