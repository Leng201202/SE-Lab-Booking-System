-- Students no longer have a permanent Advisor assignment. Each Student booking
-- request names the Advisor who reviews it, stored on public.bookings.advisor_id.
--
-- Existing bookings already carry their own advisor_id (copied from the profile
-- when they were created), so historical attribution and unresolved review
-- queues are unchanged. The profile-level assignments are archived below before
-- the column is removed, so no relationship is discarded silently.

create table private.student_advisor_assignment_archive (
  student_id uuid primary key,
  advisor_id uuid not null,
  archived_at timestamptz not null default now()
);

revoke all on table private.student_advisor_assignment_archive from public, anon, authenticated;

insert into private.student_advisor_assignment_archive (student_id, advisor_id)
select id, advisor_id
from public.profiles
where advisor_id is not null;

-- Remove the assignment feature and everything that reads the profile column.
drop policy if exists profiles_select_assigned_advisor on public.profiles;
drop policy if exists profiles_select_manageable_students on public.profiles;

drop function if exists public.assign_student_advisor(uuid, uuid);
drop function if exists private.current_user_advisor_id();

drop trigger if exists profiles_validate_relationship on public.profiles;

-- An Advisor named on unresolved Student requests must keep the role until
-- those requests are reviewed or cancelled; otherwise they could never leave
-- the Advisor stage. This replaces the former "Advisor with assigned students"
-- guard.
create or replace function private.validate_profile_relationship()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role = 'advisor'
    and new.role <> 'advisor'
    and exists (
      select 1
      from public.bookings as booking
      where booking.advisor_id = new.id
        and booking.status in ('pending_technician', 'pending_advisor')
    ) then
    raise exception 'An Advisor with unresolved Student requests cannot change roles.' using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function private.validate_profile_relationship() from public, anon, authenticated;

create trigger profiles_validate_relationship
before update of role on public.profiles
for each row execute function private.validate_profile_relationship();

create or replace function private.apply_allowlisted_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set role = new.role
  where email = new.email;
  return new;
end;
$$;

revoke all on function private.apply_allowlisted_role() from public, anon, authenticated;

create or replace function public.set_user_role(p_profile_id uuid, p_role public.app_role)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  target public.profiles;
begin
  if private.current_user_role() is distinct from 'dean' then
    raise exception 'Only a Dean can manage user roles.' using errcode = '42501';
  end if;
  if p_profile_id = actor_id then
    raise exception 'You cannot change your own Dean role.' using errcode = '42501';
  end if;

  select * into target from public.profiles where id = p_profile_id for update;
  if target.id is null then
    raise exception 'The selected user could not be found.' using errcode = 'P0002';
  end if;

  if p_role = 'student' then
    delete from private.role_allowlist where email = target.email;
    update public.profiles
    set role = 'student'
    where id = target.id
    returning * into target;
  else
    insert into private.role_allowlist (email, role)
    values (target.email, p_role)
    on conflict (email) do update set role = excluded.role;
    select * into target from public.profiles where id = p_profile_id;
  end if;

  return target;
end;
$$;

revoke execute on function public.set_user_role(uuid, public.app_role) from public, anon;
grant execute on function public.set_user_role(uuid, public.app_role) to authenticated;

-- Dropping the column also drops profiles_advisor_id_idx,
-- profiles_advisor_not_self, and profiles_advisor_fk.
alter table public.profiles drop column advisor_id;

-- Eligibility for Student booking review: an active Advisor profile.
create function private.is_selectable_booking_advisor(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles as advisor
    where advisor.id = p_profile_id
      and advisor.role = 'advisor'
      and advisor.is_deactivated = false
  )
$$;

revoke all on function private.is_selectable_booking_advisor(uuid) from public, anon, authenticated;

-- Exposes only the identity a Student needs to choose a reviewer, not emails
-- or other profile data.
create function public.list_booking_advisors()
returns table (id uuid, display_name text)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null or private.current_user_role() is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  return query
  select advisor.id, advisor.display_name
  from public.profiles as advisor
  where private.is_selectable_booking_advisor(advisor.id)
  order by advisor.display_name, advisor.id;
end;
$$;

revoke all on function public.list_booking_advisors() from public, anon;
grant execute on function public.list_booking_advisors() to authenticated;

-- Requesters can read the Advisor named on their own bookings so history and
-- detail views can show the reviewer.
create policy profiles_select_own_booking_advisors
on public.profiles for select to authenticated
using (
  role = 'advisor'
  and exists (
    select 1
    from public.bookings as booking
    where booking.advisor_id = profiles.id
      and booking.requester_id = (select auth.uid())
  )
);

