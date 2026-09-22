create extension if not exists btree_gist with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.app_role as enum ('student', 'advisor', 'dean');
create type public.pc_status as enum ('available', 'maintenance', 'inactive');
create type public.booking_status as enum (
  'pending_advisor',
  'pending_dean',
  'approved',
  'rejected',
  'cancelled',
  'completed'
);
create type public.access_mode as enum ('lab', 'remote');
create type public.advisor_decision as enum ('pending', 'approved', 'rejected');
create type public.dean_decision as enum ('waiting', 'pending', 'approved', 'rejected', 'not_required');
create type public.review_decision as enum ('approved', 'rejected');

create table private.role_allowlist (
  email text primary key check (
    email = lower(trim(email))
    and char_length(email) between 3 and 320
    and position('@' in email) > 1
  ),
  role public.app_role not null check (role in ('advisor', 'dean')),
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique check (
    email = lower(trim(email))
    and char_length(email) between 3 and 320
    and position('@' in email) > 1
  ),
  display_name text not null check (char_length(trim(display_name)) between 1 and 120),
  university_id text unique check (
    university_id is null or char_length(trim(university_id)) between 1 and 50
  ),
  role public.app_role not null default 'student',
  advisor_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_advisor_not_self check (advisor_id is null or advisor_id <> id),
  constraint profiles_advisor_fk foreign key (advisor_id) references public.profiles (id) on delete set null
);

create table public.pcs (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^PC-[0-9]{2}$'),
  room text not null check (char_length(trim(room)) between 1 and 120),
  specification text not null default '' check (char_length(specification) <= 1000),
  status public.pc_status not null default 'available',
  notes text check (notes is null or char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_advisor_id_idx on public.profiles (advisor_id) where advisor_id is not null;

create sequence public.booking_request_number_seq;
revoke all on sequence public.booking_request_number_seq from public, anon, authenticated;

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  request_number text not null unique default (
    'REQ-' || to_char(current_date, 'YYYY') || '-' || lpad(nextval('public.booking_request_number_seq')::text, 6, '0')
  ),
  student_id uuid not null references public.profiles (id),
  advisor_id uuid not null references public.profiles (id),
  pc_id uuid not null references public.pcs (id),
  start_date date not null,
  end_date date not null,
  start_time time without time zone not null,
  end_time time without time zone not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  access_mode public.access_mode not null,
  purpose text not null check (char_length(trim(purpose)) between 5 and 2000),
  course text not null default 'Not specified' check (char_length(trim(course)) between 1 and 160),
  status public.booking_status not null default 'pending_advisor',
  advisor_decision public.advisor_decision not null default 'pending',
  advisor_decision_at timestamptz,
  dean_decision public.dean_decision not null default 'waiting',
  dean_decision_at timestamptz,
  rejection_reason text,
  rejected_by public.app_role,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_date_order check (end_date >= start_date),
  constraint bookings_timestamp_order check (ends_at > starts_at),
  constraint bookings_mode_bounds check (
    (
      access_mode = 'lab'
      and start_date = end_date
      and start_time >= time '08:00'
      and end_time <= time '18:00'
      and end_time > start_time
    )
    or
    (
      access_mode = 'remote'
      and end_date > start_date
      and start_time = time '00:00'
      and end_time = time '24:00'
    )
  ),
  constraint bookings_rejection_shape check (
    (status = 'rejected' and rejection_reason is not null and char_length(trim(rejection_reason)) between 1 and 2000 and rejected_by in ('advisor', 'dean'))
    or
    (status <> 'rejected' and rejection_reason is null and rejected_by is null)
  ),
  constraint bookings_no_active_overlap exclude using gist (
    pc_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status in ('pending_advisor', 'pending_dean', 'approved'))
);

create index bookings_student_created_idx on public.bookings (student_id, created_at desc);
create index bookings_advisor_status_idx on public.bookings (advisor_id, status, created_at desc);
create index bookings_status_created_idx on public.bookings (status, created_at desc);
create index bookings_pc_dates_idx on public.bookings (pc_id, start_date, end_date);
create index bookings_active_calendar_idx on public.bookings (start_date, end_date, pc_id)
where status in ('pending_advisor', 'pending_dean', 'approved');

create table public.approval_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  reviewer_id uuid not null references public.profiles (id),
  reviewer_role public.app_role not null check (reviewer_role in ('advisor', 'dean')),
  decision public.review_decision not null,
  reason text,
  decided_at timestamptz not null default now(),
  constraint approval_events_rejection_reason check (
    decision = 'approved' or (reason is not null and char_length(trim(reason)) between 1 and 2000)
  )
);

