# SE Lab PC Booking System — Implementation Plan

## Snapshot

As of 22 September 2026, the Supabase production foundation is implemented locally. The previous browser-only demo storage and fake role switching have been removed.

```text
Responsive React UI: implemented
Google OAuth client flow: implemented; real provider credentials still required
Supabase PostgreSQL schema: implemented
RLS authorization: implemented and tested
Transactional booking workflow: implemented and tested
Shared sanitized calendar: implemented and tested
Local migrations and seed: reproducible
Hosted Supabase/Vercel rollout: pending project configuration
```

## Product goal

Replace the manual laboratory equipment request process with a clear, secure workflow:

```text
Student request → Advisor review → Dean review → Approved PC booking
```

Users should always be able to understand the requested PC and time, access mode, purpose, current status, next reviewer, and final decision without exposing private booking information to unrelated users.

## Implemented foundation

### Frontend

- React 19, Vite 8, React Router 7, Tailwind CSS 4
- Google OAuth sign-in and callback routes
- restored Supabase sessions and trusted profile loading
- role-specific Student, Advisor, and Dean navigation
- dashboards, booking form/history/detail, review queues, PC inventory, profile, and calendar
- one-day lab and multi-day remote booking experiences
- loading, empty, mutation, configuration, and authentication error states
- responsive desktop and mobile layouts

### Backend

- Supabase CLI configuration at repository root
- versioned PostgreSQL migration and deterministic PC seed
- `profiles`, `pcs`, `bookings`, and append-only `approval_events`
- private elevated-role allowlist
- Google-only profile creation with default Student assignment
- explicit grants plus RLS on exposed tables
- booking creation, approval, rejection, and calendar RPCs
- database validation for dates, lab hours, remote ranges, PC state, purpose, Advisor assignment, and workflow stage
- half-open booking intervals with an exclusion constraint preventing concurrent active overlaps
- indexed foreign keys and role/query access paths
- sanitized shared calendar occupancy without private Student fields

### Verification

- clean local database rebuild from migration and seed
- 37 pgTAP tests covering allow/deny, role, relationship integrity, workflow, privacy, overlap, and audit behavior
- Supabase schema lint at warning level
- frontend ESLint, Node tests, and production Vite build

## Architecture

```text
Google OAuth
→ Supabase Auth
→ profile trigger + trusted role allowlist
→ PostgreSQL grants/RLS/RPCs
→ frontend feature services
→ AppContext session and workspace state
→ role-scoped pages
```

Repository layout:

```text
.
├── app/
│   ├── .env.example
│   └── src/
│       ├── app/
│       ├── components/
│       ├── features/
│       ├── lib/supabase.js
│       └── utils/
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   ├── seed.sql
│   └── tests/database/
├── agent.md
├── plan.md
└── vercel.json
```

The root `supabase/` directory is intentional: it is project infrastructure shared by the frontend and deployment workflow, not frontend source code.

## Data and authorization model

### Entities

```text
profiles
pcs
bookings
approval_events
private.role_allowlist
```

Database identity uses UUIDs; bookings additionally expose human-readable request numbers. Times are stored as `timestamptz` using half-open ranges and presented in `Asia/Bangkok`.

### Trusted roles

- A verified Google identity creates a profile.
- New users receive `student` unless their normalized email is allowlisted.
- Advisor and Dean roles never come from the browser.
- Students require a privileged Student-to-Advisor assignment before booking.
- Users cannot promote themselves or change protected profile relationships.

### Data access

- Anonymous access to application data is denied.
- Students see only their private bookings.
- Advisors see only assigned Students' bookings.
- Deans see requests needed for final review.
- Calendar consumers receive occupied periods and safe display fields, not identity, purpose, course, or rejection details.
- Frontend guards tailor navigation; PostgreSQL is authoritative.

## Business rules

Valid transitions:

```text
new request → pending_advisor
pending_advisor → pending_dean | rejected
pending_dean → approved | rejected
```

`pending_advisor`, `pending_dean`, and `approved` block availability. `rejected`, `cancelled`, and `completed` do not.

One-day in-lab requests use `08:00–18:00` bounds. Multi-day requests use remote access and reserve each included day continuously. The database rejects past starts, unavailable PCs, invalid intervals, short purposes, missing Advisor assignments, wrong-stage actions, and overlaps.

Cancellation and automatic completion are not yet exposed as user operations.

## Routes

```text
Public:       /login, /auth/callback
Shared:       /dashboard, /calendar, /bookings/:id, /profile
Student:      /book, /bookings, /pcs
Reviewers:    /requests/pending, /requests/history
```

## Hosted rollout plan

The code foundation is complete; these external configuration steps remain:

1. Create or select the hosted Supabase project and link it locally.
2. Preview and push the migration.
3. Create a Google OAuth web client and configure the Supabase callback URI.
4. Configure Google as a Supabase Auth provider.
5. Set exact production Site URL and `/auth/callback` redirect URLs.
6. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel.
7. Add trusted Advisor/Dean emails to `private.role_allowlist`.
8. Let users sign in, then assign each Student to an Advisor through a protected admin connection.
9. Verify real Google sign-in, session restoration, role-scoped views, and direct route refreshes.
10. Run a two-client overlap test and the full production smoke test before launch.

Open institutional decisions:

- allowed university Google email domain or explicit account policy
- initial Advisor and Dean email addresses
- production origin and supported preview origins
- operational owner for role and Advisor assignments

## Acceptance criteria

The local production foundation is accepted when:

- migrations and seed rebuild from an empty database
- anonymous and cross-user reads are denied
- users cannot self-promote
- Advisors cannot review unassigned Students or perform Dean actions
- Deans cannot bypass the final-review stage
- overlapping active bookings cannot both succeed
- decisions create durable, attributable audit events
- shared calendar output contains no private Student data
- frontend lint/tests/build and database tests/lint pass
- no secret or privileged key is committed or included in the frontend bundle

Hosted rollout is accepted only after real OAuth and production redirect behavior are also verified.

## Later phases

- Student cancellation rules and cut-off times
- automatic completion after booking end
- email or in-app notifications
- university-domain restriction or institutional SSO
- maintenance administration and lab technician role
- booking limits, blackout periods, and check-in/check-out
- reporting and usage analytics
- route-level code splitting for the current non-blocking bundle-size warning
- focused decomposition of the large calendar interaction component
- reconciliation of `.docs/`, which reflects an older prototype and is not current production evidence
