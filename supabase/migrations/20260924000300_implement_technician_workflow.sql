alter table private.role_allowlist
  drop constraint if exists role_allowlist_role_check,
  add constraint role_allowlist_role_check check (role in ('technician', 'advisor', 'dean'));

alter table public.bookings
  add column technician_decision public.advisor_decision not null default 'not_required',
  add column technician_decision_at timestamptz;

alter table public.bookings
  alter column status set default 'pending_technician';

-- Existing Student bookings predate Technician review and remain at their current stage.
update public.bookings
set technician_decision = 'approved',
    technician_decision_at = coalesce(created_at, statement_timestamp())
where requester_role = 'student';

alter table public.bookings
  drop constraint if exists bookings_requester_workflow_shape,
  drop constraint if exists bookings_skipped_advisor_shape,
  drop constraint if exists bookings_rejection_shape,
  drop constraint if exists bookings_no_active_overlap;

alter table public.bookings
  add constraint bookings_requester_workflow_shape check (
    (requester_role = 'student' and advisor_id is not null)
    or
    (requester_role in ('technician', 'advisor', 'dean') and advisor_id is null)
  ),
  add constraint bookings_skipped_technician_shape check (
    requester_role = 'student' or technician_decision = 'not_required'
  ),
  add constraint bookings_technician_decision_shape check (
    (technician_decision = 'pending' and technician_decision_at is null)
    or (technician_decision in ('approved', 'rejected') and technician_decision_at is not null)
    or (technician_decision = 'not_required' and technician_decision_at is null)
  ),
  add constraint bookings_skipped_advisor_shape check (
    requester_role in ('student', 'technician') or advisor_decision = 'not_required'
  ),
  add constraint bookings_rejection_shape check (
    (
      status = 'rejected'
      and rejection_reason is not null
      and char_length(trim(rejection_reason)) between 1 and 2000
      and rejected_by in ('technician', 'advisor', 'dean')
    )
    or
    (status <> 'rejected' and rejection_reason is null and rejected_by is null)
  ),
  add constraint bookings_no_active_overlap exclude using gist (
    pc_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status in ('pending_technician', 'pending_advisor', 'pending_dean', 'approved'));

alter table public.approval_events
  drop constraint if exists approval_events_reviewer_role_check,
  add constraint approval_events_reviewer_role_check check (reviewer_role in ('technician', 'advisor', 'dean'));

drop index if exists public.bookings_active_calendar_idx;
create index bookings_active_calendar_idx on public.bookings (start_date, end_date, pc_id)
where status in ('pending_technician', 'pending_advisor', 'pending_dean', 'approved');

create function private.current_user_reviewed_booking(p_booking_id uuid, p_reviewer_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.approval_events as event
    where event.booking_id = p_booking_id
      and event.reviewer_id = (select auth.uid())
      and event.reviewer_role = p_reviewer_role
  )
$$;

revoke all on function private.current_user_reviewed_booking(uuid, public.app_role) from public, anon;
grant execute on function private.current_user_reviewed_booking(uuid, public.app_role) to authenticated;

drop policy if exists bookings_select_assigned_advisor on public.bookings;

create policy bookings_select_technician_queue_and_history
on public.bookings for select to authenticated
using (
  private.current_user_role() = 'technician'
  and requester_role = 'student'
  and (
    status = 'pending_technician'
    or private.current_user_reviewed_booking(id, 'technician')
  )
);

create policy bookings_select_advisor_queue_and_history
on public.bookings for select to authenticated
using (
  private.current_user_role() = 'advisor'
  and (
    (requester_role = 'student' and advisor_id = (select auth.uid()))
    or
    (
      requester_role = 'technician'
      and (
        status = 'pending_advisor'
        or private.current_user_reviewed_booking(id, 'advisor')
      )
    )
  )
);

create policy profiles_select_technician_review_context
on public.profiles for select to authenticated
using (
  private.current_user_role() = 'technician'
  and (
    (
      role = 'student'
      and exists (
        select 1
        from public.bookings as booking
        where booking.requester_id = profiles.id
          and booking.requester_role = 'student'
          and (
            booking.status = 'pending_technician'
            or private.current_user_reviewed_booking(booking.id, 'technician')
          )
      )
    )
    or
    (
      role = 'advisor'
      and exists (
        select 1
        from public.bookings as booking
        where booking.advisor_id = profiles.id
          and booking.requester_role = 'student'
          and (
            booking.status = 'pending_technician'
            or private.current_user_reviewed_booking(booking.id, 'technician')
          )
      )
    )
  )
);

