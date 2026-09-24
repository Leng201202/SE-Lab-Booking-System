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

## Roles and Advisor assignment

All new Google users default to Student, even if their email already appears in the allowlist. Have the user sign in once, then promote the existing profile through a protected SQL/admin connection:

```sql
insert into private.role_allowlist (email, role)
values
  ('advisor@university.example', 'advisor'),
  ('dean@university.example', 'dean')
on conflict (email) do update set role = excluded.role;
```

The allowlist trigger updates the existing matching Student profile. Use it to bootstrap the first Dean; that Dean can promote later users in the User Management screen. Advisor assignments are also available in the UI. A protected SQL fallback is:

```sql
update public.profiles as student
set advisor_id = advisor.id
from public.profiles as advisor
where student.email = 'student@university.example'
  and advisor.email = 'advisor@university.example'
  and advisor.role = 'advisor';
```

Students without an assigned Advisor can sign in and inspect their profile, but the database rejects booking creation until the assignment exists.

After bootstrap, Advisors manage unassigned/their own advisees in the application. Deans manage all roles and Advisor assignments through the User Management screen; direct private-schema access remains unavailable to the browser.

Booking routing is role-aware:

```text
Student → Advisor → Dean
Advisor → Dean
Dean → immediately approved after availability validation
```

Only Deans can add or edit PC inventory. Setting a PC to `maintenance` or `inactive` prevents new bookings without deleting its history.

Students and Advisors may cancel only their own `pending_advisor`, `pending_dean`, or `approved` booking before it starts. `cancel_booking` requires a 5–2000 character reason, records the requester and cancellation time, and releases the interval. Deploy `20260923000200_add_booking_cancellation.sql` before testing this workflow on the hosted project.

## Security model

- Application tables deny anonymous access.
- Every role sees its own private booking records.
- Advisors additionally see bookings for assigned Students.
- Deans see final-review records and all profiles required for user management.
- Shared calendar RPC output contains occupancy data but no Student identity, purpose, or rejection details.
- Booking, approval, rejection, cancellation, user-management, relationship-management, and PC-management functions derive the actor from `auth.uid()`.
- Active bookings must start in the future; a database trigger rejects stale creation and approval attempts independently of browser validation.
- An exclusion constraint prevents concurrent active bookings from overlapping.
- Every approval/rejection creates an immutable `approval_events` record.

Run the pgTAP suite after every schema or policy change.
