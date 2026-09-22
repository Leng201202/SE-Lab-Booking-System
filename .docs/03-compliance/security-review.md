# Security review — 23 September 2026

## Scope and assurance

This review covered the implemented architecture, React client, Google OAuth/Supabase session flow, PostgreSQL schema, grants, RLS policies, triggers, security-definer RPCs, booking concurrency, dependencies, repository secret handling, and unauthenticated production behavior.

It is an engineering review, not a guarantee that every vulnerability has been found. Dashboard-only controls and authenticated production penetration tests require administrator/test-account access.

## Summary

- No confirmed critical remote takeover, SQL injection, cross-site scripting sink, anonymous data disclosure, or direct role-escalation path was found.
- Five high-priority design/authentication risks require remediation before broad production use.
- Six medium-priority privacy, accountability, browser-hardening, and concurrency issues remain.
- The database authorization model is materially stronger than frontend route guards and remains the authoritative boundary.

## Findings

| ID | Severity | Finding | Required control | Backlog |
|---|---|---|---|---|
| H1 | High | Application profile creation accepts any Supabase-authenticated Google identity; the approved university domain is not enforced in repository code. | Before User Created domain hook, controlled Google audience, external-domain negative test | B24 |
| H2 | High | Dean/Advisor privileged RPCs accept ordinary `aal1` sessions and do not require MFA/step-up authentication. | MFA enrollment/challenge plus database `aal2` enforcement | B25 |
| H3 | High | Pending bookings block availability without maximum duration, advance window, per-user quota, or application RPC throttling. | Database-enforced booking limits and abuse monitoring | B26 |
| H4 | High | Authenticated users have column-level permission to update their own `university_id`, allowing an unverified identity claim. | Administrator/directory-controlled ID or explicit verification state | B27 |
| H5 | High | No application suspension/offboarding state is checked by RLS/RPCs; session timebox and inactivity controls are not defined. | Active-state checks, session revocation, lifecycle process, timeout policy | B28 |
| M1 | Medium | Approval decisions are audited, but role, Advisor assignment, PC, and suspension changes are not. | Immutable privileged-action audit events | B29 |
| M2 | Medium | Production has HSTS but no repository-defined CSP, frame protection, MIME-sniffing protection, referrer policy, or permissions policy. | Tested Vercel response headers and CSP | B30 |
| M3 | Medium | Hosted Auth exposes the email provider even though the repository describes a Google-only system. | Disable unused provider and monitor configuration drift | B31 |
| M4 | Medium | All Advisors can read unassigned Student profiles, including email and university ID. | Confirm policy need or replace with a minimized assignment/search RPC | B32 |
| M5 | Low/Medium | Shared calendar output exposes stable booking UUIDs, request numbers, and workflow status to unrelated authenticated users. | Return only fields needed to display occupancy | B32 |
| M6 | Medium | PC availability is checked without locking the PC row, permitting a booking/status race with maintenance changes. | Row lock or database invariant spanning status and booking insertion | B33 |
| L1 | Low | The SPA uses the supported implicit flow and browser-persisted tokens, increasing the importance of XSS prevention and CSP. | Evaluate PKCE and document token-storage risk | Security plan P2 |
| L2 | Low | Raw backend messages can reach the UI and OAuth callback errors currently collapse to a generic no-session message. | Map errors to safe user messages and retain detailed server-side diagnostics | Security plan P2 |

## Controls verified

- Anonymous production reads of `profiles` returned HTTP 401.
- Anonymous execution of `get_booking_calendar` returned HTTP 401.
- RLS is enabled on every exposed application table and direct mutation grants are restricted.
- Application roles are stored in protected database state rather than user-editable metadata.
- Security-definer functions use an empty `search_path`, schema-qualified objects, and actor/role checks.
- Approval functions lock target rows; the GiST exclusion constraint prevents simultaneous active overlap.
- Calendar output excludes unrelated requester name, email, university ID, purpose, course, and rejection reason.
- React contains no `dangerouslySetInnerHTML`, `eval`, or remote script dependency.
- Environment files are ignored, no environment file appears in repository history, and no secret-key marker was found in the deployed bundle.
- Production source maps were not publicly retrievable and Vercel supplies HSTS.
- `npm audit` reported zero known vulnerabilities across 238 dependencies.
- Frontend unit tests, ESLint, and the production build passed during the review.

## Verification still required

- Google OAuth application audience and Workspace organization restriction
- Supabase CAPTCHA, MFA, session, refresh-token, rate-limit, and Auth-hook configuration
- Deployed migration parity and database lint
- Authenticated adversarial tests using Student, Advisor, Dean, suspended, and external-domain accounts
- Vercel preview-domain and Supabase redirect allowlists
- Supabase backup/restore, log retention, alerting, and incident-response ownership
- Git repository branch protection, required reviews, dependency automation, and secret scanning

## Remediation gate

Priority 0 items H1–H5 block broad production rollout. Priority 1 items M1–M6 should be completed before the system becomes the authoritative university booking record. The implementation sequence and acceptance criteria are maintained in the root `plan.md`; traceable user stories are B24–B33 in the product backlog.
