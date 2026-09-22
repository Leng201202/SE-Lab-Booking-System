create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_name text;
begin
  -- Supabase may finalize email_confirmed_at after the initial auth.users insert.
  -- The provider metadata is controlled by Supabase Auth and is available when
  -- this trigger runs, so it is the reliable boundary for Google-only signup.
  if new.email is null
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
