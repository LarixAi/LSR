-- Check if RLS is enabled and policies exist, skip what's already there
-- Just add the missing ticket sequence if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS public.ticket_number_seq START 1;