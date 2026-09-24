begin;

create extension if not exists pgtap with schema extensions;
select plan(73);

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
  id, aud, role, email, email_confirmed_at, raw_app_meta_data,
  raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous
) values (
  '40000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated',
  'new.google.user@example.edu', null, '{"provider":"google"}', '{"full_name":"New Google User"}',
  now(), now(), false, false
);

select is(
  (select role::text from public.profiles where id = '40000000-0000-0000-0000-000000000002'),
  'student',
  'Google signup creates a Student profile before email confirmation is finalized'
);

delete from auth.users where id = '40000000-0000-0000-0000-000000000002';

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

select is(
  (select role::text from public.profiles where id = '20000000-0000-0000-0000-000000000001'),
  'student',
  'a future Advisor starts as Student'
);
select is(
  (select role::text from public.profiles where id = '30000000-0000-0000-0000-000000000001'),
  'student',
  'a future Dean starts as Student'
);

insert into private.role_allowlist (email, role)
values
  ('advisor.one@example.edu', 'advisor'),
  ('advisor.two@example.edu', 'advisor'),
  ('dean.one@example.edu', 'dean');

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
select throws_ok(
  $$ select public.cancel_booking(null, 'Anonymous cancellation attempt') $$,
  'permission denied for function cancel_booking',
  'anonymous users cannot execute cancellation'
);