create index approval_events_booking_idx on public.approval_events (booking_id, decided_at);
create index approval_events_reviewer_idx on public.approval_events (reviewer_id, decided_at desc);

create function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create function private.validate_profile_relationship()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.advisor_id is not null then
    if new.role <> 'student' then
      raise exception 'Only student profiles may have an assigned advisor.' using errcode = '23514';
    end if;

    if not exists (
      select 1
      from public.profiles as advisor
      where advisor.id = new.advisor_id
        and advisor.role = 'advisor'
    ) then
      raise exception 'Assigned advisor must have the Advisor role.' using errcode = '23514';
    end if;
  end if;

  if tg_op = 'UPDATE'
    and old.role = 'advisor'
    and new.role <> 'advisor'
    and exists (
      select 1
      from public.profiles as student
      where student.advisor_id = new.id
    ) then
    raise exception 'An Advisor with assigned students cannot change roles.' using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger profiles_validate_relationship
before insert or update of role, advisor_id on public.profiles
for each row execute function private.validate_profile_relationship();

create trigger pcs_set_updated_at
before update on public.pcs
for each row execute function private.set_updated_at();

create trigger bookings_set_updated_at
before update on public.bookings
for each row execute function private.set_updated_at();

create function private.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid())
$$;

create function private.current_user_advisor_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select advisor_id from public.profiles where id = (select auth.uid())
$$;

