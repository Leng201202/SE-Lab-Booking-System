drop policy if exists bookings_select_advisor_queue_and_history on public.bookings;

create policy bookings_select_advisor_queue_and_history
on public.bookings for select to authenticated
using (
  private.current_user_role() = 'advisor'
  and (
    (
      requester_role = 'student'
      and advisor_id = (select auth.uid())
      and (
        status = 'pending_advisor'
        or private.current_user_reviewed_booking(id, 'advisor')
      )
    )
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
          (
            booking.requester_role = 'student'
            and booking.advisor_id = (select auth.uid())
            and (booking.status = 'pending_advisor' or private.current_user_reviewed_booking(booking.id, 'advisor'))
          )
          or
          (
            booking.requester_role = 'technician'
            and (booking.status = 'pending_advisor' or private.current_user_reviewed_booking(booking.id, 'advisor'))
          )
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

create or replace function public.assign_student_advisor(p_student_id uuid, p_advisor_id uuid default null)
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
  select role into actor_role
  from public.profiles
  where id = actor_id;

  if actor_role is null or actor_role not in ('advisor', 'dean') then
    raise exception 'Only an Advisor or Dean can manage advisees.' using errcode = '42501';
  end if;

  select * into student
  from public.profiles
  where id = p_student_id
  for update;

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
    select 1
    from public.profiles as advisor
    where advisor.id = p_advisor_id
      and advisor.role = 'advisor'
  ) then
    raise exception 'The selected Advisor is not eligible.' using errcode = '23514';
  end if;

  update public.profiles
  set advisor_id = p_advisor_id
  where id = student.id
  returning * into student;

  -- Keep completed review history attributed to its original Advisor. When a
  -- released Student is claimed again, only requests that still need Advisor
  -- review move to the new Advisor in the same transaction.
  if p_advisor_id is not null then
    update public.bookings
    set advisor_id = p_advisor_id
    where requester_id = student.id
      and requester_role = 'student'
      and status in ('pending_technician', 'pending_advisor')
      and advisor_id is distinct from p_advisor_id;
  end if;

  return student;
end;
$$;

revoke execute on function public.assign_student_advisor(uuid, uuid) from public, anon;
grant execute on function public.assign_student_advisor(uuid, uuid) to authenticated;

notify pgrst, 'reload schema';
