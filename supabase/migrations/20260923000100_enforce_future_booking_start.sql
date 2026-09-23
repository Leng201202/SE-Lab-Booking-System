create function private.enforce_future_booking_start()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status in ('pending_advisor', 'pending_dean', 'approved')
    and new.starts_at <= statement_timestamp() then
    raise exception 'The booking start time must be in the future.' using errcode = '22007';
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_future_booking_start() from public, anon, authenticated;

create trigger bookings_require_future_start
before insert or update of starts_at, status on public.bookings
for each row execute function private.enforce_future_booking_start();