create policy profiles_select_advisor_technician_requesters
on public.profiles for select to authenticated
using (
  private.current_user_role() = 'advisor'
  and role = 'technician'
  and exists (
    select 1
    from public.bookings as booking
    where booking.requester_id = profiles.id
      and booking.requester_role = 'technician'
      and (
        booking.status = 'pending_advisor'
        or private.current_user_reviewed_booking(booking.id, 'advisor')
      )
  )
);

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
    initial_status := 'pending_technician';
    initial_technician_decision := 'pending';
    initial_advisor_decision := 'pending';
    initial_dean_decision := 'waiting';
    initial_dean_decision_at := null;
    booking_advisor_id := actor.advisor_id;
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

  if actor_role = 'technician' then
    if target.requester_role <> 'student' or target.status <> 'pending_technician' then
      raise exception 'You cannot approve this request at its current stage.' using errcode = '42501';
    end if;
    update public.bookings
    set status = 'pending_advisor',
        technician_decision = 'approved',
        technician_decision_at = statement_timestamp()
    where id = target.id
    returning * into target;
  elsif actor_role = 'advisor' then
    if target.status <> 'pending_advisor'
      or not (
        (target.requester_role = 'student' and target.advisor_id = actor_id)
        or target.requester_role = 'technician'
      ) then
      raise exception 'You cannot approve this request at its current stage.' using errcode = '42501';
    end if;
    update public.bookings
    set status = 'pending_dean',
        advisor_decision = 'approved',
        advisor_decision_at = statement_timestamp(),
        dean_decision = 'pending'
    where id = target.id
    returning * into target;
  elsif actor_role = 'dean' then
    if target.status <> 'pending_dean' then
      raise exception 'Only requests pending Dean review can receive final approval.' using errcode = '42501';
    end if;
    update public.bookings
    set status = 'approved',
        dean_decision = 'approved',
        dean_decision_at = statement_timestamp()
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
  if char_length(clean_reason) > 2000 then
    raise exception 'Rejection reasons cannot exceed 2000 characters.' using errcode = '22001';
  end if;

  select role into actor_role from public.profiles where id = actor_id;
  select * into target from public.bookings where id = p_booking_id for update;

  if target.id is null then
    raise exception 'Booking was not found.' using errcode = 'P0002';
  end if;

  if actor_role = 'technician' then
    if target.requester_role <> 'student' or target.status <> 'pending_technician' then
      raise exception 'You cannot reject this request at its current stage.' using errcode = '42501';
    end if;
    update public.bookings
    set status = 'rejected',
        technician_decision = 'rejected',
        technician_decision_at = statement_timestamp(),
        advisor_decision = 'not_required',
        dean_decision = 'not_required',
        rejection_reason = clean_reason,
        rejected_by = 'technician'
    where id = target.id
    returning * into target;
  elsif actor_role = 'advisor' then
    if target.status <> 'pending_advisor'
      or not (
        (target.requester_role = 'student' and target.advisor_id = actor_id)
        or target.requester_role = 'technician'
      ) then
      raise exception 'You cannot reject this request at its current stage.' using errcode = '42501';
    end if;
    update public.bookings
    set status = 'rejected',
        advisor_decision = 'rejected',
        advisor_decision_at = statement_timestamp(),
        dean_decision = 'not_required',
        rejection_reason = clean_reason,
        rejected_by = 'advisor'
    where id = target.id
    returning * into target;
  elsif actor_role = 'dean' then
    if target.status <> 'pending_dean' then
      raise exception 'Only requests pending Dean review can be rejected by the Dean.' using errcode = '42501';
    end if;
    update public.bookings
    set status = 'rejected',
        dean_decision = 'rejected',
        dean_decision_at = statement_timestamp(),
        rejection_reason = clean_reason,
        rejected_by = 'dean'
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
      or (
        private.current_user_role() = 'technician'
        and booking.requester_role = 'student'
        and (booking.status = 'pending_technician' or private.current_user_reviewed_booking(booking.id, 'technician'))
      )
      or (
        private.current_user_role() = 'advisor'
        and (
          (booking.requester_role = 'student' and booking.advisor_id = (select auth.uid()))
          or (booking.requester_role = 'technician' and (booking.status = 'pending_advisor' or private.current_user_reviewed_booking(booking.id, 'advisor')))
        )
      )
      or private.current_user_role() = 'dean'
  from public.bookings booking
  join public.pcs pc on pc.id = booking.pc_id
  where booking.status in ('pending_technician', 'pending_advisor', 'pending_dean', 'approved')
    and booking.start_date <= p_to
    and booking.end_date >= p_from
  order by booking.start_date, booking.start_time, pc.code;
