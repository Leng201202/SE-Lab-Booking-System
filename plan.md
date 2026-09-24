# SE Lab PC Booking System — Implementation Plan

## Snapshot

As of 23 September 2026, the Supabase production foundation is implemented and Google sign-in has been verified from the local frontend against the hosted project. The previous browser-only demo storage and fake role switching have been removed. A repository and unauthenticated production security review is complete; the remediation work below remains open.

```text
Responsive React UI: implemented
Google OAuth client flow: implemented; hosted login verified from localhost
Supabase PostgreSQL schema: implemented
RLS authorization: implemented and tested
Transactional booking workflow: implemented and tested
Shared sanitized calendar: implemented and tested
Local migrations and seed: reproducible
Hosted Supabase/Vercel rollout: in progress; production-origin OAuth smoke test pending
Security hardening: assessed; high-priority remediation planned
```

## Product goal

Replace the manual laboratory equipment request process with a clear, secure workflow:

```text
Student request → Advisor review → Dean review → Approved PC booking
Advisor request → Dean review → Approved PC booking
Dean request → Approved immediately when the PC is available
```

Users should always be able to understand the requested PC and time, access mode, purpose, current status, next reviewer, and final decision without exposing private booking information to unrelated users.

## Implemented foundation

### Frontend

- React 19, Vite 8, React Router 7, Tailwind CSS 4
- Google OAuth sign-in and callback routes
- restored Supabase sessions and trusted profile loading
- role-specific Student, Advisor, and Dean navigation
- dashboards, booking form/history/detail and requester cancellation, review queues, PC inventory/management, user/advisee management, profile, and calendar
- one-day lab and multi-day remote booking experiences
- loading, empty, mutation, configuration, and authentication error states
- responsive desktop and mobile layouts

### Backend

- Supabase CLI configuration at repository root
- versioned PostgreSQL migration and deterministic PC seed
- `profiles`, `pcs`, role-neutral requester bookings, and append-only `approval_events`
- private elevated-role allowlist
- Google-only profile creation with default Student assignment
- explicit grants plus RLS on exposed tables
- role-aware booking creation, approval, rejection, requester cancellation, inventory-management, and user-management RPCs
- database validation for dates, lab hours, remote ranges, PC state, purpose, Advisor assignment, and workflow stage
- half-open booking intervals with an exclusion constraint preventing concurrent active overlaps
- indexed foreign keys and role/query access paths
- sanitized shared calendar occupancy without private Student fields

### Verification

- clean local database rebuild from migration and seed
- 71 pgTAP assertions cover allow/deny, all three booking paths, future-start enforcement, requester cancellation, management permissions, relationship integrity, privacy, overlap, Google profile provisioning, and audit behavior; the expanded suite awaits database execution
- prior Supabase foundation schema lint passed; expanded migrations await linked/local database lint
- frontend ESLint, eight Node tests, and production Vite build pass after the requester-cancellation changes

## Architecture

