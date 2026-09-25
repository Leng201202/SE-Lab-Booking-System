-- A 10-digit Lamduan Google email local-part is the authoritative Student ID
-- (e.g. 6631503086@lamduan.mfu.ac.th). Capture it automatically at signup.
-- Other Student accounts may provide a 10-digit ID through the guarded RPC
-- below. A uniqueness collision must never abort Auth profile creation.

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_name text;
  email_local_part text;
  derived_university_id text;
  violated_constraint text;
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

  email_local_part := split_part(lower(trim(new.email)), '@', 1);

  if lower(trim(new.email)) ~ '^[0-9]{10}@lamduan[.]mfu[.]ac[.]th$' then
    derived_university_id := email_local_part;
  else
    derived_university_id := null;
  end if;

  begin
    insert into public.profiles (id, email, display_name, role, university_id)
    values (
      new.id,
      lower(trim(new.email)),
      left(profile_name, 120),
      'student'::public.app_role,
      derived_university_id
    );
  exception when unique_violation then
    get stacked diagnostics violated_constraint = constraint_name;

    -- A manually entered ID may already occupy this unique value. Preserve
    -- sign-in by creating the profile without an ID; an administrator can
    -- resolve the conflicting identity without a generic Auth callback error.
    if derived_university_id is null
      or violated_constraint <> 'profiles_university_id_key' then
      raise;
    end if;

    insert into public.profiles (id, email, display_name, role, university_id)
    values (
      new.id,
      lower(trim(new.email)),
      left(profile_name, 120),
      'student'::public.app_role,
      null
    );
  end;

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

-- Student IDs are identity data. Remove the broad column write granted by the
-- initial schema before backfilling, then briefly block concurrent profile
-- writes so the collision check and update remain race-free.
revoke update (university_id) on public.profiles from authenticated;

-- Backfill accounts that signed up before this change, under a lamduan
-- email, and never manually set a Student ID.
do $backfill$
begin
  lock table public.profiles in share row exclusive mode;

  update public.profiles as profile
  set university_id = split_part(profile.email, '@', 1)
  where profile.university_id is null
    and profile.email ~ '^[0-9]{10}@lamduan[.]mfu[.]ac[.]th$'
    and not exists (
      select 1
      from public.profiles as claimant
      where claimant.id <> profile.id
        and claimant.university_id = split_part(profile.email, '@', 1)
    );
end;
$backfill$;

create function public.update_my_student_id(p_university_id text)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  actor public.profiles;
  clean_university_id text := trim(p_university_id);
  email_local_part text;
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
  if actor.role <> 'student' then
    raise exception 'Only Students can update a Student ID.' using errcode = '42501';
  end if;
  if clean_university_id is null or clean_university_id !~ '^[0-9]{10}$' then
    raise exception 'Student ID must contain exactly 10 digits.' using errcode = '23514';
  end if;

  email_local_part := split_part(actor.email, '@', 1);

  if actor.email ~ '^[0-9]{10}@lamduan[.]mfu[.]ac[.]th$'
    and clean_university_id <> email_local_part then
    raise exception 'Your Student ID must match your Lamduan email.' using errcode = '23514';
  end if;

  begin
    update public.profiles
    set university_id = clean_university_id
    where id = actor.id
    returning * into actor;
  exception when unique_violation then
    raise exception 'This Student ID is already in use.' using errcode = '23505';
  end;

  return actor;
end;
$$;

revoke all on function public.update_my_student_id(text) from public, anon;
grant execute on function public.update_my_student_id(text) to authenticated;

-- Require a Student ID on file before a Student can submit a booking
-- request. Lamduan students already have one auto-filled above; anyone
-- else must set theirs on their Profile page first.
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
    if actor.university_id is null then
      raise exception 'Add your Student ID on your Profile page before requesting a booking.' using errcode = '23514';
    end if;
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

revoke execute on function public.create_booking(uuid, date, date, text, text, text, text) from public, anon;
grant execute on function public.create_booking(uuid, date, date, text, text, text, text) to authenticated;

notify pgrst, 'reload schema';
