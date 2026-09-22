create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_name text;
begin
  if new.email is null
    or new.email_confirmed_at is null
    or coalesce(new.raw_app_meta_data ->> 'provider', '') <> 'google' then
    raise exception 'A verified Google account is required.' using errcode = '42501';
  end if;

  profile_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    lower(trim(new.email)),
    left(profile_name, 120),
    'student'::public.app_role
  );

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'on_auth_user_created'
      and tgrelid = 'auth.users'::regclass
      and not tgisinternal
  ) then
    create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function private.handle_new_user();
  end if;
end;
$$;

insert into public.profiles (id, email, display_name, role)
select
  auth_user.id,
  lower(trim(auth_user.email)),
  left(
    coalesce(
      nullif(trim(auth_user.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(auth_user.raw_user_meta_data ->> 'name'), ''),
      split_part(auth_user.email, '@', 1)
    ),
    120
  ),
  'student'::public.app_role
from auth.users as auth_user
where auth_user.email is not null
  and auth_user.email_confirmed_at is not null
  and coalesce(auth_user.raw_app_meta_data ->> 'provider', '') = 'google'
  and not exists (
    select 1
    from public.profiles as existing_profile
    where existing_profile.id = auth_user.id
  )
on conflict do nothing;
