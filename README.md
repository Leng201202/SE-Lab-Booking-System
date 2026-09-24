# SE Lab PC Booking System

A Supabase-backed web application for booking computers in the Software Engineering laboratory at Mae Fah Luang University.

```text
Student request → Advisor review → Dean review → Approved booking
Advisor request → Dean review → Approved booking
Dean request → Immediate approval after availability validation
```

The application uses Google OAuth for identity, trusted database roles for authorization, PostgreSQL Row Level Security for data access, and transactional database functions for booking and approval changes.

## Project status

The production foundation is implemented locally:

- React/Vite frontend under `app/`
- Supabase Auth with Google OAuth
- PostgreSQL migrations, seed data, RLS policies, and RPC functions under `supabase/`
- Conflict-safe bookings enforced by a PostgreSQL exclusion constraint
- role-aware booking, assigned-Advisor review, and Dean administration boundaries
- reason-required cancellation of a Student's or Advisor's own active future booking
- Advisor advisee management and Dean user/PC management
- Sanitized shared calendar data and immutable approval history
- Database and frontend automated checks

Hosted rollout still requires a Supabase project, a Google OAuth client, production redirect URLs, Vercel environment variables, and a protected post-login promotion for the first Dean.

## Local setup

Requirements: Node.js, npm, Docker Desktop (or another Docker-compatible runtime), and Google OAuth credentials for a real browser sign-in.

```bash
cd app
npm install
cp .env.example .env.local
```

Set the Google provider variables in your shell, then start Supabase from the repository root:

```bash
export SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID="your-google-client-id"
export SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET="your-google-client-secret"
npm run supabase:start --prefix app
```

Use the local project URL and publishable key printed by `supabase status` in `app/.env.local`, then run:

```bash
npm run dev --prefix app
```

See [supabase/README.md](supabase/README.md) for Google redirect configuration, hosted deployment, trusted roles, and Advisor assignment.

## Checks

```bash
npm run lint --prefix app
npm test --prefix app
npm run build --prefix app
npm run supabase:reset --prefix app
npm run supabase:test --prefix app
npm run supabase:lint --prefix app
```

## Structure

```text
.
├── app/          # React/Vite frontend and Supabase browser client
├── supabase/     # Local config, migrations, seed, and pgTAP tests
├── plan.md       # Current implementation status and rollout plan
├── agent.md      # Contributor architecture and safety rules
└── vercel.json   # Vercel SPA build and routing configuration
```

The `supabase/` directory belongs at the repository root because it defines shared backend infrastructure. Browser-specific Supabase code belongs under `app/src/`.
