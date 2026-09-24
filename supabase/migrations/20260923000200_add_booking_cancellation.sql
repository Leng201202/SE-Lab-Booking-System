alter table public.bookings
  add column cancellation_reason text,
  add column cancelled_at timestamptz,
  add column cancelled_by uuid references public.profiles (id);

update public.bookings
set cancellation_reason = 'Cancelled before cancellation reasons were recorded',
    cancelled_at = coalesce(updated_at, created_at),
    cancelled_by = requester_id
where status = 'cancelled';

alter table public.bookings
  add constraint bookings_cancellation_shape check (
    (
      status = 'cancelled'
      and cancellation_reason is not null
      and char_length(trim(cancellation_reason)) between 5 and 2000
      and cancelled_at is not null
      and cancelled_by is not null
      and cancelled_by = requester_id
    )
    or
    (
      status <> 'cancelled'
      and cancellation_reason is null
      and cancelled_at is null
      and cancelled_by is null
    )
  );

create index bookings_cancelled_by_idx
on public.bookings (cancelled_by)
where cancelled_by is not null;

create function public.cancel_booking(p_booking_id uuid, p_reason text)
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

  select role into actor_role
  from public.profiles
  where id = actor_id;

  if actor_role is null then
    raise exception 'An application profile is required.' using errcode = '42501';
  end if;

  select * into target
  from public.bookings
  where id = p_booking_id
  for update;

  if target.id is null then
    raise exception 'Booking was not found.' using errcode = 'P0002';
  end if;
  if actor_role not in ('student', 'advisor') or target.requester_id is distinct from actor_id then
    raise exception 'You can cancel only your own Student or Advisor booking.' using errcode = '42501';
  end if;
  if target.status not in ('pending_advisor', 'pending_dean', 'approved') then
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

revoke execute on function public.cancel_booking(uuid, text) from public, anon;
grant execute on function public.cancel_booking(uuid, text) to authenticated;

notify pgrst, 'reload schema';