```text
Google OAuth
→ Supabase Auth
→ profile trigger assigns Student → privileged role update when required
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
- Every new user receives `student`; a privileged administrator may promote the existing profile afterward.
- Advisor and Dean roles never come from the browser.
- Students require an Advisor assignment before booking; Advisors may manage their own advisee list and Deans may manage all assignments.
- Advisors and Deans may also request PCs. Advisor requests skip Advisor review; Dean requests are approved immediately when availability validation succeeds.
- Deans manage roles and PC inventory, including specification, operational status, and maintenance notes.
- Users cannot promote themselves or change protected profile relationships.

### Data access

- Anonymous access to application data is denied.
- Every user sees their own private bookings.
- Advisors additionally see and review their assigned Students' bookings and can manage only unassigned or already assigned-to-self Students.
- Deans see all users, manage trusted roles and Advisor assignments, manage PCs, and see requests needed for final review.
- Calendar consumers receive occupied periods and safe display fields, not identity, purpose, course, or rejection details.
- Frontend guards tailor navigation; PostgreSQL is authoritative.

## Business rules

Role-specific creation and transitions:

```text
Student: new request → pending_advisor → pending_dean | rejected → approved | rejected; own active future request → cancelled
Advisor: new request → pending_dean → approved | rejected; own active future request → cancelled
Dean: new request → approved
```

`pending_advisor`, `pending_dean`, and `approved` block availability. `rejected`, `cancelled`, and `completed` do not.

One-day in-lab requests use `08:00–18:00` bounds. On the current Bangkok date, the form and calendar advance to the next valid 15-minute slot and make elapsed slots read-only. Multi-day requests use remote access, reserve each included day continuously, and must begin on a future date. The future-start trigger rejects stale creation and approval attempts; the database also rejects unavailable PCs, invalid intervals, short purposes, missing Advisor assignments, wrong-stage actions, and overlaps.

Students and Advisors may cancel only their own `pending_advisor`, `pending_dean`, or `approved` booking before its start instant. Cancellation requires a trimmed reason of 5–2000 characters and records the requester and cancellation time atomically; the cancelled interval immediately stops blocking availability. Deans do not use this requester-cancellation workflow. Automatic completion is not yet implemented.

## Routes

```text
Public:       /login, /auth/callback
Shared:       /dashboard, /calendar, /bookings/:id, /profile
All roles:    /book, /bookings, /pcs
Reviewers:    /requests/pending, /requests/history
Advisor:      /manage/advisees
Dean:         /admin/users, /admin/pcs
```

## Hosted rollout plan

The hosted Supabase project and Google provider are active, and Google sign-in has succeeded from the local frontend. Complete or revalidate these steps before release:

1. Authenticate and link the Supabase CLI to project `vcysmsbqoeanrpsgiaie` without committing its access token.
2. Compare hosted migration history with the repository, preview pending migrations, and push only after review.
3. Confirm the Google client retains the hosted Supabase callback URI.
4. Set the exact production Site URL and `/auth/callback` redirect URL; keep preview origins disabled unless explicitly required.
5. Confirm Vercel uses the hosted project URL and publishable key, then redeploy after environment changes.
6. Verify Google sign-in, session restoration, sign-out, role-scoped views, callback errors, and direct route refreshes from the production Vercel origin.
7. After each intended Advisor/Dean signs in once as Student, promote them through protected administration.
8. Use Advisor/Dean management screens to assign Students and verify the resulting visibility boundaries.
9. Complete Priority 0 security items H1–H5/B24–B28.
10. Run authenticated role-adversary, two-client overlap, booking-abuse, and full production smoke tests before launch.

Open institutional decisions:

- allowed university Google email domain or explicit account policy
- initial Advisor and Dean email addresses
- production origin and supported preview origins
- operational owner for role and Advisor assignments

## Security-hardening workstream

The 23 September 2026 review found no confirmed critical remote takeover or role-escalation path. The database foundation already denies anonymous application access, uses RLS, derives actors from `auth.uid()`, keeps roles in protected database state, pins `security definer` search paths, and prevents concurrent active overlaps. The full evidence and limitations are recorded in [`.docs/03-compliance/security-review.md`](.docs/03-compliance/security-review.md).

### Priority 0 — required before broad production use

1. Enforce the approved university email domain with a Supabase Before User Created hook and configure the Google OAuth audience consistently.
2. Disable unused hosted email/password authentication so Google is the only supported identity provider.
3. Require Supabase MFA assurance level `aal2` for Dean operations and approval/management operations selected by university policy.
4. Remove direct Student write access to `university_id`; populate or verify it through a trusted university/Dean process.
5. Add maximum duration, maximum advance window, per-user active/pending quotas, and request throttling so pending requests cannot monopolize inventory.
6. Add an account state and offboarding workflow that blocks suspended users, revokes sessions, and defines session timebox/inactivity settings.

### Priority 1 — defense in depth and accountability

1. Append immutable audit events for role changes, Advisor assignments, PC creation/status changes, and account suspension.
2. Add a production Content Security Policy, clickjacking protection, MIME-sniffing protection, referrer policy, and permissions policy in `vercel.json`.
3. Minimize calendar output for unrelated users and review whether all Advisors should see every unassigned Student's email and university ID.
4. Close the PC-status/booking concurrency window with a row lock or database invariant.
5. Add database and edge-level abuse monitoring for repeated invalid RPC calls, excessive booking attempts, and privileged changes.

### Priority 2 — operational maturity

1. Evaluate PKCE for the browser OAuth flow and document the chosen token-storage threat model.
2. Approve retention, deletion/pseudonymization, incident response, backup/restore, and data-subject request procedures.
3. Add automated dependency, secret, migration-lint, RLS, and authenticated role-adversary checks to CI.
4. Review production Auth, Google Workspace, Supabase, Vercel, and repository settings on a scheduled basis.

### Security acceptance criteria

- A Google account outside the approved institutional domain cannot create an Auth user or application profile.
- Unused Auth providers are disabled, redirect URLs are exact, and production/preview origins are explicitly controlled.
- An `aal1` session cannot execute operations designated as privileged; the same operation succeeds only with an authorized `aal2` role.
- A Student cannot assign or change a trusted university ID through direct REST calls.
- Duration, advance-window, and per-user limits prevent one requester from blocking all inventory with pending requests.
- Suspended/offboarded users cannot restore a workspace or call application RPCs with an existing session.
- Every privileged management mutation records actor, target, before/after state, timestamp, and session/request correlation data.
- Production responses include the approved browser security headers and a tested CSP.
- Student, Advisor, Dean, anonymous, suspended, external-domain, and wrong-assurance adversarial tests pass against the deployed schema.

## Acceptance criteria

The local production foundation is accepted when:

- migrations and seed rebuild from an empty database
- anonymous and cross-user reads are denied
- users cannot self-promote
- Advisors cannot review unassigned Students or perform Dean actions
- Advisors can manage only unassigned Students or their own advisees
- Deans cannot bypass the final-review stage for Student or Advisor requests; their own bookings use the explicit validated direct-approval path
- Advisor bookings begin at Dean review and Dean bookings become approved only after availability checks
- only Deans can change roles or create/update PC inventory
- overlapping active bookings cannot both succeed
- Students and Advisors can cancel only their own active future bookings, must provide a valid reason, and cannot cancel another user's, started, rejected, completed, or already-cancelled booking
- decisions create durable, attributable audit events
- shared calendar output contains no private Student data
- frontend lint/tests/build and database tests/lint pass
- no secret or privileged key is committed or included in the frontend bundle

Hosted rollout is accepted only after real OAuth and production redirect behavior are also verified.

## Later phases

- configurable institutional cancellation cut-off, no-show, and follow-up policy beyond the current before-start rule
- automatic completion after booking end
- email or in-app notifications
- lab technician role
- blackout periods and check-in/check-out
- reporting and usage analytics
- route-level code splitting for the current non-blocking bundle-size warning
- focused decomposition of the large calendar interaction component
