begin;

create extension if not exists pgtap with schema extensions;
select plan(37);

insert into private.role_allowlist (email, role)
values
  ('advisor.one@example.edu', 'advisor'),
  ('advisor.two@example.edu', 'advisor'),
  ('dean.one@example.edu', 'dean');

select throws_ok(
  $$
    insert into auth.users (
      id, aud, role, email, email_confirmed_at, raw_app_meta_data,
      raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous
    ) values (
      '40000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated',
      'password.user@example.edu', now(), '{"provider":"email"}', '{}',
      now(), now(), false, false
    )
  $$,
  'A verified Google account is required.',
  'non-Google identities cannot create application profiles'
);

insert into auth.users (
  id,
  aud,
  role,
  email,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  is_sso_user,
  is_anonymous
)
values
  ('10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'student.one@example.edu', now(), '{"provider":"google"}', '{"full_name":"Student One"}', now(), now(), false, false),
  ('10000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'student.two@example.edu', now(), '{"provider":"google"}', '{"full_name":"Student Two"}', now(), now(), false, false),
  ('20000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'advisor.one@example.edu', now(), '{"provider":"google"}', '{"full_name":"Advisor One"}', now(), now(), false, false),
  ('20000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'advisor.two@example.edu', now(), '{"provider":"google"}', '{"full_name":"Advisor Two"}', now(), now(), false, false),
  ('30000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'dean.one@example.edu', now(), '{"provider":"google"}', '{"full_name":"Dean One"}', now(), now(), false, false);

update public.profiles
set university_id = case
      when id = '10000000-0000-0000-0000-000000000001' then '65315001'
      when id = '10000000-0000-0000-0000-000000000002' then '65315002'
      else university_id
    end,
    advisor_id = case
      when id = '10000000-0000-0000-0000-000000000001' then '20000000-0000-0000-0000-000000000001'::uuid
      else advisor_id
    end;

select is(
  (select role::text from public.profiles where id = '10000000-0000-0000-0000-000000000001'),
  'student',
  'new users default to Student'
);
select is(
  (select role::text from public.profiles where id = '20000000-0000-0000-0000-000000000001'),
  'advisor',
  'allowlisted Advisor receives the trusted role'
);
select is(
  (select role::text from public.profiles where id = '30000000-0000-0000-0000-000000000001'),
  'dean',
  'allowlisted Dean receives the trusted role'
);
select throws_ok(
  $$
    update public.profiles
    set advisor_id = '10000000-0000-0000-0000-000000000001'
    where id = '10000000-0000-0000-0000-000000000002'
  $$,
  'Assigned advisor must have the Advisor role.',
  'profile integrity rejects an Advisor assignment to a non-Advisor'
);

set local role anon;
select set_config('request.jwt.claims', '{}', true);
select throws_ok(
  $$ select count(*) from public.pcs $$,
  'permission denied for table pcs',
  'anonymous users cannot read PC inventory'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);
select is((select count(*) from public.pcs), 10::bigint, 'authenticated students can read PC inventory');
select is(
  (select count(*) from public.profiles),
  2::bigint,
  'Student can read only their profile and assigned Advisor profile'
);
select throws_ok(
  $$ update public.profiles set role = 'dean' where id = '10000000-0000-0000-0000-000000000001' $$,
  'permission denied for table profiles',
  'students cannot promote their own role'
);
select throws_ok(
  $$ insert into public.bookings default values $$,
  'permission denied for table bookings',
  'Students cannot bypass the booking RPC with a direct insert'
);
select lives_ok(
  $$
    select public.create_booking(
      (select id from public.pcs where code = 'PC-01'),
      date '2099-01-10',
      date '2099-01-10',
      '09:00',
      '11:00',
      'Database security integration test',
      'SE Test'
    )
  $$,
  'assigned Student can create a valid booking'
);
select is(
  (select status::text from public.bookings where student_id = '10000000-0000-0000-0000-000000000001'),
  'pending_advisor',
  'new booking starts at the Advisor stage'
);
select throws_ok(
  $$
    select public.create_booking(
      (select id from public.pcs where code = 'PC-01'),
      date '2099-01-10',
      date '2099-01-10',
      '10:00',
      '12:00',
      'Overlapping database integration test',
      'SE Test'
    )
  $$,
  'This PC is unavailable during the selected time.',
  'database exclusion constraint rejects overlap'
);
select throws_ok(
  $$ select public.approve_booking((select id from public.bookings limit 1)) $$,
  'Your role cannot approve booking requests.',
  'Student cannot approve a request'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated"}',
  true
);
select is((select count(*) from public.bookings), 0::bigint, 'another Student cannot read a private booking');
select is(
  (select count(*) from public.get_booking_calendar(date '2099-01-10', date '2099-01-10')),
  1::bigint,
  'another Student can see sanitized occupied calendar time'
);
select is(
  (select can_view_details from public.get_booking_calendar(date '2099-01-10', date '2099-01-10') limit 1),
  false,
  'another Student cannot open private booking details'
);
select throws_ok(
  $$
    select public.create_booking(
      (select id from public.pcs where code = 'PC-02'),
      date '2099-01-10',
      date '2099-01-10',
      '09:00',
      '11:00',
      'Request without an assigned advisor',
      'SE Test'
    )
  $$,
  'Your account does not have an assigned advisor yet.',
  'unassigned Student cannot create a booking'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"20000000-0000-0000-0000-000000000002","role":"authenticated"}',
  true
);
select is((select count(*) from public.bookings), 0::bigint, 'unassigned Advisor cannot read another Advisor request');
select throws_ok(
  $$ select public.approve_booking((select id from public.get_booking_calendar(date '2099-01-10', date '2099-01-10') limit 1)) $$,
  'You cannot approve this request at its current stage.',
  'unassigned Advisor cannot approve another Advisor request'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"30000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);
select is((select count(*) from public.bookings), 0::bigint, 'Dean cannot read requests that have not passed Advisor review');
select is((select count(*) from public.profiles), 1::bigint, 'Dean cannot browse unrelated Student or Advisor profiles');
select throws_ok(
  $$ select public.approve_booking((select id from public.get_booking_calendar(date '2099-01-10', date '2099-01-10') limit 1)) $$,
  'Only requests pending Dean review can receive final approval.',
  'Dean cannot bypass the Advisor stage'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"20000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);
select is((select count(*) from public.bookings), 1::bigint, 'assigned Advisor can read the request');
select lives_ok(
  $$ select public.approve_booking((select id from public.bookings limit 1)) $$,
  'assigned Advisor can approve the request'
);
select is((select status::text from public.bookings limit 1), 'pending_dean', 'Advisor approval advances to Dean review');
select is((select count(*) from public.approval_events), 1::bigint, 'Advisor decision creates an audit event');

select set_config(
  'request.jwt.claims',
  '{"sub":"30000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);
select is((select count(*) from public.bookings where status = 'pending_dean'), 1::bigint, 'Dean can read requests awaiting final review');
select is((select count(*) from public.profiles), 3::bigint, 'Dean can read only profiles participating in visible requests plus their own');
select lives_ok(
  $$ select public.approve_booking((select id from public.bookings where status = 'pending_dean' limit 1)) $$,
  'Dean can grant final approval'
);
select is((select status::text from public.bookings limit 1), 'approved', 'Dean approval confirms the booking');
select is((select count(*) from public.approval_events), 2::bigint, 'both review decisions remain in the audit trail');

select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);
select lives_ok(
  $$
    select public.create_booking(
      (select id from public.pcs where code = 'PC-02'),
      date '2099-01-10',
      date '2099-01-10',
      '13:00',
      '15:00',
      'Rejection workflow integration test',
      'SE Test'
    )
  $$,
  'Student can create a second non-conflicting request'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"20000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);
select throws_ok(
  $$ select public.reject_booking((select id from public.bookings where pc_id = (select id from public.pcs where code = 'PC-02')), '   ') $$,
  'A rejection reason is required.',
  'Advisor rejection requires a reason'
);
select lives_ok(
  $$ select public.reject_booking((select id from public.bookings where pc_id = (select id from public.pcs where code = 'PC-02')), 'PC requires maintenance before this session.') $$,
  'assigned Advisor can reject a pending request'
);
select is(
  (select status::text from public.bookings where pc_id = (select id from public.pcs where code = 'PC-02')),
  'rejected',
  'Advisor rejection closes the request'
);
select is((select count(*) from public.approval_events), 3::bigint, 'rejection adds an immutable audit event');

select * from finish();
rollback;
