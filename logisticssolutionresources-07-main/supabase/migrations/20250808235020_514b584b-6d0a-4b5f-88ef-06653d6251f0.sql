
-- 1) ROUTING TABLES
create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  status text not null default 'active',
  organization_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.route_stops (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null,
  name text not null,
  latitude numeric,
  longitude numeric,
  stop_sequence integer not null default 1,
  pickup_time time,
  organization_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  guardian_contact text,
  status text not null default 'active',
  organization_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.route_students (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null,
  student_id uuid not null,
  pickup_stop_id uuid,
  pickup_notes text,
  is_active boolean not null default true,
  organization_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.driver_assignments (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null,
  route_id uuid not null,
  vehicle_id uuid not null,
  start_date date not null default now(),
  end_date date,
  active boolean not null default true,
  organization_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Triggers to keep updated_at fresh
drop trigger if exists trg_routes_updated_at on public.routes;
create trigger trg_routes_updated_at
before update on public.routes
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_route_stops_updated_at on public.route_stops;
create trigger trg_route_stops_updated_at
before update on public.route_stops
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_students_updated_at on public.students;
create trigger trg_students_updated_at
before update on public.students
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_route_students_updated_at on public.route_students;
create trigger trg_route_students_updated_at
before update on public.route_students
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_driver_assignments_updated_at on public.driver_assignments;
create trigger trg_driver_assignments_updated_at
before update on public.driver_assignments
for each row execute function public.update_updated_at_column();

-- RLS
alter table public.routes enable row level security;
alter table public.route_stops enable row level security;
alter table public.students enable row level security;
alter table public.route_students enable row level security;
alter table public.driver_assignments enable row level security;

-- Routes policies
drop policy if exists "Org members can view routes" on public.routes;
create policy "Org members can view routes"
  on public.routes for select
  using (organization_id in (select p.organization_id from public.profiles p where p.id = auth.uid()));

drop policy if exists "Admins can manage routes" on public.routes;
create policy "Admins can manage routes"
  on public.routes for all
  using (public.is_admin_user(auth.uid()))
  with check (public.is_admin_user(auth.uid()));

-- Route stops policies
drop policy if exists "Org members can view route stops" on public.route_stops;
create policy "Org members can view route stops"
  on public.route_stops for select
  using (route_id in (
    select r.id from public.routes r
    where r.organization_id in (select p.organization_id from public.profiles p where p.id = auth.uid())
  ));

drop policy if exists "Admins can manage route stops" on public.route_stops;
create policy "Admins can manage route stops"
  on public.route_stops for all
  using (public.is_admin_user(auth.uid()))
  with check (public.is_admin_user(auth.uid()));

-- Students policies
drop policy if exists "Org members can view students" on public.students;
create policy "Org members can view students"
  on public.students for select
  using (organization_id in (select p.organization_id from public.profiles p where p.id = auth.uid()));

drop policy if exists "Admins can manage students" on public.students;
create policy "Admins can manage students"
  on public.students for all
  using (public.is_admin_user(auth.uid()))
  with check (public.is_admin_user(auth.uid()));

-- Route_students policies
drop policy if exists "Org members can view route students" on public.route_students;
create policy "Org members can view route students"
  on public.route_students for select
  using (route_id in (
    select r.id from public.routes r
    where r.organization_id in (select p.organization_id from public.profiles p where p.id = auth.uid())
  ));

drop policy if exists "Admins can manage route students" on public.route_students;
create policy "Admins can manage route students"
  on public.route_students for all
  using (public.is_admin_user(auth.uid()))
  with check (public.is_admin_user(auth.uid()));

-- Driver assignments policies
drop policy if exists "Drivers can view their assignments" on public.driver_assignments;
create policy "Drivers can view their assignments"
  on public.driver_assignments for select
  using (driver_id = auth.uid());

drop policy if exists "Org members can view assignments" on public.driver_assignments;
create policy "Org members can view assignments"
  on public.driver_assignments for select
  using (organization_id in (select p.organization_id from public.profiles p where p.id = auth.uid()));

drop policy if exists "Admins can manage assignments" on public.driver_assignments;
create policy "Admins can manage assignments"
  on public.driver_assignments for all
  using (public.is_admin_user(auth.uid()))
  with check (public.is_admin_user(auth.uid()));

-- Helpful indexes
create index if not exists idx_route_stops_route_seq on public.route_stops (route_id, stop_sequence);
create index if not exists idx_route_students_route on public.route_students (route_id);
create index if not exists idx_driver_assignments_driver_active on public.driver_assignments (driver_id, active);
create index if not exists idx_routes_org on public.routes (organization_id);


-- 2) VEHICLE CHECKS
create table if not exists public.vehicle_checks (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null,
  vehicle_id uuid not null,
  organization_id uuid,
  check_type text not null default 'daily',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  overall_status text not null default 'pending',
  defects_count integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicle_check_items (
  id uuid primary key default gen_random_uuid(),
  check_id uuid not null,
  item_key text not null,
  item_label text,
  status text not null default 'ok',
  severity text not null default 'low',
  comment text,
  photo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Triggers
drop trigger if exists trg_vehicle_checks_updated_at on public.vehicle_checks;
create trigger trg_vehicle_checks_updated_at
before update on public.vehicle_checks
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_vehicle_check_items_updated_at on public.vehicle_check_items;
create trigger trg_vehicle_check_items_updated_at
before update on public.vehicle_check_items
for each row execute function public.update_updated_at_column();

-- RLS
alter table public.vehicle_checks enable row level security;
alter table public.vehicle_check_items enable row level security;

-- Policies for vehicle_checks
drop policy if exists "Drivers can manage their own checks" on public.vehicle_checks;
create policy "Drivers can manage their own checks"
  on public.vehicle_checks for all
  using (driver_id = auth.uid())
  with check (driver_id = auth.uid());

drop policy if exists "Org members can view checks" on public.vehicle_checks;
create policy "Org members can view checks"
  on public.vehicle_checks for select
  using (organization_id in (select p.organization_id from public.profiles p where p.id = auth.uid()));

drop policy if exists "Admins can manage checks" on public.vehicle_checks;
create policy "Admins can manage checks"
  on public.vehicle_checks for all
  using (public.is_admin_user(auth.uid()))
  with check (public.is_admin_user(auth.uid()));

-- Policies for vehicle_check_items
drop policy if exists "Drivers can manage their own check items" on public.vehicle_check_items;
create policy "Drivers can manage their own check items"
  on public.vehicle_check_items for all
  using (exists (
    select 1 from public.vehicle_checks vc
    where vc.id = vehicle_check_items.check_id and vc.driver_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.vehicle_checks vc
    where vc.id = vehicle_check_items.check_id and vc.driver_id = auth.uid()
  ));

drop policy if exists "Org members can view check items" on public.vehicle_check_items;
create policy "Org members can view check items"
  on public.vehicle_check_items for select
  using (exists (
    select 1 from public.vehicle_checks vc
    where vc.id = vehicle_check_items.check_id
      and vc.organization_id in (select p.organization_id from public.profiles p where p.id = auth.uid())
  ));

drop policy if exists "Admins can manage check items" on public.vehicle_check_items;
create policy "Admins can manage check items"
  on public.vehicle_check_items for all
  using (public.is_admin_user(auth.uid()))
  with check (public.is_admin_user(auth.uid()));

-- Helpful indexes
create index if not exists idx_vehicle_checks_driver_time on public.vehicle_checks (driver_id, started_at desc);
create index if not exists idx_vehicle_checks_vehicle_time on public.vehicle_checks (vehicle_id, started_at desc);
create index if not exists idx_vehicle_check_items_check on public.vehicle_check_items (check_id);


-- 3) COMPLIANCE TABLES
create table if not exists public.compliance_violations (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid,
  organization_id uuid,
  violation_type text not null,
  severity text not null default 'low',
  occurred_at timestamptz not null default now(),
  description text,
  resolved boolean not null default false,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.driver_risk_scores (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null,
  organization_id uuid,
  score numeric not null default 0,
  factors jsonb not null default '{}'::jsonb,
  calculated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.driver_licenses (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null,
  organization_id uuid,
  license_number text not null,
  license_type text,
  issued_date date,
  expiry_date date,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Triggers
drop trigger if exists trg_compliance_violations_updated_at on public.compliance_violations;
create trigger trg_compliance_violations_updated_at
before update on public.compliance_violations
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_driver_risk_scores_updated_at on public.driver_risk_scores;
create trigger trg_driver_risk_scores_updated_at
before update on public.driver_risk_scores
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_driver_licenses_updated_at on public.driver_licenses;
create trigger trg_driver_licenses_updated_at
before update on public.driver_licenses
for each row execute function public.update_updated_at_column();

-- RLS
alter table public.compliance_violations enable row level security;
alter table public.driver_risk_scores enable row level security;
alter table public.driver_licenses enable row level security;

-- Policies
-- compliance_violations
drop policy if exists "Admins can manage compliance violations" on public.compliance_violations;
create policy "Admins can manage compliance violations"
  on public.compliance_violations for all
  using (public.is_admin_user(auth.uid()))
  with check (public.is_admin_user(auth.uid()));

drop policy if exists "Drivers can view their violations" on public.compliance_violations;
create policy "Drivers can view their violations"
  on public.compliance_violations for select
  using (driver_id = auth.uid());

drop policy if exists "Org members can view compliance violations" on public.compliance_violations;
create policy "Org members can view compliance violations"
  on public.compliance_violations for select
  using (organization_id in (select p.organization_id from public.profiles p where p.id = auth.uid()));

-- driver_risk_scores
drop policy if exists "Admins can manage driver risk scores" on public.driver_risk_scores;
create policy "Admins can manage driver risk scores"
  on public.driver_risk_scores for all
  using (public.is_admin_user(auth.uid()))
  with check (public.is_admin_user(auth.uid()));

drop policy if exists "Drivers can view their risk scores" on public.driver_risk_scores;
create policy "Drivers can view their risk scores"
  on public.driver_risk_scores for select
  using (driver_id = auth.uid());

drop policy if exists "Org members can view risk scores" on public.driver_risk_scores;
create policy "Org members can view risk scores"
  on public.driver_risk_scores for select
  using (organization_id in (select p.organization_id from public.profiles p where p.id = auth.uid()));

-- driver_licenses
drop policy if exists "Admins can manage driver licenses" on public.driver_licenses;
create policy "Admins can manage driver licenses"
  on public.driver_licenses for all
  using (public.is_admin_user(auth.uid()))
  with check (public.is_admin_user(auth.uid()));

drop policy if exists "Drivers can view their licenses" on public.driver_licenses;
create policy "Drivers can view their licenses"
  on public.driver_licenses for select
  using (driver_id = auth.uid());

drop policy if exists "Org members can view driver licenses" on public.driver_licenses;
create policy "Org members can view driver licenses"
  on public.driver_licenses for select
  using (organization_id in (select p.organization_id from public.profiles p where p.id = auth.uid()));

-- Helpful indexes
create index if not exists idx_compliance_violations_driver_time on public.compliance_violations (driver_id, occurred_at desc);
create index if not exists idx_driver_risk_scores_driver_time on public.driver_risk_scores (driver_id, calculated_at desc);
create index if not exists idx_driver_licenses_driver_expiry on public.driver_licenses (driver_id, expiry_date);


-- 4) BACKGROUND TASKS + RPCs
create table if not exists public.background_tasks (
  id uuid primary key default gen_random_uuid(),
  task_type text not null, -- 'notification' | 'report' | 'sync_location' | 'cleanup' | 'email'
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending', -- 'pending' | 'processing' | 'completed' | 'failed'
  attempts integer not null default 0,
  max_attempts integer not null default 3,
  last_error text,
  scheduled_at timestamptz not null default now(),
  locked_by text,
  locked_at timestamptz,
  organization_id uuid,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.background_tasks enable row level security;

-- Admins can view/manage tasks (UI/debug)
drop policy if exists "Admins can view background tasks" on public.background_tasks;
create policy "Admins can view background tasks"
  on public.background_tasks for select
  using (public.is_admin_user(auth.uid()));

drop policy if exists "Admins can manage background tasks" on public.background_tasks;
create policy "Admins can manage background tasks"
  on public.background_tasks for all
  using (public.is_admin_user(auth.uid()))
  with check (public.is_admin_user(auth.uid()));

-- Indexes for background processing
create index if not exists idx_background_tasks_status_time on public.background_tasks (status, scheduled_at);
create index if not exists idx_background_tasks_locked on public.background_tasks (locked_by, locked_at);

-- RPC: claim next task
create or replace function public.get_next_background_task(worker_id text)
returns public.background_tasks
language plpgsql
security definer
set search_path = public
as $$
declare
  v_task background_tasks;
begin
  -- Claim the next available or timed-out task
  select *
  into v_task
  from public.background_tasks
  where
    (status = 'pending' or (status = 'processing' and locked_at < now() - interval '5 minutes'))
    and scheduled_at <= now()
    and attempts < max_attempts
  order by scheduled_at asc, created_at asc
  limit 1
  for update skip locked;

  if v_task.id is not null then
    update public.background_tasks
    set status = 'processing',
        locked_by = worker_id,
        locked_at = now(),
        attempts = attempts + 1
    where id = v_task.id
    returning * into v_task;
  end if;

  return v_task;
end;
$$;

-- RPC: complete task
create or replace function public.complete_background_task(p_task_id uuid, p_success boolean, p_error text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_success then
    update public.background_tasks
    set status = 'completed',
        completed_at = now(),
        last_error = null
    where id = p_task_id;
  else
    update public.background_tasks
    set status = 'failed',
        last_error = coalesce(p_error, 'Unknown error')
    where id = p_task_id;
  end if;
end;
$$;


-- 5) VEHICLE LOCATIONS: allow driver inserts/updates
-- Existing table already has SELECT policies; add scoped write for drivers
drop policy if exists "Drivers can insert their own locations" on public.vehicle_locations;
create policy "Drivers can insert their own locations"
  on public.vehicle_locations for insert
  with check (driver_id = auth.uid());

drop policy if exists "Drivers can update their own locations" on public.vehicle_locations;
create policy "Drivers can update their own locations"
  on public.vehicle_locations for update
  using (driver_id = auth.uid())
  with check (driver_id = auth.uid());
