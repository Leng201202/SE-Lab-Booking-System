alter table public.bookings rename column student_id to requester_id;
alter table public.bookings rename constraint bookings_student_id_fkey to bookings_requester_id_fkey;
alter index public.bookings_student_created_idx rename to bookings_requester_created_idx;

alter table public.bookings
  alter column advisor_id drop not null,
  add column requester_role public.app_role;

update public.bookings
set requester_role = 'student'::public.app_role
where requester_role is null;

alter table public.bookings
  alter column requester_role set not null,
  add constraint bookings_requester_workflow_shape check (
    (requester_role = 'student' and advisor_id is not null)
    or
    (requester_role in ('advisor', 'dean') and advisor_id is null)
  ),
  add constraint bookings_skipped_advisor_shape check (
    requester_role = 'student' or advisor_decision = 'not_required'
  ),
  add constraint bookings_dean_direct_shape check (
    requester_role <> 'dean'
    or (
      status in ('approved', 'cancelled', 'completed')
      and dean_decision = 'approved'
      and dean_decision_at is not null
    )
  );

drop policy if exists profiles_select_assigned_students on public.profiles;
drop policy if exists profiles_select_dean on public.profiles;
drop policy if exists bookings_select_student on public.bookings;
drop policy if exists bookings_select_advisor on public.bookings;
drop policy if exists bookings_select_dean on public.bookings;

create policy profiles_select_manageable_students
on public.profiles for select to authenticated
using (
  private.current_user_role() = 'advisor'
  and role = 'student'
  and (advisor_id is null or advisor_id = (select auth.uid()))
);

create policy profiles_select_dean_all
on public.profiles for select to authenticated
using (private.current_user_role() = 'dean');

create policy bookings_select_own
on public.bookings for select to authenticated
using (requester_id = (select auth.uid()));

create policy bookings_select_assigned_advisor
on public.bookings for select to authenticated
using (
  private.current_user_role() = 'advisor'
  and requester_role = 'student'
  and advisor_id = (select auth.uid())
);

create policy bookings_select_dean_queue_and_history
on public.bookings for select to authenticated
using (
  private.current_user_role() = 'dean'
  and (
    status = 'pending_dean'
    or dean_decision in ('approved', 'rejected')
  )
);

drop function if exists private.dean_can_view_profile(uuid);

