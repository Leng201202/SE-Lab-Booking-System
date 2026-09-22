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
4. Configure Google as an Auth provider in the Supabase dashboard.
5. In Google, set the authorized redirect URI to `https://<project-ref>.supabase.co/auth/v1/callback`.
6. Set the Supabase Site URL to the production Vercel origin and allow `/auth/callback` for each explicitly supported origin.
7. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel.

Never expose the Google Client Secret, database password, Supabase secret key, or `service_role` key through Vite or commit them to the repository.

## Roles and Advisor assignment

All new Google users default to Student. Add elevated users through a protected SQL/admin connection:

```sql
insert into private.role_allowlist (email, role)
values
  ('advisor@university.example', 'advisor'),
  ('dean@university.example', 'dean')
on conflict (email) do update set role = excluded.role;
```

The allowlist trigger also updates an existing matching profile. After both a Student and Advisor have signed in, assign the relationship:

```sql
update public.profiles as student
set advisor_id = advisor.id
from public.profiles as advisor
where student.email = 'student@university.example'
  and advisor.email = 'advisor@university.example'
  and advisor.role = 'advisor';
```

Students without an assigned Advisor can sign in and inspect their profile, but the database rejects booking creation until the assignment exists.

## Security model

- Application tables deny anonymous access.
- Students see only their own private booking records.
- Advisors see only bookings assigned to them.
- Deans can see records required for final review.
- Shared calendar RPC output contains occupancy data but no Student identity, purpose, or rejection details.
- Booking creation, approval, and rejection are database functions that derive the actor from `auth.uid()`.
- An exclusion constraint prevents concurrent active bookings from overlapping.
- Every approval/rejection creates an immutable `approval_events` record.

Run the pgTAP suite after every schema or policy change.
