-- Fix function search path mutable security warning
-- Update functions to set search_path explicitly

-- Fix update_updated_at_column function (this is the most likely culprit as it was recently created)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER SET search_path = public;