-- Advisors can read the Students whose requests they can see.
create policy profiles_select_advisor_review_context
on public.profiles for select to authenticated
using (
  private.current_user_role() = 'advisor'
  and role = 'student'
  and exists (
    select 1
    from public.bookings as booking
    where booking.requester_id = profiles.id
      and booking.requester_role = 'student'
      and booking.advisor_id = (select auth.uid())
      and (
        booking.status = 'pending_advisor'
        or private.current_user_reviewed_booking(booking.id, 'advisor')
      )
  )
);

drop function public.create_booking(uuid, date, date, text, text, text, text);

create function public.create_booking(
  p_pc_id uuid,
  p_start_date date,
  p_end_date date,
  p_start_time text,
  p_end_time text,
  p_purpose text,
  p_course text default null,
  p_advisor_id uuid default null
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
  initial_status public.booking_status;
  initial_technician_decision public.advisor_decision;
  initial_advisor_decision public.advisor_decision;
  initial_dean_decision public.dean_decision;
  initial_dean_decision_at timestamptz;
  booking_advisor_id uuid;
  created_booking public.bookings;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select * into actor from public.profiles where id = (select auth.uid());
  if actor.id is null then
    raise exception 'An application profile is required.' using errcode = '42501';
  end if;

  if actor.role = 'student' then
    if actor.university_id is null then
      raise exception 'Add your Student ID on your Profile page before requesting a booking.' using errcode = '23514';
    end if;
    if p_advisor_id is null then
      raise exception 'Select an Advisor to review this booking request.' using errcode = '23514';
    end if;
    if not private.is_selectable_booking_advisor(p_advisor_id) then
      raise exception 'The selected Advisor is not eligible to review booking requests.' using errcode = '23514';
    end if;
    initial_status := 'pending_technician';
    initial_technician_decision := 'pending';
    initial_advisor_decision := 'pending';
    initial_dean_decision := 'waiting';
    initial_dean_decision_at := null;
    booking_advisor_id := p_advisor_id;
  elsif p_advisor_id is not null then
    raise exception 'Only Student booking requests select an Advisor.' using errcode = '23514';
  elsif actor.role = 'technician' then
    initial_status := 'pending_advisor';
    initial_technician_decision := 'not_required';
    initial_advisor_decision := 'pending';
    initial_dean_decision := 'waiting';
    initial_dean_decision_at := null;
    booking_advisor_id := null;
  elsif actor.role = 'advisor' then
    initial_status := 'pending_dean';
    initial_technician_decision := 'not_required';
    initial_advisor_decision := 'not_required';
    initial_dean_decision := 'pending';
    initial_dean_decision_at := null;
    booking_advisor_id := null;
  elsif actor.role = 'dean' then
    initial_status := 'approved';
    initial_technician_decision := 'not_required';
    initial_advisor_decision := 'not_required';
    initial_dean_decision := 'approved';
    initial_dean_decision_at := statement_timestamp();
    booking_advisor_id := null;
  else
    raise exception 'Your role cannot create booking requests.' using errcode = '42501';
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
  if p_start_date < (statement_timestamp() at time zone 'Asia/Bangkok')::date then
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

  if booking_start <= statement_timestamp() then
    raise exception 'The booking start time must be in the future.' using errcode = '22007';
  end if;

  begin
    insert into public.bookings (
      requester_id, requester_role, advisor_id, pc_id,
      start_date, end_date, start_time, end_time, starts_at, ends_at,
      access_mode, purpose, course, status,
      technician_decision, advisor_decision, dean_decision, dean_decision_at
    ) values (
      actor.id, actor.role, booking_advisor_id, workstation.id,
      p_start_date, p_end_date, normalized_start_time, normalized_end_time, booking_start, booking_end,
      case when multi_day then 'remote'::public.access_mode else 'lab'::public.access_mode end,
      trim(p_purpose), coalesce(nullif(trim(p_course), ''), 'Not specified'), initial_status,
      initial_technician_decision, initial_advisor_decision, initial_dean_decision, initial_dean_decision_at
    )
    returning * into created_booking;
  exception when exclusion_violation then
    raise exception 'This PC is unavailable during the selected time.' using errcode = '23P01';
  end;

  if actor.role = 'dean' then
    insert into public.approval_events (booking_id, reviewer_id, reviewer_role, decision)
    values (created_booking.id, actor.id, 'dean', 'approved');
  end if;

  return created_booking;
end;
$$;

revoke execute on function public.create_booking(uuid, date, date, text, text, text, text, uuid) from public, anon;
grant execute on function public.create_booking(uuid, date, date, text, text, text, text, uuid) to authenticated;

notify pgrst, 'reload schema';
