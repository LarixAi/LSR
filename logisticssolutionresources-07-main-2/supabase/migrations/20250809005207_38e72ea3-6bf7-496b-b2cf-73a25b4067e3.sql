begin;

-- Ensure required extension for UUID generation
create extension if not exists pgcrypto;

-- Shared function for maintaining updated_at
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Profiles: ensure columns exist
alter table if exists public.profiles
  add column if not exists is_active boolean not null default true;
alter table if exists public.profiles
  add column if not exists employee_id text;

-- Messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null,
  receiver_id uuid not null,
  message_text text not null,
  priority text not null default 'normal',
  read_status text not null default 'unread',
  organization_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.messages enable row level security;

-- Policies for messages
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'messages' and policyname = 'Users can send messages'
  ) then
    create policy "Users can send messages"
      on public.messages for insert
      with check (sender_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'messages' and policyname = 'Users can view own messages'
  ) then
    create policy "Users can view own messages"
      on public.messages for select
      using ((sender_id = auth.uid()) OR (receiver_id = auth.uid()));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'messages' and policyname = 'Receivers can update their messages'
  ) then
    create policy "Receivers can update their messages"
      on public.messages for update
      using ((receiver_id = auth.uid()) OR (sender_id = auth.uid()))
      with check ((receiver_id = auth.uid()) OR (sender_id = auth.uid()));
  end if;
end $$;

-- Trigger for messages
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_messages_set_updated_at'
  ) then
    create trigger trg_messages_set_updated_at
    before update on public.messages
    for each row execute function public.update_updated_at_column();
  end if;
end $$;

-- time_entries table
create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null,
  organization_id uuid,
  entry_date date not null default now(),
  total_hours numeric not null default 0,
  overtime_hours numeric not null default 0,
  clock_in_time timestamptz,
  clock_out_time timestamptz,
  break_start_time timestamptz,
  break_end_time timestamptz,
  location_clock_in text,
  location_clock_out text,
  entry_type text not null default 'work',
  status text not null default 'completed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.time_entries enable row level security;

-- Policies for time_entries
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'time_entries' and policyname = 'Drivers can insert own time entries'
  ) then
    create policy "Drivers can insert own time entries"
      on public.time_entries for insert
      with check (driver_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'time_entries' and policyname = 'Drivers can update own time entries'
  ) then
    create policy "Drivers can update own time entries"
      on public.time_entries for update
      using (driver_id = auth.uid())
      with check (driver_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'time_entries' and policyname = 'Drivers can view their time entries'
  ) then
    create policy "Drivers can view their time entries"
      on public.time_entries for select
      using (driver_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'time_entries' and policyname = 'Org members can view org time entries'
  ) then
    create policy "Org members can view org time entries"
      on public.time_entries for select
      using (organization_id IN (
        select p.organization_id from public.profiles p where p.id = auth.uid()
      ));
  end if;
end $$;

-- Trigger for time_entries
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_time_entries_set_updated_at'
  ) then
    create trigger trg_time_entries_set_updated_at
    before update on public.time_entries
    for each row execute function public.update_updated_at_column();
  end if;
end $$;

-- time_off_requests table
create table if not exists public.time_off_requests (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null,
  organization_id uuid,
  request_type text not null,
  reason text,
  notes text,
  status text not null default 'pending',
  total_days integer not null default 1,
  start_date date not null,
  end_date date not null,
  requested_at timestamptz not null default now(),
  reviewed_by uuid,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.time_off_requests enable row level security;

-- Policies for time_off_requests
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'time_off_requests' and policyname = 'Drivers can create time off requests'
  ) then
    create policy "Drivers can create time off requests"
      on public.time_off_requests for insert
      with check (driver_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'time_off_requests' and policyname = 'Drivers can update own time off requests'
  ) then
    create policy "Drivers can update own time off requests"
      on public.time_off_requests for update
      using (driver_id = auth.uid())
      with check (driver_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'time_off_requests' and policyname = 'Drivers can view own time off requests'
  ) then
    create policy "Drivers can view own time off requests"
      on public.time_off_requests for select
      using (driver_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'time_off_requests' and policyname = 'Org members can view org time off requests'
  ) then
    create policy "Org members can view org time off requests"
      on public.time_off_requests for select
      using (organization_id IN (
        select p.organization_id from public.profiles p where p.id = auth.uid()
      ));
  end if;
end $$;

-- Trigger for time_off_requests
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_time_off_requests_set_updated_at'
  ) then
    create trigger trg_time_off_requests_set_updated_at
    before update on public.time_off_requests
    for each row execute function public.update_updated_at_column();
  end if;
end $$;

commit;