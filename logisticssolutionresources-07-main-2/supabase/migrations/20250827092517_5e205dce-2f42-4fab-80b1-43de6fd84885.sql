-- Fix demo_requests preferred_date insertion errors by allowing empty strings
-- Change preferred_date from DATE to TEXT so frontend empty string values no longer cause 400 errors
ALTER TABLE public.demo_requests
  ALTER COLUMN preferred_date TYPE text USING NULLIF(preferred_date::text, '');

-- Optional: ensure preferred_time remains text-compatible (already varchar)
COMMENT ON COLUMN public.demo_requests.preferred_date IS 'Preferred date for the demo (as entered). May be empty string if user did not choose a date.';