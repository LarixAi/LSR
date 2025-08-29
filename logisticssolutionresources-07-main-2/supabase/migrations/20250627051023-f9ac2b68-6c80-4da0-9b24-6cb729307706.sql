
-- Add employee_id and is_active columns to profiles table
ALTER TABLE public.profiles ADD COLUMN employee_id TEXT;
ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