set local role authenticated;
select set_config('request.jwt.claims', '{}', true);
select throws_ok(
  $$ select public.cancel_booking(null, 'Missing authenticated identity') $$,
  'Authentication is required.',
  'cancellation requires an authenticated user ID'
);
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
select throws_ok(
  $$ select public.create_pc('PC-11', 'SE Lab C', 'Test PC', 'available', null) $$,
  'Only a Dean can add PCs.',
  'Students cannot manage PC inventory'
);
reset role;
select throws_ok(
  $$
    insert into public.bookings (
      requester_id,
      requester_role,
      advisor_id,
      pc_id,
      start_date,
      end_date,
      start_time,
      end_time,
      starts_at,
      ends_at,
      access_mode,
      purpose,
      course
    ) values (
      '10000000-0000-0000-0000-000000000001',
      'student',
      '20000000-0000-0000-0000-000000000001',
      (select id from public.pcs where code = 'PC-10'),
      date '2099-01-09',
      date '2099-01-09',
      time '09:00',
      time '10:00',
      statement_timestamp() - interval '2 hours',
      statement_timestamp() - interval '1 hour',
      'lab',
      'Past start trigger test',
      'SE Test'
    )
  $$,
  'The booking start time must be in the future.',
  'database rejects an active booking whose start instant has passed'
);
set local role authenticated;
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
  (select status::text from public.bookings where requester_id = '10000000-0000-0000-0000-000000000001'),
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
  $$ select public.cancel_booking((select id from public.get_booking_calendar(date '2099-01-10', date '2099-01-10') limit 1), 'Not my booking to cancel') $$,
  'You can cancel only your own booking.',
  'another Student cannot cancel the requester''s booking'
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
select is((select count(*) from public.profiles), 5::bigint, 'Dean can browse all profiles for user management');
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
select is((select count(*) from public.profiles), 5::bigint, 'Dean retains access to all profiles during review');
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
select throws_ok(
  $$ select public.cancel_booking((select id from public.bookings where pc_id = (select id from public.pcs where code = 'PC-01')), '   ') $$,
  'Please provide a cancellation reason of at least 5 characters.',
  'Student cancellation requires a meaningful reason'
);
select lives_ok(
  $$ select public.cancel_booking((select id from public.bookings where pc_id = (select id from public.pcs where code = 'PC-01')), 'Project session moved to another day.') $$,
  'Student can cancel their own approved future booking'
);
select is(
  (select status::text from public.bookings where pc_id = (select id from public.pcs where code = 'PC-01')),
  'cancelled',
  'Student cancellation closes the booking'
);
select is(
  (select cancellation_reason from public.bookings where pc_id = (select id from public.pcs where code = 'PC-01')),
  'Project session moved to another day.',
  'Student cancellation reason is retained'
);
select is(
  (select cancelled_by from public.bookings where pc_id = (select id from public.pcs where code = 'PC-01')),
  '10000000-0000-0000-0000-000000000001'::uuid,
  'Student cancellation records the requester as actor'
);
select ok(
  (select cancelled_at is not null from public.bookings where pc_id = (select id from public.pcs where code = 'PC-01')),
  'Student cancellation records its timestamp'
);
select is(
  (select count(*) from public.get_booking_calendar(date '2099-01-10', date '2099-01-10') where pc_code = 'PC-01'),
  0::bigint,
  'cancelled booking immediately releases calendar availability'
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

select set_config(
  'request.jwt.claims',
  '{"sub":"20000000-0000-0000-0000-000000000002","role":"authenticated"}',
  true
);
select lives_ok(
  $$ select public.assign_student_advisor('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002') $$,
  'Advisor can assign an unassigned Student to themselves'
);
select is(
  (select advisor_id from public.profiles where id = '10000000-0000-0000-0000-000000000002'),
  '20000000-0000-0000-0000-000000000002'::uuid,
  'Advisor assignment is persisted'
);
select throws_ok(
  $$ select public.assign_student_advisor('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002') $$,
  'This Student is already assigned to another Advisor.',
  'Advisor cannot take another Advisor''s Student'
);
select throws_ok(
  $$ select public.set_user_role('10000000-0000-0000-0000-000000000002', 'dean') $$,
  'Only a Dean can manage user roles.',
  'Advisor cannot manage roles'
);
select lives_ok(
  $$
    select public.create_booking(
      (select id from public.pcs where code = 'PC-03'),
      date '2099-01-10',
      date '2099-01-10',
      '09:00',
      '11:00',
      'Advisor booking requiring Dean approval',
      'SE Test'
    )
  $$,
  'Advisor can create a booking request'
);
select is(
  (select status::text from public.bookings where requester_id = '20000000-0000-0000-0000-000000000002'),
  'pending_dean',
  'Advisor booking starts at Dean review'
);
select is(
  (select advisor_decision::text from public.bookings where requester_id = '20000000-0000-0000-0000-000000000002'),
  'not_required',
  'Advisor booking skips Advisor review'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"30000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);
select lives_ok(
  $$ select public.approve_booking((select id from public.bookings where requester_id = '20000000-0000-0000-0000-000000000002')) $$,
  'Dean can approve an Advisor booking'
);
select set_config(
  'request.jwt.claims',
  '{"sub":"20000000-0000-0000-0000-000000000002","role":"authenticated"}',
  true
);
select lives_ok(
  $$ select public.cancel_booking((select id from public.bookings where requester_id = '20000000-0000-0000-0000-000000000002'), 'No longer need the lab workstation.') $$,
  'Advisor can cancel their own approved future booking'
);
select is(
  (select status::text from public.bookings where requester_id = '20000000-0000-0000-0000-000000000002'),
  'cancelled',
  'Advisor cancellation closes the booking'
);
select is(
  (select cancellation_reason from public.bookings where requester_id = '20000000-0000-0000-0000-000000000002'),
  'No longer need the lab workstation.',
  'Advisor cancellation reason is retained'
);
select set_config(
  'request.jwt.claims',
  '{"sub":"30000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);
select lives_ok(
  $$
    select public.create_booking(
      (select id from public.pcs where code = 'PC-04'),
      date '2099-01-10',
      date '2099-01-10',
      '09:00',
      '11:00',
      'Dean direct booking',
      'SE Test'
    )
  $$,
  'Dean can create a booking'
);
select is(
  (select status::text from public.bookings where requester_id = '30000000-0000-0000-0000-000000000001'),
  'approved',
  'Dean booking is approved immediately'
);
select lives_ok(
  $$ select public.cancel_booking((select id from public.bookings where requester_id = '30000000-0000-0000-0000-000000000001'), 'Dean no longer needs the workstation.') $$,
  'Dean can cancel their own approved future booking'
);
select is(
  (select status::text from public.bookings where requester_id = '30000000-0000-0000-0000-000000000001'),
  'cancelled',
  'Dean cancellation closes the booking'
);
select is(
  (select cancellation_reason from public.bookings where requester_id = '30000000-0000-0000-0000-000000000001'),
  'Dean no longer needs the workstation.',
  'Dean cancellation reason is retained'
);
select lives_ok(
  $$ select public.create_pc('PC-11', 'SE Lab C', '32 GB RAM', 'available', null) $$,
  'Dean can add a PC'
);
select lives_ok(
  $$ select public.update_pc((select id from public.pcs where code = 'PC-11'), 'PC-11', 'SE Lab C', '32 GB RAM', 'maintenance', 'Power supply failure') $$,
  'Dean can mark a PC for maintenance'
);
select is(
  (select status::text from public.pcs where code = 'PC-11'),
  'maintenance',
  'maintenance status is persisted'
);
select lives_ok(
  $$ select public.set_user_role('10000000-0000-0000-0000-000000000002', 'advisor') $$,
  'Dean can promote an existing Student'
);
select is(
  (select role::text from public.profiles where id = '10000000-0000-0000-0000-000000000002'),
  'advisor',
  'Dean role update is persisted'
);

select * from finish();
rollback;