create function private.dean_can_view_profile(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    exists (
      select 1
      from public.profiles as actor
      where actor.id = (select auth.uid())
        and actor.role = 'dean'
    )
    and exists (
      select 1
      from public.bookings as booking
      where booking.advisor_decision = 'approved'
        and (booking.student_id = p_profile_id or booking.advisor_id = p_profile_id)
    )
$$;

create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  assigned_role public.app_role;
  profile_name text;
begin
  if new.email is null
    or new.email_confirmed_at is null
    or coalesce(new.raw_app_meta_data ->> 'provider', '') <> 'google' then
    raise exception 'A verified Google account is required.' using errcode = '42501';
  end if;

  select role into assigned_role
  from private.role_allowlist
  where email = lower(trim(new.email));

  assigned_role := coalesce(assigned_role, 'student'::public.app_role);
  profile_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (id, email, display_name, role)
  values (new.id, lower(trim(new.email)), left(profile_name, 120), assigned_role);

  return new;
end;
$$;

create function private.apply_allowlisted_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set role = new.role,
      advisor_id = null
  where email = new.email;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

create trigger role_allowlist_apply_to_existing_profile
after insert or update of role on private.role_allowlist
for each row execute function private.apply_allowlisted_role();

alter table public.profiles enable row level security;
alter table public.pcs enable row level security;
alter table public.bookings enable row level security;
alter table public.approval_events enable row level security;

revoke all on table public.profiles, public.pcs, public.bookings, public.approval_events from public, anon, authenticated;
grant select on table public.profiles, public.pcs, public.bookings, public.approval_events to authenticated;
grant update (display_name, university_id) on table public.profiles to authenticated;

create policy profiles_select_own
on public.profiles for select to authenticated
using (id = (select auth.uid()));

create policy profiles_select_assigned_students
on public.profiles for select to authenticated
using (advisor_id = (select auth.uid()) and private.current_user_role() = 'advisor');

create policy profiles_select_assigned_advisor
on public.profiles for select to authenticated
using (id = private.current_user_advisor_id());

create policy profiles_select_dean
on public.profiles for select to authenticated
using (private.dean_can_view_profile(id));

create policy profiles_update_own
on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy pcs_select_authenticated
on public.pcs for select to authenticated
using ((select auth.uid()) is not null);

create policy bookings_select_student
on public.bookings for select to authenticated
using (student_id = (select auth.uid()));

create policy bookings_select_advisor
on public.bookings for select to authenticated
using (advisor_id = (select auth.uid()) and private.current_user_role() = 'advisor');

create policy bookings_select_dean
on public.bookings for select to authenticated
using (
  private.current_user_role() = 'dean'
  and advisor_decision = 'approved'
);

create policy approval_events_select_visible_booking
on public.approval_events for select to authenticated
using (
  exists (
    select 1
    from public.bookings
    where bookings.id = approval_events.booking_id
  )
);

create function public.create_booking(
  p_pc_id uuid,
  p_start_date date,
  p_end_date date,
  p_start_time text,
  p_end_time text,
  p_purpose text,
  p_course text default null
)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor public.profiles;
  workstation public.pcs;
  multi_day boolean;
  normalized_start_time time without time zone;
  normalized_end_time time without time zone;
  booking_start timestamptz;
  booking_end timestamptz;
  created_booking public.bookings;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select * into actor from public.profiles where id = (select auth.uid());
  if actor.id is null or actor.role <> 'student' then
    raise exception 'Only students can create booking requests.' using errcode = '42501';
  end if;
  if actor.advisor_id is null then
    raise exception 'Your account does not have an assigned advisor yet.' using errcode = '23514';
  end if;
  if not exists (
    select 1
    from public.profiles as advisor
    where advisor.id = actor.advisor_id
      and advisor.role = 'advisor'
  ) then
    raise exception 'Your assigned advisor is not eligible to review requests.' using errcode = '23514';
  end if;

  select * into workstation from public.pcs where id = p_pc_id;
  if workstation.id is null then
    raise exception 'The selected PC could not be found.' using errcode = 'P0002';
  end if;
  if workstation.status <> 'available' then
    raise exception 'The selected PC is not available for booking.' using errcode = '23514';
  end if;

  if p_start_date is null or p_end_date is null or p_end_date < p_start_date then
    raise exception 'The booking end date must be on or after the start date.' using errcode = '22007';
  end if;
  if p_start_date < (now() at time zone 'Asia/Bangkok')::date then
    raise exception 'Past booking dates are not allowed.' using errcode = '22007';
  end if;
  if p_purpose is null or char_length(trim(p_purpose)) < 5 then
    raise exception 'Please provide a purpose of at least 5 characters.' using errcode = '23514';
  end if;

  multi_day := p_start_date <> p_end_date;
  if multi_day then
    normalized_start_time := time '00:00';
    normalized_end_time := time '24:00';
    booking_start := p_start_date::timestamp at time zone 'Asia/Bangkok';
    booking_end := (p_end_date + 1)::timestamp at time zone 'Asia/Bangkok';
  else
    if p_start_time is null or p_end_time is null then
      raise exception 'A valid booking start and end time are required.' using errcode = '22007';
    end if;

    begin
      normalized_start_time := p_start_time::time;
      normalized_end_time := p_end_time::time;
    exception when others then
      raise exception 'A valid booking start and end time are required.' using errcode = '22007';
    end;

    if normalized_start_time < time '08:00'
      or normalized_end_time > time '18:00'
      or normalized_end_time <= normalized_start_time then
      raise exception 'One-day bookings must be within lab hours, 08:00–18:00, with the end after the start.' using errcode = '23514';
    end if;
    if extract(minute from normalized_start_time)::integer % 15 <> 0
      or extract(minute from normalized_end_time)::integer % 15 <> 0
      or extract(second from normalized_start_time) <> 0
      or extract(second from normalized_end_time) <> 0 then
      raise exception 'Booking times must use 15-minute intervals.' using errcode = '23514';
    end if;

    booking_start := (p_start_date + normalized_start_time) at time zone 'Asia/Bangkok';
    booking_end := (p_end_date + normalized_end_time) at time zone 'Asia/Bangkok';
  end if;

  begin
    insert into public.bookings (
      student_id,
      advisor_id,
      pc_id,
      start_date,
      end_date,
      start_time,
      end_time,
      starts_at,
      ends_at,
      access_mode,
      purpose,
      course
    ) values (
      actor.id,
      actor.advisor_id,
      workstation.id,
      p_start_date,
      p_end_date,
      normalized_start_time,
      normalized_end_time,
      booking_start,
      booking_end,
      case when multi_day then 'remote'::public.access_mode else 'lab'::public.access_mode end,
      trim(p_purpose),
      coalesce(nullif(trim(p_course), ''), 'Not specified')
    )
    returning * into created_booking;
  exception when exclusion_violation then
    raise exception 'This PC is unavailable during the selected time.' using errcode = '23P01';
  end;

  return created_booking;
end;
$$;

create function public.approve_booking(p_booking_id uuid)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  actor_role public.app_role;
  target public.bookings;
begin
  select role into actor_role from public.profiles where id = actor_id;
  select * into target from public.bookings where id = p_booking_id for update;

  if target.id is null then
    raise exception 'Booking was not found.' using errcode = 'P0002';
  end if;

  if actor_role = 'advisor' then
    if target.advisor_id <> actor_id or target.status <> 'pending_advisor' then
      raise exception 'You cannot approve this request at its current stage.' using errcode = '42501';
    end if;

    update public.bookings
    set status = 'pending_dean', advisor_decision = 'approved', advisor_decision_at = now(), dean_decision = 'pending'
    where id = target.id
    returning * into target;
  elsif actor_role = 'dean' then
    if target.status <> 'pending_dean' then
      raise exception 'Only requests pending Dean review can receive final approval.' using errcode = '42501';
    end if;

    update public.bookings
    set status = 'approved', dean_decision = 'approved', dean_decision_at = now()
    where id = target.id
    returning * into target;
  else
    raise exception 'Your role cannot approve booking requests.' using errcode = '42501';
  end if;

  insert into public.approval_events (booking_id, reviewer_id, reviewer_role, decision)
  values (target.id, actor_id, actor_role, 'approved');

  return target;
end;
$$;

create function public.reject_booking(p_booking_id uuid, p_reason text)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  actor_role public.app_role;
  target public.bookings;
  clean_reason text := trim(p_reason);
begin
  if clean_reason is null or clean_reason = '' then
    raise exception 'A rejection reason is required.' using errcode = '23514';
  end if;

  select role into actor_role from public.profiles where id = actor_id;
  select * into target from public.bookings where id = p_booking_id for update;

  if target.id is null then
    raise exception 'Booking was not found.' using errcode = 'P0002';
  end if;

  if actor_role = 'advisor' then
    if target.advisor_id <> actor_id or target.status <> 'pending_advisor' then
      raise exception 'You cannot reject this request at its current stage.' using errcode = '42501';
    end if;

    update public.bookings
    set status = 'rejected', advisor_decision = 'rejected', advisor_decision_at = now(), dean_decision = 'not_required', rejection_reason = clean_reason, rejected_by = 'advisor'
    where id = target.id
    returning * into target;
  elsif actor_role = 'dean' then
    if target.status <> 'pending_dean' then
      raise exception 'Only requests pending Dean review can be rejected by the Dean.' using errcode = '42501';
    end if;

    update public.bookings
    set status = 'rejected', dean_decision = 'rejected', dean_decision_at = now(), rejection_reason = clean_reason, rejected_by = 'dean'
    where id = target.id
    returning * into target;
  else
    raise exception 'Your role cannot reject booking requests.' using errcode = '42501';
  end if;

  insert into public.approval_events (booking_id, reviewer_id, reviewer_role, decision, reason)
  values (target.id, actor_id, actor_role, 'rejected', clean_reason);

  return target;
end;
$$;

create function public.get_booking_calendar(p_from date, p_to date)
returns table (
  id uuid,
  request_number text,
  pc_id uuid,
  pc_code text,
  start_date date,
  end_date date,
  start_time text,
  end_time text,
  access_mode public.access_mode,
  status public.booking_status,
  is_own boolean,
  can_view_details boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;
  if p_from is null or p_to is null or p_to < p_from or p_to - p_from > 62 then
    raise exception 'Calendar range must contain between 1 and 63 days.' using errcode = '22007';
  end if;

  return query
  select
    booking.id,
    booking.request_number,
    booking.pc_id,
    pc.code,
    booking.start_date,
    booking.end_date,
    to_char(booking.start_time, 'HH24:MI'),
    case when booking.access_mode = 'remote' then '24:00' else to_char(booking.end_time, 'HH24:MI') end,
    booking.access_mode,
    booking.status,
    booking.student_id = (select auth.uid()),
    booking.student_id = (select auth.uid())
      or booking.advisor_id = (select auth.uid())
      or private.current_user_role() = 'dean'
  from public.bookings booking
  join public.pcs pc on pc.id = booking.pc_id
  where booking.status in ('pending_advisor', 'pending_dean', 'approved')
    and booking.start_date <= p_to
    and booking.end_date >= p_from
  order by booking.start_date, booking.start_time, pc.code;
end;
$$;

revoke execute on function public.create_booking(uuid, date, date, text, text, text, text) from public, anon;
revoke execute on function public.approve_booking(uuid) from public, anon;
revoke execute on function public.reject_booking(uuid, text) from public, anon;
revoke execute on function public.get_booking_calendar(date, date) from public, anon;

grant execute on function public.create_booking(uuid, date, date, text, text, text, text) to authenticated;
grant execute on function public.approve_booking(uuid) to authenticated;
grant execute on function public.reject_booking(uuid, text) to authenticated;
grant execute on function public.get_booking_calendar(date, date) to authenticated;

revoke all on function private.set_updated_at() from public, anon, authenticated;
revoke all on function private.validate_profile_relationship() from public, anon, authenticated;
revoke all on function private.current_user_role() from public, anon, authenticated;
revoke all on function private.current_user_advisor_id() from public, anon, authenticated;
revoke all on function private.dean_can_view_profile(uuid) from public, anon, authenticated;
revoke all on function private.handle_new_user() from public, anon, authenticated;
revoke all on function private.apply_allowlisted_role() from public, anon, authenticated;

-- RLS policies execute these two helpers as the authenticated caller. The
-- private schema has no USAGE grant, so they are not exposed through PostgREST.
grant execute on function private.current_user_role() to authenticated;
grant execute on function private.current_user_advisor_id() to authenticated;
grant execute on function private.dean_can_view_profile(uuid) to authenticated;
