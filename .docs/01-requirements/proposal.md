# Updated proposal — SE Lab PC Booking System

## Problem statement

The Software Engineering laboratory has a shared set of managed PCs. Students need to know whether a machine is available before using it, especially when a machine is reserved for remote work and appears physically unused. The existing paper/manual process also makes approval status difficult to follow and cannot reliably prevent simultaneous requests for the same PC.

Research recorded in [user-research.md](user-research.md) identifies invisible remote use, uncertainty about availability, and conflicts over intended PC use. The staged Advisor/Dean approval flow is an institutional workflow requirement and is identified separately from interview evidence.

## Goal

Provide one trusted system that answers:

- Which PCs are operational?
- Which periods are occupied?
- Which PC and interval did a Student request?
- Is the request waiting for the Advisor or Dean?
- Was it approved or rejected, and why?
- Can another request safely reserve the same PC?

## Target users

| Role | Responsibility |
|---|---|
| Student | View availability, submit one-day lab or multi-day remote requests, and track their own decisions |
| Advisor | Review requests belonging only to assigned Students and approve or reject at the first stage |
| Dean | Review Advisor-approved requests and give final approval or rejection |
| University operator | Configure trusted roles, Student-to-Advisor assignments, PC state, OAuth settings, and deployment secrets through protected administration |

## Proposed solution

~~~text
Google OAuth
→ trusted Supabase profile and role
→ Student booking request
→ assigned Advisor decision
→ Dean final decision
→ approved booking
~~~

The shared calendar exposes occupancy, PC, time, access mode, and status to authenticated users while withholding unrelated Student identity, purpose, course, and rejection information. Authorized Students and reviewers can open the full record through RLS-protected queries.

## Booking model

- Ten PCs are seeded for the current lab inventory.
- Available, maintenance, and inactive operational states are supported.
- One-day requests are in-lab and restricted to 08:00–18:00.
- Multi-day requests are remote and reserve each included day continuously.
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
- immutable approval events
- 37 pgTAP database tests and frontend verification

Hosted rollout still requires a Supabase project, Google OAuth credentials, exact redirect URLs, Vercel public environment variables, the initial elevated-role allowlist, and Student-to-Advisor assignments.

## Scope

In scope:

- authentication and trusted roles
- PC availability and operational state
- Student request creation
- Advisor and Dean decisions
- private request history and sanitized calendar occupancy
- one-day lab and multi-day remote reservations
- database conflict prevention and audit events

Out of scope for this cycle:

- Student cancellation and rebooking
- recurring reservations
- email/push notifications
- admin/technician management UI
- check-in/check-out and no-show enforcement
- usage analytics and reporting
