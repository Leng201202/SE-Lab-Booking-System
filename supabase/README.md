# Supabase backend

This directory contains the reproducible PostgreSQL, Auth, RLS, seed, and database-test configuration for the SE Lab PC Booking System.

## Local development

Requirements:

- Docker-compatible runtime
- Node dependencies installed in `app/`
- A Google OAuth web client for an actual browser sign-in

Export the local Google provider values without committing them:

```bash
export SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID="your-google-client-id"
export SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

Then start and verify the backend from the repository root:

```bash
npm run supabase:start --prefix app
npm run supabase:reset --prefix app
npm run supabase:test --prefix app
npm run supabase:lint --prefix app
```

Copy `app/.env.example` to `app/.env.local` and fill it with the URL and publishable key printed by `supabase status`.

For local Google OAuth, register this authorized redirect URI in Google:

```text
http://127.0.0.1:54321/auth/v1/callback
```

Register both supported frontend callback URLs in Supabase Auth:

```text
http://localhost:5173/auth/callback
http://127.0.0.1:5173/auth/callback
```

## Hosted project setup

1. Create or select a Supabase project.
2. Link this repository with `supabase link --project-ref <project-ref>`.
3. Preview migrations with `supabase db push --dry-run`, then run `supabase db push`.
   The migrations also backfill profiles for verified Google users who signed in before the profile trigger was installed.
4. Configure Google as an Auth provider in the Supabase dashboard.
5. In Google, set the authorized redirect URI to `https://<project-ref>.supabase.co/auth/v1/callback`.
6. Set the Supabase Site URL to the production Vercel origin and allow `/auth/callback` for each explicitly supported origin.
7. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel.

Never expose the Google Client Secret, database password, Supabase secret key, or `service_role` key through Vite or commit them to the repository.

### Deploying the per-booking Advisor migration

This branch adds one database migration:

```text
20261021000100_select_advisor_per_booking.sql
```

It depends on all earlier migrations, including `20260925000100_add_account_deletion.sql` and `20261005000100_extend_recovery_window_to_90_days.sql`. If the hosted project is already current through `20261005000100`, this is the only new migration that should be pending. Confirm migration history before applying anything:

```bash
supabase migration list --linked
supabase db push --dry-run
supabase db push
```

Use `db push` instead of pasting the file into the SQL Editor so Supabase records the migration version. If older migrations are also pending, review and apply the complete pending sequence in timestamp order. Do not mark migrations as applied unless the hosted schema has first been verified to contain their changes. The repository currently tracks a historical hosted migration-parity issue as BUG-05 and a duplicated local migration version as BUG-09 in `.docs/05-testing/known-issues.md`; resolve any mismatch reported by the CLI before pushing this migration.

After deployment, verify that `profiles.advisor_id` and `assign_student_advisor` are gone, `list_booking_advisors` is callable by authenticated users, and a Student booking requires a valid active Advisor.

## Roles and Advisor selection

All new Google users default to Student, even if their email already appears in the allowlist. Have the user sign in once, then promote the existing profile through a protected SQL/admin connection:

```sql
insert into private.role_allowlist (email, role)
values
  ('technician@university.example', 'technician'),
  ('advisor@university.example', 'advisor'),
  ('dean@university.example', 'dean')
on conflict (email) do update set role = excluded.role;
```

The allowlist trigger updates the existing matching Student profile. Use it to bootstrap the first Dean; that Dean can promote later users in the User Management screen. Deans manage all roles, including Technician promotion; direct private-schema access remains unavailable to the browser.

Students have no permanent Advisor. Each Student booking request names its reviewing Advisor: the booking form lists eligible Advisors through `list_booking_advisors` (id and display name only), and `create_booking` requires `p_advisor_id` for Students and stores it on `bookings.advisor_id`. An eligible Advisor has the `advisor` role and an active (not deactivated) profile. Technician, Advisor, and Dean requests do not take an Advisor. An Advisor named on unresolved `pending_technician` or `pending_advisor` requests cannot change role until those requests are decided or cancelled.

Migration `20261021000100_select_advisor_per_booking.sql` removed `profiles.advisor_id` and `assign_student_advisor`. Bookings created earlier keep the Advisor they were created with. The former profile assignments are archived in `private.student_advisor_assignment_archive` for audit and are no longer used by the application.

Booking routing is role-aware:

```text
Student → Technician → selected Advisor → Dean
Technician → Advisor → Dean
Advisor → Dean
Dean → immediately approved after availability validation
```

Technicians and Deans can add or edit PC inventory, specifications, operational status, and maintenance notes. Setting a PC to `maintenance` or `inactive` prevents new bookings without deleting its history. Only Deans can manage user roles.

Every role may cancel only its own active booking before it starts. `cancel_booking` requires a 5–2000 character reason, records the requester and cancellation time, and releases the interval.

Student identity is handled by `20260924000500_auto_university_id_from_lamduan_email.sql`. A 10-digit numeric `@lamduan.mfu.ac.th` local part is copied into `profiles.university_id`; collision handling preserves profile creation instead of breaking Google sign-in. Other Students may submit a 10-digit value through the authenticated `update_my_student_id` RPC. Direct REST updates to the column are revoked, and Lamduan Students cannot replace the email-derived value. Manually entered IDs are self-declared until the university verification process in backlog B27 is implemented.

Account deletion is currently a recoverable soft-deactivation workflow implemented by `20260925000100_add_account_deletion.sql` and extended to a 90-day recovery window by `20261005000100_extend_recovery_window_to_90_days.sql`. `request_account_deletion` sets `profiles.is_deactivated` and records the request time; `reactivate_my_account` clears those fields only during that recovery window. These migrations do **not** delete the Supabase Auth user, profile, bookings, or approval history after 90 days.

The current React gate and profile-write trigger are not sufficient offboarding controls. Until backlog B28 is complete, a valid deactivated session may still reach RLS reads or RPCs that do not check `is_deactivated`. Backlog B38 covers the approved post-window retention, booking disposition, session revocation, and permanent deletion/pseudonymization process.

Deploy migrations through `20261021000100_select_advisor_per_booking.sql` before testing this branch against the hosted project.

## Security model

- Application tables deny anonymous access.
- Every role sees its own private booking records.
- Technicians see Student requests at the technical-review stage and their technical-review history.
- Advisors additionally see Student requests that name them, once those requests reach Advisor review.
- Deans see final-review records and all profiles required for user management.
- Shared calendar RPC output contains occupancy data but no Student identity, purpose, or rejection details.
- Booking, approval, rejection, cancellation, user-management, Advisor-listing, and PC-management functions derive the actor from `auth.uid()`.
- Active bookings must start in the future; a database trigger rejects stale creation and approval attempts independently of browser validation.
- An exclusion constraint prevents concurrent active bookings from overlapping.
- Every approval/rejection creates an immutable `approval_events` record.
- Account deactivation is not yet a complete database authorization boundary or permanent-erasure mechanism; do not rely on the frontend gate alone.

Run the pgTAP suite after every schema or policy change.
