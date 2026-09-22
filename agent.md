# AGENT.md — SE Lab PC Booking System

## Purpose and current state

This is the contributor guide for the SE Lab PC Booking System. The current implementation is a React/Vite application backed by Supabase PostgreSQL and Supabase Auth with Google OAuth. Do not reintroduce mock identity, role switching, seeded browser users, or `localStorage` booking persistence.

The application workflow is:

```text
Student request → pending_advisor → pending_dean → approved
                      ↘ rejected       ↙
```

The deployable frontend is under `app/`; reproducible backend infrastructure is under the repository-root `supabase/` directory.

## Architecture

```text
Google OAuth
→ Supabase Auth session
→ public.profiles trusted role
→ RLS-protected PostgreSQL tables and RPCs
→ feature services
→ AppContext
→ role-specific React pages
```

Important paths:

```text
app/src/lib/supabase.js                     # Browser client
app/src/features/auth/authService.js        # Session and OAuth operations
app/src/features/bookings/bookingService.js # Booking reads and workflow RPCs
app/src/features/pcs/pcService.js           # PC inventory reads
app/src/app/AppContext.jsx                  # Session/profile/workspace coordination
supabase/migrations/                        # Versioned schema and policies
supabase/seed.sql                           # Development PC inventory
supabase/tests/database/                    # pgTAP authorization/workflow tests
```

Keep Supabase queries and RPC calls in focused feature services. Pages should consume those services through `AppContext` or a focused hook, not create ad hoc clients.

## Authentication and trusted roles

Google OAuth proves identity; it does not grant an application role.

- Only Google identities may create application profiles.
- New users default to `student`.
- `advisor` and `dean` come only from `private.role_allowlist` or another privileged administrative process.
- Never accept a role, Advisor assignment, ownership field, or workflow status from browser-controlled identity metadata.
- Users may read their own profile but cannot change their role or Advisor assignment.
- The Google OAuth secret stays in Supabase provider configuration. Never expose it through Vite.
- The browser may contain only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; never use a secret or `service_role` key.

Required production configuration that is intentionally not committed:

- Supabase project URL and publishable key
- Google OAuth client ID and secret
- production site/callback URLs
- post-first-login Advisor and Dean role promotions through the email allowlist
- Student-to-Advisor assignments

## Database model

The backend owns:

```text
public.profiles
public.pcs
public.bookings
public.approval_events
private.role_allowlist
```

Database entities use UUID primary keys. Booking instants use `timestamptz`; booking ranges are half-open `[start, end)` and display in `Asia/Bangkok`. Human-readable request numbers are separate from database identity.

Do not copy mutable profile or PC data into bookings unless a documented historical snapshot is required.

## Authorization boundary

React route guards improve navigation only. PostgreSQL grants, RLS policies, constraints, and functions are the security boundary.

- Anonymous users cannot read application data.
- Students can read only their own private bookings and can create only for themselves.
- Advisors can read and review only assigned Students at `pending_advisor`.
- Deans can read records needed for final review and act only at `pending_dean`.
- Shared calendar output omits Student identity, university ID, purpose, course, and rejection information.
- Direct table writes cannot bypass ownership or workflow rules.
- Approval events are append-only application audit records.

Consequential mutations use these database functions:

```text
create_booking
approve_booking
reject_booking
```

They derive the actor from `auth.uid()`, validate the trusted role and current stage, and change workflow/audit state atomically. Security-definer functions must keep `search_path = ''`, schema-qualify referenced objects, and expose execution only to intended roles.

## Booking rules

Blocking statuses:

```text
pending_advisor
pending_dean
approved
```

Non-blocking statuses:

```text
rejected
cancelled
completed
```

The database exclusion constraint is the final authority for overlapping active intervals on the same PC. Frontend checks are only early feedback.

One-day in-lab bookings must be within `08:00–18:00`, use a valid increasing time range, and remain on one date. Multi-day bookings use remote access and reserve the full inclusive Bangkok date range as a half-open timestamp interval ending at midnight after the final selected date.

Past dates, unavailable PCs, missing Advisor assignments, and purposes shorter than five non-whitespace characters are rejected by the database.

`cancelled` and `completed` exist in the status model, but user cancellation and automatic completion are not implemented yet.

## Routes and roles

Public routes:

```text
/login
/auth/callback
```

Authenticated shared routes:

```text
/dashboard
/calendar
/bookings/:id
/profile
```

Student routes:

```text
/book
/bookings
/pcs
```

Advisor and Dean routes:

```text
/requests/pending
/requests/history
```

Students must not receive review actions. Advisors act only at the Advisor stage; Deans act only at the Dean stage.

## Frontend and UI rules

- Keep React Hook Form and Zod responsible for immediate form feedback; repeat critical rules in PostgreSQL.
- Refetch authoritative server state after conflict-sensitive or approval mutations.
- Do not use optimistic updates for booking creation or approval transitions unless immediately reconciled.
- Represent loading, empty, expired-session, success, and actionable error states.
- Reuse shared buttons, cards, fields, badges, modals, empty states, and booking list components.
- Keep page-local filters and dialog state local.
- Preserve mobile usability from 320 px upward, visible focus states, semantic controls, and readable horizontal calendar scrolling.
- Preserve status colors: green for primary/approved, blue for information/booked, yellow for limited accents/pending, and red for errors/rejection/maintenance.
- Extract focused calendar utilities/components when adding complexity; do not rewrite working code only to introduce a different pattern.
- Do not add a state library, UI kit, separate backend server, or unrelated dependency without a demonstrated need.

## Repository and commands

Install dependencies in `app/`. Run from the repository root:

```bash
npm run dev --prefix app
npm run lint --prefix app
npm test --prefix app
npm run build --prefix app
npm run supabase:start --prefix app
npm run supabase:reset --prefix app
npm run supabase:test --prefix app
npm run supabase:lint --prefix app
npm run supabase:stop --prefix app
```

Never run `supabase db reset --linked` against a shared or production project.

Schema changes must be migration-backed. Do not rely on dashboard-only schema changes. Keep development records in `supabase/seed.sql`, and add pgTAP coverage for every authorization or workflow change.

## Verification priorities

Before completing application changes, run frontend lint, unit tests, and production build. For database changes, additionally rebuild from an empty local database, run the pgTAP suite, and run schema lint.

Maintain tests for:

- anonymous denial and Student ownership
- trusted role assignment and self-promotion denial
- Advisor assignment boundaries and Dean-only actions
- valid and invalid workflow transitions
- booking overlap and unavailable-PC rejection
- sanitized calendar output
- approval audit creation and attribution

Google provider configuration and production callback behavior require external credentials and must be verified separately during deployment.

## Deployment

Vercel builds `app/` through `vercel.json` and serves `app/dist` with an SPA rewrite. Configure the two public Supabase frontend variables in Vercel. Configure Google provider secrets and exact redirect URLs in Supabase/Google, never in frontend variables.

Before declaring hosted rollout complete, verify a real Google sign-in, session restoration, each role's data boundaries, booking concurrency, direct route refreshes, and mobile/desktop behavior.
