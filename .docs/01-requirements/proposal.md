# Updated proposal — SE Lab PC Booking System

## Problem statement

The Software Engineering laboratory has a shared set of managed PCs. Students need to know whether a machine is available before using it, especially when a machine is reserved for remote work and appears physically unused. The existing paper/manual process also makes approval status difficult to follow and cannot reliably prevent simultaneous requests for the same PC.

Research recorded in [user-research.md](user-research.md) identifies invisible remote use, uncertainty about availability, and conflicts over intended PC use. The staged Advisor/Dean approval flow is an institutional workflow requirement and is identified separately from interview evidence.

## Goal

Provide one trusted system that answers:

- Which PCs are operational?
- Which periods are occupied?
- Which PC and interval did a user request?
- Is the request waiting for the Advisor or Dean?
- Was it approved or rejected, and why?
- Can another request safely reserve the same PC?

## Target users

| Role | Responsibility |
|---|---|
| Student | View availability, submit requests, and track Advisor/Dean decisions |
| Advisor | Review assigned Students, manage own advisees, submit requests directly to Dean review, and track decisions |
| Dean | Give final decisions, reserve available PCs directly, manage users/roles/assignments, and manage PC inventory |
| University operator | Bootstrap the first Dean, OAuth settings, and deployment secrets through protected administration |

## Proposed solution

~~~text
Google OAuth
→ trusted Supabase profile and role
→ role-aware booking request
→ Student: Advisor then Dean decision
→ Advisor: Dean decision
→ Dean: immediate approval after availability validation
~~~

The shared calendar exposes occupancy, PC, time, access mode, and status to authenticated users while withholding unrelated Student identity, purpose, course, and rejection information. Authorized Students and reviewers can open the full record through RLS-protected queries.

## Booking model

- Ten PCs are seeded for the current lab inventory.
- Available, maintenance, and inactive operational states are supported.
- One-day requests are in-lab and restricted to 08:00–18:00.
- A same-day request starts at the next 15-minute Bangkok slot; elapsed calendar slots cannot be selected.
- Multi-day requests are remote, reserve each included day continuously, and begin on a future date because their first day starts at 00:00.
- Pending Advisor, pending Dean, and approved requests block availability.
- Rejected, cancelled, and completed records do not block availability.
- PostgreSQL prevents overlapping active intervals for the same PC under concurrency.

## Why this approach

- Google OAuth removes browser-controlled identity.
- Trusted database roles separate identity proof from authorization.
- RLS protects private records even if the frontend is bypassed.
- Transactional functions keep workflow changes and audit events atomic.
- A sanitized calendar solves availability uncertainty without publishing personal booking details.
- A database exclusion constraint is safer than client-only conflict checks.

## Current implementation status

The production foundation is implemented locally:

- React/Vite responsive frontend
- Supabase browser client and persisted Auth session
- Google OAuth redirect flow
- versioned PostgreSQL migration and deterministic PC seed
- RLS and explicit grants
- booking, approval, rejection, and calendar RPCs
- protected user/Advisor relationship and PC-management RPCs
- immutable approval events
- 57 pgTAP database assertions, including server-side future-start coverage, and frontend verification

The hosted Supabase project and Google provider are active, and login has been verified from the local frontend. Release still requires migration-parity verification, an end-to-end Vercel-origin OAuth smoke test, exact production redirects, protected first-Dean promotion, and completion of the Priority 0 security items. Later role and Advisor assignments are available in the application.

The 23 September 2026 security review also makes institutional-domain enforcement, privileged MFA, booking anti-abuse limits, trusted university-ID handling, and account offboarding mandatory before broad production use. Administrative audit coverage, production browser headers, data minimization, and concurrency hardening follow as Priority 1 work. See [the security review](../03-compliance/security-review.md) and backlog B24–B33.

## Scope

In scope:

- authentication and trusted roles
- PC availability and operational state
- role-aware request creation for Students, Advisors, and Deans
- Advisor and Dean decisions
- Advisor advisee management and Dean user/PC administration
- private request history and sanitized calendar occupancy
- one-day lab and multi-day remote reservations
- database conflict prevention and audit events

Out of scope for this cycle:

- Student cancellation and rebooking
- recurring reservations
- email/push notifications
- technician-specific administration role
- check-in/check-out and no-show enforcement
- usage analytics and reporting