create or replace function public.create_booking(
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
  initial_status public.booking_status;
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
    initial_status := 'pending_advisor';
    initial_advisor_decision := 'pending';
    initial_dean_decision := 'waiting';
    initial_dean_decision_at := null;
    booking_advisor_id := actor.advisor_id;
  elsif actor.role = 'advisor' then
    initial_status := 'pending_dean';
    initial_advisor_decision := 'not_required';
    initial_dean_decision := 'pending';
    initial_dean_decision_at := null;
    booking_advisor_id := null;
  elsif actor.role = 'dean' then
    initial_status := 'approved';
    initial_advisor_decision := 'not_required';
    initial_dean_decision := 'approved';
    initial_dean_decision_at := now();
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
      requester_id,
      requester_role,
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
      course,
      status,
      advisor_decision,
      dean_decision,
      dean_decision_at
    ) values (
      actor.id,
      actor.role,
      booking_advisor_id,
      workstation.id,
      p_start_date,
      p_end_date,
      normalized_start_time,
      normalized_end_time,
      booking_start,
      booking_end,
      case when multi_day then 'remote'::public.access_mode else 'lab'::public.access_mode end,
      trim(p_purpose),
      coalesce(nullif(trim(p_course), ''), 'Not specified'),
      initial_status,
      initial_advisor_decision,
      initial_dean_decision,
      initial_dean_decision_at
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

create or replace function public.approve_booking(p_booking_id uuid)
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
    if target.requester_role <> 'student'
      or target.advisor_id <> actor_id
      or target.status <> 'pending_advisor' then
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

create or replace function public.reject_booking(p_booking_id uuid, p_reason text)
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
    if target.requester_role <> 'student'
      or target.advisor_id <> actor_id
      or target.status <> 'pending_advisor' then
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

create or replace function public.get_booking_calendar(p_from date, p_to date)
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
    booking.requester_id = (select auth.uid()),
    booking.requester_id = (select auth.uid())
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

create function public.set_user_role(p_profile_id uuid, p_role public.app_role)
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
    set role = 'student', advisor_id = null
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

create function public.assign_student_advisor(p_student_id uuid, p_advisor_id uuid default null)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  actor_role public.app_role;
  student public.profiles;
begin
  select role into actor_role from public.profiles where id = actor_id;
  if actor_role is null or actor_role not in ('advisor', 'dean') then
    raise exception 'Only an Advisor or Dean can manage advisees.' using errcode = '42501';
  end if;

  select * into student from public.profiles where id = p_student_id for update;
  if student.id is null or student.role <> 'student' then
    raise exception 'The selected user is not a Student.' using errcode = '23514';
  end if;

  if actor_role = 'advisor' then
    if student.advisor_id is not null and student.advisor_id <> actor_id then
      raise exception 'This Student is already assigned to another Advisor.' using errcode = '42501';
    end if;
    if p_advisor_id is not null and p_advisor_id <> actor_id then
      raise exception 'Advisors can assign Students only to themselves.' using errcode = '42501';
    end if;
    if p_advisor_id is null and student.advisor_id <> actor_id then
      raise exception 'Advisors can release only their own advisees.' using errcode = '42501';
    end if;
  elsif p_advisor_id is not null and not exists (
    select 1 from public.profiles as advisor
    where advisor.id = p_advisor_id and advisor.role = 'advisor'
  ) then
    raise exception 'The selected Advisor is not eligible.' using errcode = '23514';
  end if;

  update public.profiles
  set advisor_id = p_advisor_id
  where id = student.id
  returning * into student;

  return student;
end;
$$;

create function public.create_pc(
  p_code text,
  p_room text,
  p_specification text default '',
  p_status public.pc_status default 'available',
  p_notes text default null
)
returns public.pcs
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_pc public.pcs;
begin
  if private.current_user_role() is distinct from 'dean' then
    raise exception 'Only a Dean can add PCs.' using errcode = '42501';
  end if;

  insert into public.pcs (code, room, specification, status, notes)
  values (
    upper(trim(p_code)),
    trim(p_room),
    coalesce(trim(p_specification), ''),
    p_status,
    nullif(trim(p_notes), '')
  )
  returning * into created_pc;

  return created_pc;
end;
$$;

create function public.update_pc(
  p_pc_id uuid,
  p_code text,
  p_room text,
  p_specification text,
  p_status public.pc_status,
  p_notes text default null
)
returns public.pcs
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_pc public.pcs;
begin
  if private.current_user_role() is distinct from 'dean' then
    raise exception 'Only a Dean can update PCs.' using errcode = '42501';
  end if;

  update public.pcs
  set code = upper(trim(p_code)),
      room = trim(p_room),
      specification = coalesce(trim(p_specification), ''),
      status = p_status,
      notes = nullif(trim(p_notes), '')
  where id = p_pc_id
  returning * into updated_pc;

  if updated_pc.id is null then
    raise exception 'The selected PC could not be found.' using errcode = 'P0002';
  end if;

  return updated_pc;
end;
$$;

revoke execute on function public.set_user_role(uuid, public.app_role) from public, anon;
revoke execute on function public.assign_student_advisor(uuid, uuid) from public, anon;
revoke execute on function public.create_pc(text, text, text, public.pc_status, text) from public, anon;
revoke execute on function public.update_pc(uuid, text, text, text, public.pc_status, text) from public, anon;

grant execute on function public.set_user_role(uuid, public.app_role) to authenticated;
grant execute on function public.assign_student_advisor(uuid, uuid) to authenticated;
grant execute on function public.create_pc(text, text, text, public.pc_status, text) to authenticated;
grant execute on function public.update_pc(uuid, text, text, text, public.pc_status, text) to authenticated;

notify pgrst, 'reload schema';
