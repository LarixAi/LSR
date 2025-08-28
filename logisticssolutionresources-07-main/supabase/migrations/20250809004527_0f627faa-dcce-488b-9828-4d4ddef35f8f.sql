-- 1) Add missing columns to profiles for features using them
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS employee_id text;

-- 2) Create messages table used by messaging UI
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid,
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  message_text text NOT NULL,
  priority text NOT NULL DEFAULT 'normal',
  read_status text NOT NULL DEFAULT 'unread',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS: users can view messages they sent or received
CREATE POLICY IF NOT EXISTS "Users can view own messages"
ON public.messages
FOR SELECT
USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- RLS: users can send messages as themselves
CREATE POLICY IF NOT EXISTS "Users can send messages"
ON public.messages
FOR INSERT
WITH CHECK (sender_id = auth.uid());

-- RLS: receivers can mark messages read (update read_status only ideally, but allow update with condition)
CREATE POLICY IF NOT EXISTS "Receivers can update their messages"
ON public.messages
FOR UPDATE
USING (receiver_id = auth.uid() OR sender_id = auth.uid())
WITH CHECK (receiver_id = auth.uid() OR sender_id = auth.uid());

-- 3) Create time_entries table for clock/time-off/day-off listings
CREATE TABLE IF NOT EXISTS public.time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid,
  driver_id uuid NOT NULL,
  entry_date date NOT NULL DEFAULT now(),
  entry_type text NOT NULL DEFAULT 'work', -- e.g., 'work', 'day_off'
  status text NOT NULL DEFAULT 'completed',
  total_hours numeric NOT NULL DEFAULT 0,
  overtime_hours numeric NOT NULL DEFAULT 0,
  clock_in_time timestamptz,
  clock_out_time timestamptz,
  break_start_time timestamptz,
  break_end_time timestamptz,
  location_clock_in text,
  location_clock_out text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- RLS: drivers manage their own time entries
CREATE POLICY IF NOT EXISTS "Drivers can view their time entries"
ON public.time_entries
FOR SELECT
USING (driver_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Drivers can insert own time entries"
ON public.time_entries
FOR INSERT
WITH CHECK (driver_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Drivers can update own time entries"
ON public.time_entries
FOR UPDATE
USING (driver_id = auth.uid())
WITH CHECK (driver_id = auth.uid());

-- Org members can view entries within their org
CREATE POLICY IF NOT EXISTS "Org members can view org time entries"
ON public.time_entries
FOR SELECT
USING (organization_id IN (SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()));

-- 4) Create time_off_requests table used by UI
CREATE TABLE IF NOT EXISTS public.time_off_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid,
  driver_id uuid NOT NULL,
  request_type text NOT NULL, -- annual_leave, sick_leave, etc.
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_days integer NOT NULL DEFAULT 1,
  reason text,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  review_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  requested_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.time_off_requests ENABLE ROW LEVEL SECURITY;

-- RLS: drivers can view and create their own requests
CREATE POLICY IF NOT EXISTS "Drivers can view own time off requests"
ON public.time_off_requests
FOR SELECT
USING (driver_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Drivers can create time off requests"
ON public.time_off_requests
FOR INSERT
WITH CHECK (driver_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Drivers can update own time off requests"
ON public.time_off_requests
FOR UPDATE
USING (driver_id = auth.uid())
WITH CHECK (driver_id = auth.uid());

-- Org members can view org requests
CREATE POLICY IF NOT EXISTS "Org members can view org time off requests"
ON public.time_off_requests
FOR SELECT
USING (organization_id IN (SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()));

-- 5) Timestamp update trigger function exists (public.update_updated_at_column). Add triggers for updated_at
DROP TRIGGER IF EXISTS trg_messages_updated_at ON public.messages;
CREATE TRIGGER trg_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_time_entries_updated_at ON public.time_entries;
CREATE TRIGGER trg_time_entries_updated_at
BEFORE UPDATE ON public.time_entries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_time_off_requests_updated_at ON public.time_off_requests;
CREATE TRIGGER trg_time_off_requests_updated_at
BEFORE UPDATE ON public.time_off_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();