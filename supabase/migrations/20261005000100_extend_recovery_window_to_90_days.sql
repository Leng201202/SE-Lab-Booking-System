-- Extend the account recovery window from 7 days to 90 days.
-- Replaces reactivate_my_account() from 20260925000100_add_account_deletion.sql.

create or replace function public.reactivate_my_account()
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  actor public.profiles;
begin
  if actor_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select * into actor
  from public.profiles
  where id = actor_id
  for update;

  if actor.id is null then
    raise exception 'An application profile is required.' using errcode = '42501';
  end if;
  if actor.is_deactivated = false then
    raise exception 'This account is not scheduled for deletion.' using errcode = '42501';
  end if;
  if actor.deletion_requested_at < now() - interval '90 days' then
    raise exception 'The 90-day recovery period has expired. This account can no longer be reactivated.' using errcode = '42501';
  end if;

  update public.profiles
  set is_deactivated = false,
      deletion_requested_at = null
  where id = actor.id
  returning * into actor;

  return actor;
end;
$$;

revoke all on function public.reactivate_my_account() from public, anon;
grant execute on function public.reactivate_my_account() to authenticated;
