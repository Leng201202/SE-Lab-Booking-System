-- QA exploratory and retest cases (QA / Test role).
--
-- Purpose: cover MUST behaviour that the team suite does not name directly
-- (B4 multi-day and lab-hour rules, B9 overlap across access modes, B10
-- anonymous calendar access) and retest open bugs BUG-07 and BUG-08.
--
-- Each assertion states the CORRECT behaviour. Assertions for bugs that are
-- still open are wrapped in todo_start()/todo_end(), so they report as
-- "not ok ... # TODO" (known failure) without failing the run. When a bug is
-- fixed, the TODO assertion starts passing ("ok ... # TODO") and the TODO
-- wrapper should be removed.
--
-- Run against a local database that has every migration applied:
--   docker exec -i supabase_db_SE-Lab-Booking-System \
--     psql -U postgres -d postgres -qAt < test/qa-retest.test.sql
-- Everything runs inside one transaction and is rolled back.

begin;

create extension if not exists pgtap with schema extensions;
select plan(13);

insert into auth.users (
  id, aud, role, email, email_confirmed_at, raw_app_meta_data,
  raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous
)
values
  ('61000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'qa.student@example.edu', now(), '{"provider":"google"}', '{"full_name":"QA Student"}', now(), now(), false, false),
  ('61000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'qa.leaver@example.edu', now(), '{"provider":"google"}', '{"full_name":"QA Leaver"}', now(), now(), false, false),
  ('63000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'qa.advisor@example.edu', now(), '{"provider":"google"}', '{"full_name":"QA Advisor"}', now(), now(), false, false);

insert into private.role_allowlist (email, role)
values ('qa.advisor@example.edu', 'advisor');

-- Allowlisted roles are applied by the sign-up trigger; set it again in case
-- the allowlist row was added after the auth.users insert.
update public.profiles set role = 'advisor' where id = '63000000-0000-0000-0000-000000000001';

update public.profiles
set university_id = case id
      when '61000000-0000-0000-0000-000000000001' then '6631509101'
      when '61000000-0000-0000-0000-000000000002' then '6631509102'
    end
where id in ('61000000-0000-0000-0000-000000000001', '61000000-0000-0000-0000-000000000002');

-- ---------------------------------------------------------------------------
-- B4: one-day lab session and multi-day remote reservation rules
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"61000000-0000-0000-0000-000000000001","role":"authenticated"}', true);

select lives_ok(
  $$ select public.create_booking(
       (select id from public.pcs where code = 'PC-01'),
       current_date + 20, current_date + 22, null, null,
       'Overnight model training run', null,
       '63000000-0000-0000-0000-000000000001') $$,
  'QA-01 (B4) Student can request a multi-day reservation'
);

select is(
  (select access_mode::text from public.bookings
    where requester_id = '61000000-0000-0000-0000-000000000001'
      and start_date = current_date + 20),
  'remote',
  'QA-02 (B4) a multi-day reservation is stored as remote access'
);

select is(
  (select ends_at - starts_at from public.bookings
    where requester_id = '61000000-0000-0000-0000-000000000001'
      and start_date = current_date + 20),
  interval '3 days',
  'QA-03 (B4) a 3-day reservation blocks three whole Bangkok days'
);

select throws_ok(
  $$ select public.create_booking(
       (select id from public.pcs where code = 'PC-02'),
       current_date + 20, current_date + 20, '07:00', '09:00',
       'Early lab session', null,
       '63000000-0000-0000-0000-000000000001') $$,
  'One-day bookings must be within lab hours, 08:00–18:00, with the end after the start.',
  'QA-04 (B4) a one-day session before 08:00 is rejected'
);

select throws_ok(
  $$ select public.create_booking(
       (select id from public.pcs where code = 'PC-02'),
       current_date + 20, current_date + 20, '09:10', '10:00',
       'Odd start time', null,
       '63000000-0000-0000-0000-000000000001') $$,
  'Booking times must use 15-minute intervals.',
  'QA-05 (B4) a one-day session off the 15-minute grid is rejected'
);

-- ---------------------------------------------------------------------------
-- B9: a one-day lab session cannot overlap an existing multi-day reservation
-- ---------------------------------------------------------------------------
select throws_like(
  $$ select public.create_booking(
       (select id from public.pcs where code = 'PC-01'),
       current_date + 21, current_date + 21, '10:00', '11:00',
       'Lab session inside a remote block', null,
       '63000000-0000-0000-0000-000000000001') $$,
  '%',
  'QA-06 (B9) a lab session inside an active multi-day reservation is rejected'
);

select is(
  (select count(*)::int from public.bookings
    where pc_id = (select id from public.pcs where code = 'PC-01')
      and start_date <= current_date + 21 and end_date >= current_date + 21),
  1,
  'QA-07 (B9) only one active booking exists for that PC and day'
);

-- B5: the requester's purpose is not exposed through the shared calendar
select is(
  (select count(*)::int from public.get_booking_calendar(current_date + 19, current_date + 23) c
    where to_jsonb(c)::text like '%Overnight model training run%'),
  0,
  'QA-08 (B5) the shared calendar does not return the booking purpose'
);
reset role;

-- ---------------------------------------------------------------------------
-- B10: signed-out visitors cannot read calendar occupancy
-- ---------------------------------------------------------------------------
set local role anon;
select throws_like(
  $$ select * from public.get_booking_calendar(current_date, current_date + 30) $$,
  '%permission denied%',
  'QA-09 (B10) anonymous visitors cannot call the calendar function'
);
select throws_like(
  $$ select count(*) from public.bookings $$,
  '%permission denied%',
  'QA-10 (B10) anonymous visitors cannot read the bookings table'
);
reset role;

-- ---------------------------------------------------------------------------
-- BUG-07 / B28 retest: a deactivated account must lose database access
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"61000000-0000-0000-0000-000000000002","role":"authenticated"}', true);
select public.request_account_deletion();

select todo_start('BUG-07 open: deactivated sessions are not checked in create_booking');
select throws_like(
  $$ select public.create_booking(
       (select id from public.pcs where code = 'PC-03'),
       current_date + 25, current_date + 25, '09:00', '10:00',
       'Booking after deactivation', null,
       '63000000-0000-0000-0000-000000000001') $$,
  '%deactivated%',
  'QA-11 (BUG-07) a deactivated account cannot create a booking'
);
select todo_end();

select todo_start('BUG-07 open: deactivated sessions can still read calendar occupancy');
select throws_like(
  $$ select * from public.get_booking_calendar(current_date, current_date + 30) $$,
  '%deactivated%',
  'QA-12 (BUG-07) a deactivated account cannot read the shared calendar'
);
select todo_end();
reset role;

-- ---------------------------------------------------------------------------
-- BUG-08 / B38 retest: an automatic cleanup for expired accounts must exist
-- ---------------------------------------------------------------------------
select todo_start('BUG-08 open: no cleanup function or scheduled job exists');
select ok(
  exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname in ('public', 'private')
      and p.proname ~ '(cleanup|purge|pseudonym|erase)'
  ),
  'QA-13 (BUG-08) a cleanup or pseudonymization routine exists for expired accounts'
);
select todo_end();

select * from finish();
rollback;
