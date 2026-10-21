begin;

create extension if not exists pgtap with schema extensions;
select plan(27);

insert into auth.users (
  id, aud, role, email, email_confirmed_at, raw_app_meta_data,
  raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous
)
values
  ('51000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'selector.student@example.edu', now(), '{"provider":"google"}', '{"full_name":"Selector Student"}', now(), now(), false, false),
  ('51000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'other.student@example.edu', now(), '{"provider":"google"}', '{"full_name":"Other Student"}', now(), now(), false, false),
  ('52000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'selection.technician@example.edu', now(), '{"provider":"google"}', '{"full_name":"Selection Technician"}', now(), now(), false, false),
  ('53000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'alpha.advisor@example.edu', now(), '{"provider":"google"}', '{"full_name":"Alpha Advisor"}', now(), now(), false, false),
  ('53000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'beta.advisor@example.edu', now(), '{"provider":"google"}', '{"full_name":"Beta Advisor"}', now(), now(), false, false),
  ('53000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'departed.advisor@example.edu', now(), '{"provider":"google"}', '{"full_name":"Departed Advisor"}', now(), now(), false, false),
  ('53000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'gamma.advisor@example.edu', now(), '{"provider":"google"}', '{"full_name":"Gamma Advisor"}', now(), now(), false, false),
  ('54000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'selection.dean@example.edu', now(), '{"provider":"google"}', '{"full_name":"Selection Dean"}', now(), now(), false, false);

insert into private.role_allowlist (email, role)
values
  ('selection.technician@example.edu', 'technician'),
  ('alpha.advisor@example.edu', 'advisor'),
  ('beta.advisor@example.edu', 'advisor'),
  ('departed.advisor@example.edu', 'advisor'),
  ('gamma.advisor@example.edu', 'advisor'),
  ('selection.dean@example.edu', 'dean');

update public.profiles
set university_id = case id
      when '51000000-0000-0000-0000-000000000001' then '6631509001'
      when '51000000-0000-0000-0000-000000000002' then '6631509002'
    end
where id in ('51000000-0000-0000-0000-000000000001', '51000000-0000-0000-0000-000000000002');

update public.profiles
set is_deactivated = true,
    deletion_requested_at = now()
where id = '53000000-0000-0000-0000-000000000003';

-- Advisor listing
set local role anon;
select set_config('request.jwt.claims', '{}', true);
select throws_ok(
  $$ select * from public.list_booking_advisors() $$,
  'permission denied for function list_booking_advisors',
  'anonymous users cannot list Advisors'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"51000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);
select results_eq(
  $$ select id from public.list_booking_advisors() $$,
  $$ values ('53000000-0000-0000-0000-000000000001'::uuid), ('53000000-0000-0000-0000-000000000002'::uuid), ('53000000-0000-0000-0000-000000000004'::uuid) $$,
  'Student without an assigned Advisor sees every active Advisor, sorted by name'
);
select is(
  (select display_name from public.list_booking_advisors() limit 1),
  'Alpha Advisor',
  'the Advisor listing returns display names'
);

-- Advisor validation on create_booking
select throws_ok(
  $$
    select public.create_booking(
      (select id from public.pcs where code = 'PC-07'),
      date '2099-02-10', date '2099-02-10', '09:00', '10:00',
      'Missing advisor selection', 'SE Test', null
    )
  $$,
  'Select an Advisor to review this booking request.',
  'booking creation fails when the Advisor ID is omitted'
);
select throws_ok(
  $$
    select public.create_booking(
      (select id from public.pcs where code = 'PC-07'),
      date '2099-02-10', date '2099-02-10', '09:00', '10:00',
      'Malformed advisor selection', 'SE Test', 'not-a-uuid'
    )
  $$,
  '22P02',
  null,
  'booking creation fails when the Advisor ID is malformed'
);
select throws_ok(
  $$
    select public.create_booking(
      (select id from public.pcs where code = 'PC-07'),
      date '2099-02-10', date '2099-02-10', '09:00', '10:00',
      'Unknown advisor selection', 'SE Test', '59999999-0000-0000-0000-000000000000'
    )
  $$,
  'The selected Advisor is not eligible to review booking requests.',
  'booking creation fails when the Advisor does not exist'
);
select throws_ok(
  $$
    select public.create_booking(
      (select id from public.pcs where code = 'PC-07'),
      date '2099-02-10', date '2099-02-10', '09:00', '10:00',
      'Technician as advisor selection', 'SE Test', '52000000-0000-0000-0000-000000000001'
    )
  $$,
  'The selected Advisor is not eligible to review booking requests.',
  'booking creation fails when the selected profile is not an Advisor'
);
select throws_ok(
  $$
    select public.create_booking(
      (select id from public.pcs where code = 'PC-07'),
      date '2099-02-10', date '2099-02-10', '09:00', '10:00',
      'Deactivated advisor selection', 'SE Test', '53000000-0000-0000-0000-000000000003'
    )
  $$,
  'The selected Advisor is not eligible to review booking requests.',
  'booking creation fails when the selected Advisor is deactivated'
);

-- Existing validation still applies alongside the Advisor rule
select throws_ok(
  $$
    select public.create_booking(
      (select id from public.pcs where code = 'PC-07'),
      date '2099-02-10', date '2099-02-10', '11:00', '10:00',
      'Reversed time range', 'SE Test', '53000000-0000-0000-0000-000000000001'
    )
  $$,
  'One-day bookings must be within lab hours, 08:00–18:00, with the end after the start.',
  'an invalid time range is still rejected with a valid Advisor'
);
select throws_ok(
  $$
    select public.create_booking(
      (select id from public.pcs where code = 'PC-04'),
      date '2099-02-10', date '2099-02-10', '09:00', '10:00',
      'Maintenance PC request', 'SE Test', '53000000-0000-0000-0000-000000000001'
    )
  $$,
  'The selected PC is not available for booking.',
  'an unavailable PC is still rejected with a valid Advisor'
);

select lives_ok(
  $$
    select public.create_booking(
      (select id from public.pcs where code = 'PC-07'),
      date '2099-02-10', date '2099-02-10', '09:00', '10:00',
      'Alpha advisor booking', 'SE Test', '53000000-0000-0000-0000-000000000001'
    )
  $$,
  'Student can book with a selected Advisor'
);
select lives_ok(
  $$
    select public.create_booking(
      (select id from public.pcs where code = 'PC-09'),
      date '2099-02-11', date '2099-02-11', '09:00', '10:00',
      'Beta advisor booking', 'SE Test', '53000000-0000-0000-0000-000000000002'
    )
  $$,
  'Student can book again with a different Advisor'
);
select results_eq(
  $$
    select advisor_id, requester_id
    from public.bookings
    order by start_date
  $$,
  $$
    values
      ('53000000-0000-0000-0000-000000000001'::uuid, '51000000-0000-0000-0000-000000000001'::uuid),
      ('53000000-0000-0000-0000-000000000002'::uuid, '51000000-0000-0000-0000-000000000001'::uuid)
  $$,
  'each booking stores its own Advisor and the authenticated requester'
);
select results_eq(
  $$
    select profile.display_name
    from public.bookings as booking
    join public.profiles as profile on profile.id = booking.advisor_id
    order by booking.start_date
  $$,
  $$ values ('Alpha Advisor'::text), ('Beta Advisor'::text) $$,
  'Student can read the Advisor named on their own bookings'
);
select is(
  (select count(*) from public.profiles where role = 'advisor'),
  2::bigint,
  'Student cannot read Advisors who are not on their bookings'
);
select throws_ok(
  $$
    select public.create_booking(
      (select id from public.pcs where code = 'PC-07'),
      date '2099-02-10', date '2099-02-10', '09:30', '10:30',
      'Overlapping selected advisor booking', 'SE Test', '53000000-0000-0000-0000-000000000002'
    )
  $$,
  'This PC is unavailable during the selected time.',
  'workstation conflicts are still rejected with a valid Advisor'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"51000000-0000-0000-0000-000000000002","role":"authenticated"}',
  true
);
select is(
  (select count(*) from public.bookings),
  0::bigint,
  'another Student cannot read bookings that name an Advisor'
);
select throws_ok(
  $$ select public.cancel_booking((select id from public.get_booking_calendar(date '2099-02-10', date '2099-02-10') limit 1), 'Trying to cancel someone else') $$,
  'You can cancel only your own booking.',
  'booking ownership still prevents cancelling another Student request'
);

-- Only Student requests carry a selected Advisor
select set_config(
  'request.jwt.claims',
  '{"sub":"52000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);
select throws_ok(
  $$
    select public.create_booking(
      (select id from public.pcs where code = 'PC-10'),
      date '2099-02-12', date '2099-02-12', '09:00', '10:00',
      'Technician picking an advisor', 'SE Test', '53000000-0000-0000-0000-000000000001'
    )
  $$,
  'Only Student booking requests select an Advisor.',
  'non-Student requesters cannot attach an Advisor'
);
select lives_ok(
  $$ select public.approve_booking((select id from public.bookings where purpose = 'Alpha advisor booking')) $$,
  'Technician can advance the Alpha Advisor request'
);

-- Review context follows the booking's Advisor
select set_config(
  'request.jwt.claims',
  '{"sub":"53000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);
select is(
  (select count(*) from public.bookings),
  1::bigint,
  'Alpha Advisor sees only the request addressed to them'
);
select is(
  (select display_name from public.profiles where id = '51000000-0000-0000-0000-000000000001'),
  'Selector Student',
  'Advisor can read the requester of a request addressed to them'
);
select is(
  (select count(*) from public.profiles where id = '51000000-0000-0000-0000-000000000002'),
  0::bigint,
  'Advisor cannot browse unrelated Students'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"53000000-0000-0000-0000-000000000002","role":"authenticated"}',
  true
);
select throws_ok(
  $$ select public.approve_booking((select id from public.get_booking_calendar(date '2099-02-10', date '2099-02-10') limit 1)) $$,
  'You cannot approve this request at its current stage.',
  'an Advisor who was not selected cannot approve the request'
);

-- An Advisor named on unresolved requests keeps the role
select set_config(
  'request.jwt.claims',
  '{"sub":"54000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);
select throws_ok(
  $$ select public.set_user_role('53000000-0000-0000-0000-000000000001', 'student') $$,
  'An Advisor with unresolved Student requests cannot change roles.',
  'Advisor with unresolved requests cannot be demoted'
);
select lives_ok(
  $$ select public.set_user_role('53000000-0000-0000-0000-000000000004', 'student') $$,
  'Advisor with no unresolved requests can change roles'
);

reset role;
select is(
  (select count(*) from pg_proc where proname = 'current_user_advisor_id'),
  0::bigint,
  'the profile Advisor helper is removed'
);

select * from finish();
rollback;
