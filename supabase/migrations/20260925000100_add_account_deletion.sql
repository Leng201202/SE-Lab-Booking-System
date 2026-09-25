-- Soft-delete account deletion with a 7-day login-based recovery window.
--
-- Workflow:
--   1. request_account_deletion() marks the caller's own profile deactivated
--      and records when deletion was requested. The client logs the user
--      out immediately afterwards.
--   2. On a later sign-in, the client reads is_deactivated/deletion_requested_at
--      from the profile and shows a reactivation screen instead of the
--      dashboard while the 7-day window is open.
--   3. reactivate_my_account() clears the deactivation if called within the
--      7-day window; it raises an error once the window has passed, so the
--      account remains soft-deleted (ready for a future hard-cleanup job).

alter table public.profiles
  add column is_deactivated boolean not null default false,
  add column deletion_requested_at timestamptz;

alter table public.profiles
  add constraint profiles_deletion_requested_at_consistency check (
    (is_deactivated = false and deletion_requested_at is null)
    or (is_deactivated = true and deletion_requested_at is not null)
  );

create function public.request_account_deletion()
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

  update public.profiles
  set is_deactivated = true,
      deletion_requested_at = now()
  where id = actor_id
    and is_deactivated = false
  returning * into actor;

  if actor.id is null then
    raise exception 'This account is already scheduled for deletion.' using errcode = '42501';
  end if;

  return actor;
end;
$$;

revoke all on function public.request_account_deletion() from public, anon;
grant execute on function public.request_account_deletion() to authenticated;

create function public.reactivate_my_account()
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
  if actor.deletion_requested_at < now() - interval '7 days' then
    raise exception 'The 7-day recovery period has expired. This account can no longer be reactivated.' using errcode = '42501';
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

-- Defense in depth: while an account is deactivated, no other RPC should be
-- able to change its profile row except reactivate_my_account() itself
-- (which is the only path that flips is_deactivated back to false in the
-- same statement). This blocks things like a still-deactivated Student
-- calling update_my_student_id(), without touching the body of any
-- existing function.
create function private.block_profile_writes_while_deactivated()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.is_deactivated and new.is_deactivated then
    raise exception 'This account is deactivated and pending deletion.' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger profiles_block_writes_while_deactivated
before update on public.profiles
for each row execute function private.block_profile_writes_while_deactivated();