end;
$$;

create or replace function private.enforce_future_booking_start()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status in ('pending_technician', 'pending_advisor', 'pending_dean', 'approved')
    and new.starts_at <= statement_timestamp() then
    raise exception 'The booking start time must be in the future.' using errcode = '22007';
  end if;
  return new;
end;
$$;

create or replace function public.create_pc(
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
  actor_role public.app_role := private.current_user_role();
begin
  if actor_role is null or actor_role not in ('technician', 'dean') then
    raise exception 'Only a Technician or Dean can add PCs.' using errcode = '42501';
  end if;
  insert into public.pcs (code, room, specification, status, notes)
  values (
    upper(trim(p_code)), trim(p_room), coalesce(trim(p_specification), ''),
    p_status, nullif(trim(p_notes), '')
  )
  returning * into created_pc;
  return created_pc;
end;
$$;

create or replace function public.update_pc(
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
  actor_role public.app_role := private.current_user_role();
begin
  if actor_role is null or actor_role not in ('technician', 'dean') then
    raise exception 'Only a Technician or Dean can update PCs.' using errcode = '42501';
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

create or replace function public.cancel_booking(p_booking_id uuid, p_reason text)
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
  if actor_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;
  if clean_reason is null or char_length(clean_reason) < 5 then
    raise exception 'Please provide a cancellation reason of at least 5 characters.' using errcode = '23514';
  end if;
  if char_length(clean_reason) > 2000 then
    raise exception 'Cancellation reasons cannot exceed 2000 characters.' using errcode = '22001';
  end if;
  select role into actor_role from public.profiles where id = actor_id;
  if actor_role is null then
    raise exception 'An application profile is required.' using errcode = '42501';
  end if;
  select * into target from public.bookings where id = p_booking_id for update;
  if target.id is null then
    raise exception 'Booking was not found.' using errcode = 'P0002';
  end if;
  if actor_role not in ('student', 'technician', 'advisor', 'dean')
    or target.requester_id is distinct from actor_id then
    raise exception 'You can cancel only your own booking.' using errcode = '42501';
  end if;
  if target.status not in ('pending_technician', 'pending_advisor', 'pending_dean', 'approved') then
    raise exception 'Only an active booking can be cancelled.' using errcode = '23514';
  end if;
  if target.starts_at <= statement_timestamp() then
    raise exception 'A booking cannot be cancelled after its start time.' using errcode = '22007';
  end if;
  update public.bookings
  set status = 'cancelled',
      cancellation_reason = clean_reason,
      cancelled_at = statement_timestamp(),
      cancelled_by = actor_id
  where id = target.id
  returning * into target;
  return target;
end;
$$;

revoke execute on function public.create_booking(uuid, date, date, text, text, text, text) from public, anon;
revoke execute on function public.approve_booking(uuid) from public, anon;
revoke execute on function public.reject_booking(uuid, text) from public, anon;
revoke execute on function public.get_booking_calendar(date, date) from public, anon;
revoke execute on function public.create_pc(text, text, text, public.pc_status, text) from public, anon;
revoke execute on function public.update_pc(uuid, text, text, text, public.pc_status, text) from public, anon;
revoke execute on function public.cancel_booking(uuid, text) from public, anon;

grant execute on function public.create_booking(uuid, date, date, text, text, text, text) to authenticated;
grant execute on function public.approve_booking(uuid) to authenticated;
grant execute on function public.reject_booking(uuid, text) to authenticated;
grant execute on function public.get_booking_calendar(date, date) to authenticated;
grant execute on function public.create_pc(text, text, text, public.pc_status, text) to authenticated;
grant execute on function public.update_pc(uuid, text, text, text, public.pc_status, text) to authenticated;
grant execute on function public.cancel_booking(uuid, text) to authenticated;

notify pgrst, 'reload schema';
