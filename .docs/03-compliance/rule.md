# System and compliance rules — SE Lab PC Booking System

Statuses: **Enforced** = implemented in code/database and locally tested · **Operational** = requires a protected administrator process · **Policy pending** = requires university/legal decision.

This document is an engineering compliance register, not legal advice. Final applicability and approval belong to the university data owner and qualified reviewer.

## Authentication and authorization

| Rule | Status | Evidence |
|---|---|---|
| Application profiles are created only for confirmed Google identities | Enforced | Supabase Auth trigger in the initial migration |
| New users default to Student | Enforced | Profile creation trigger |
| Advisor and Dean roles come only from the private email allowlist or privileged administration | Enforced / Operational | private.role_allowlist; no browser write access |
| Only Students may have an Advisor assignment, and the target must have the Advisor role | Enforced | Profile relationship trigger |
| Anonymous users cannot read application tables or calendar occupancy | Enforced | Explicit grants and RLS; pgTAP tests |
| Frontend route guards are not treated as the security boundary | Enforced by design | PostgreSQL grants, RLS, functions, and constraints |

## Booking and workflow rules

| Rule | Status | Evidence |
|---|---|---|
| One-day in-lab bookings are within 08:00–18:00 and use an increasing 15-minute interval | Enforced | create_booking RPC and table constraints |
| Multi-day bookings use remote access and reserve the full inclusive Bangkok date range | Enforced | create_booking RPC; half-open timestamp range |
| Past dates and maintenance/inactive PCs cannot be booked | Enforced | create_booking RPC |
| Purpose is required and bounded; course/project is optional and bounded | Enforced | RPC normalization and constraints |
| Students need an assigned eligible Advisor before submitting | Enforced | create_booking RPC |
| Pending Advisor, pending Dean, and approved records block availability | Enforced | Partial exclusion constraint |
| The same PC cannot have overlapping active intervals, even under concurrent submission | Enforced | PostgreSQL GiST exclusion constraint |
| Advisors act only on assigned Student requests at pending Advisor | Enforced | approve_booking/reject_booking |
| Deans act only after Advisor approval at pending Dean | Enforced | RLS and workflow functions |
| Rejection requires a reason | Enforced | Function and table constraints |
| Every decision appends an attributable approval event in the same transaction | Enforced | Workflow functions and pgTAP tests |
| Student cancellation, rebooking, automatic completion, and no-show handling | Policy pending / not implemented | Backlog B13, B14, B18 |

## Privacy and data rules

| Rule | Status | Evidence |
|---|---|---|
| Calendar output exposes occupancy without unrelated Student identity, university ID, purpose, course, or rejection details | Enforced | get_booking_calendar RPC and mapper tests |
| Students read only their own private bookings | Enforced | bookings RLS |
| Advisors read only assigned Students' bookings | Enforced | bookings RLS |
| Deans read only requests that passed Advisor review | Enforced | bookings RLS |
| Dean profile visibility is limited to their own profile and profiles participating in visible requests | Enforced | private helper used by profiles RLS |
| Users cannot change their role or Advisor assignment | Enforced | Column grants and RLS |
| The frontend contains no Google secret, database password, Supabase secret key, or service_role key | Enforced by repository policy; verify per deployment | Environment templates, ignore rules, credential scan |
| Display name, email, optional university ID, role, and Advisor relationship have documented operational purposes | Policy pending | University data inventory/owner approval required |
| Privacy notice and lawful basis are approved before production collection | Policy pending | No approved notice recorded |
| Retention/deletion schedule for profiles, bookings, and audit events | Policy pending | No approved schedule recorded |
| Data-subject access, correction, export, restriction, and deletion procedure | Policy pending | Operational process not defined |
| Incident and breach response procedure | Policy pending | Operational process not defined |

## Infrastructure rules

- Schema and policy changes must be versioned under supabase/migrations/.
- Production credentials must be configured in Supabase/Google/Vercel, not committed.
- The browser receives only VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.
- Security-definer functions use an empty search_path, schema-qualified objects, and limited execution grants.
- Database changes must pass clean rebuild, pgTAP, and application-schema lint.

## Legal reference register

### Personal Data Protection Act B.E. 2562 (2019)

The system processes identifiers and booking records and therefore requires a university-approved assessment of controller/processor roles, purpose, lawful basis, notice, security, rights handling, disclosure, and retention.

Official text: [Royal Gazette — Personal Data Protection Act B.E. 2562](https://ratchakitcha.soc.go.th/documents/17082307.pdf)

### Computer-Related Crime Act B.E. 2550/2560

Whether the university/operator is an in-scope service provider and whether traffic or identification-data retention obligations apply must be determined by qualified university/legal review. This project does not infer that application booking history satisfies any statutory traffic-data obligation.

Official reference retained from W2: [MDES — Computer-Related Crime Act](https://www.mdes.go.th/law/detail/3618-)

### Electronic Transactions Act B.E. 2544, as amended

The application produces electronic booking records but does not present an approval or toast as an electronic signature. Any institutional reliance on these records requires separate policy/legal review.

Official source index: [ETDA — Electronic Transactions laws](https://www.etda.or.th/th/Useful-Resource/laws-sharing.aspx)

## Review record

| Item | Status |
|---|---|
| Engineering control review | Updated 22 Sep 2026 |
| University data owner | Not recorded |
| Legal/supervisor reviewer | Pending |
| Approved lawful basis and notice | Pending |
| Approved retention schedule | Pending |
| Computer-Related Crime Act applicability | Pending |
| Production security owner | Pending |
