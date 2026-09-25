begin;

create extension if not exists pgtap with schema extensions;
select plan(14);

insert into auth.users (
  id, aud, role, email, email_confirmed_at, raw_app_meta_data,
  raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous
) values (
  '50000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated',
  'delete.me@example.edu', now(), '{"provider":"google"}', '{"full_name":"Delete Me"}',
  now(), now(), false, false
);

select is(
  (select is_deactivated from public.profiles where id = '50000000-0000-0000-0000-000000000001'),
  false,
  'a freshly created profile is not deactivated'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"50000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);

select lives_ok(
  $$ select public.request_account_deletion() $$,
  'a Student can request deletion of their own account'
);
select throws_ok(
  $$ select public.request_account_deletion() $$,
  'This account is already scheduled for deletion.',
  'requesting deletion twice is rejected'
);
select throws_ok(
  $$ select public.update_my_student_id('1234567890') $$,
  'This account is deactivated and pending deletion.',
  'a deactivated account cannot update its Student ID'
);
reset role;

select is(
  (select is_deactivated from public.profiles where id = '50000000-0000-0000-0000-000000000001'),
  true,
  'the account is marked deactivated after the deletion request'
);
select isnt(
  (select deletion_requested_at from public.profiles where id = '50000000-0000-0000-0000-000000000001'),
  null,
  'the deletion request timestamp is recorded'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"50000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);
select lives_ok(
  $$ select public.reactivate_my_account() $$,
  'reactivating within the 7-day window succeeds'
);
select throws_ok(
  $$ select public.reactivate_my_account() $$,
  'This account is not scheduled for deletion.',
  'reactivating an already-active account is rejected'
);
reset role;

select is(
  (select is_deactivated from public.profiles where id = '50000000-0000-0000-0000-000000000001'),
  false,
  'the account is active again after reactivation'
);
select is(
  (select deletion_requested_at from public.profiles where id = '50000000-0000-0000-0000-000000000001'),
  null,
  'the deletion request timestamp is cleared after reactivation'
);

select throws_ok(
  $$
    update public.profiles
    set is_deactivated = true
    where id = '50000000-0000-0000-0000-000000000001'
  $$,
  'new row for relation "profiles" violates check constraint "profiles_deletion_requested_at_consistency"',
  'is_deactivated cannot be set true without a deletion_requested_at timestamp'
);

insert into auth.users (
  id, aud, role, email, email_confirmed_at, raw_app_meta_data,
  raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous
) values (
  '50000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated',
  'expired.delete@example.edu', now(), '{"provider":"google"}', '{"full_name":"Expired Delete"}',
  now(), now(), false, false
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"50000000-0000-0000-0000-000000000002","role":"authenticated"}',
  true
);
select lives_ok(
  $$ select public.request_account_deletion() $$,
  'a second Student can also request deletion of their own account'
);
reset role;

alter table public.profiles disable trigger profiles_block_writes_while_deactivated;
update public.profiles
set deletion_requested_at = now() - interval '9 days'
where id = '50000000-0000-0000-0000-000000000002';
alter table public.profiles enable trigger profiles_block_writes_while_deactivated;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"50000000-0000-0000-0000-000000000002","role":"authenticated"}',
  true
);
select throws_ok(
  $$ select public.reactivate_my_account() $$,
  'The 7-day recovery period has expired. This account can no longer be reactivated.',
  'reactivation fails once the 7-day recovery window has passed'
);
reset role;

select is(
  (select is_deactivated from public.profiles where id = '50000000-0000-0000-0000-000000000002'),
  true,
  'an account past the recovery window remains deactivated'
);

select * from finish();
rollback;
