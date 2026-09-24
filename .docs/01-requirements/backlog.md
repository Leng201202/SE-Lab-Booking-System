# Product backlog — SE Lab PC Booking System

Status reflects the repository as of 24 September 2026.

Legend: **Done** = implemented and locally verified · **Configured deployment required** = code exists but external credentials/configuration remain · **Planned** = accepted but not built · **Proposed** = candidate requiring validation.

| ID | User story | Priority | Status | Source |
|---|---|---|---|---|
| B1 | As a university user, I sign in with Google so my identity is not controlled by browser state. | Must | Configured deployment required | Security/product requirement |
| B2 | As an authenticated user, I can view week and day availability for all managed PCs. | Must | Done | Research #1, #2, #5 |
| B3 | As an authenticated user, I can request an available PC only for a future start instant. | Must | Done | Research #3, #4; institutional workflow |
| B4 | As an authenticated user, I can request a one-day in-lab session or a continuous multi-day remote reservation. | Must | Done | Research #1, #2 |
| B5 | As an authenticated user, I can see occupied periods without seeing unrelated Student identity or purpose. | Must | Done | Privacy requirement derived from research #1, #2 |
| B6 | As a Student, I can see my request status and any rejection reason. | Must | Done | Workflow requirement |
| B7 | As an Advisor, I can approve or reject Technician-approved requests from assigned Students and requests submitted by Technicians. | Must | Done | Institutional approval workflow |
| B8 | As a Dean, I can make the final decision only after Advisor approval. | Must | Done | Institutional approval workflow |
| B9 | As a user, overlapping active bookings for the same PC cannot both succeed, including concurrent requests. | Must | Done | Research #3, #4 |
| B10 | As a signed-out visitor, I cannot read profiles, PCs, bookings, or calendar occupancy. | Must | Done | Privacy/security requirement |
| B11 | As an authorized user, I can open a booking detail appropriate to my role. | Must | Done | Workflow requirement |
| B12 | As a reviewer, every approval or rejection creates an attributable audit event. | Must | Done | Accountability requirement |
| B13 | As any application role, I can cancel my own active future booking with a required reason. | Should | Done | Product requirement; Research #3, #4 |
| B14 | As a Student, I can safely change a booking's PC or interval without losing the original slot mid-operation. | Should | Planned | Research #3, #4 |
| B15 | As a user, I receive clear success or failure feedback after a workflow action. | Should | Done (in-app) | Trust/usability requirement |
| B16 | As a Technician or Dean, I can add PCs and manage their room, specification, status, and maintenance notes. | Should | Done | Operational requirement |
| B17 | As a user, I receive email or in-app notifications when a decision is made. | Could | Proposed | Not yet supported by interviews |
| B18 | As a lab operator, I can configure limits, blackout periods, and no-show rules. | Could | Proposed | Requires stakeholder policy |
| B19 | As a user, I can create recurring weekly reservations. | Won't this cycle | Proposed | Not supported by current research |
| B20 | As an Advisor, I can request a PC and send it directly to Dean review. | Must | Done | Institutional workflow |
| B21 | As a Dean, I can reserve an available PC immediately without a separate approval step. | Must | Done | Institutional workflow |
| B22 | As an Advisor, I can assign unassigned Students to myself and release my own advisees. | Must | Done | Institutional relationship management |
| B23 | As a Dean, I can view all users, manage roles, and assign Students to Advisors. | Must | Done | Institutional administration |
| B24 | As the university, I allow account creation only for the approved institutional Google domain. | Must | Planned | Security review H1 |
| B25 | As a privileged user, I must complete MFA before approval, role, assignment, or inventory-management operations selected by policy. | Must | Planned | Security review H2 |
| B26 | As a lab operator, I can enforce booking duration, advance-window, active-request, and rate limits so one requester cannot monopolize inventory. | Must | Planned | Security review H3 |
| B27 | As the university, I treat university ID as trusted data that Students cannot self-assert through the API. | Must | Planned | Security review H4 |
| B28 | As an operator, I can suspend/offboard a user and revoke access even when an earlier Supabase session exists. | Must | Planned | Security review H5 |
| B29 | As an auditor, I can trace role changes, Advisor assignments, PC changes, and suspensions to an actor and session/request. | Must | Planned | Security review M1 |
| B30 | As a user, the production frontend is protected by a tested CSP and standard browser security headers. | Must | Planned | Security review M2 |
| B31 | As the security owner, I keep only Google enabled and detect drift between repository and hosted Auth configuration. | Must | Configured deployment required | Security review M3 |
| B32 | As a privacy owner, I minimize calendar identifiers and the profile data exposed to Advisors managing unassigned Students. | Should | Planned | Security review M4/M5 |
| B33 | As a requester, PC operational state and booking creation remain consistent under concurrent changes. | Must | Planned | Security review M6 |
| B34 | As a Technician, I can approve or reject Student requests before they reach the assigned Advisor. | Must | Done | Institutional workflow |
| B35 | As a Technician, my own booking skips technical review and proceeds through Advisor then Dean review. | Must | Done | Institutional workflow |
| B36 | As a newly assigned Advisor, I receive the Student's unresolved requests without changing completed review history. | Must | Done | Advisor reassignment defect |

## Acceptance notes

- Active statuses are **pending_technician**, **pending_advisor**, **pending_dean**, and **approved**.
- One-day lab bookings use 08:00–18:00 in 15-minute increments.
- On the current Bangkok date, the earliest selectable start is the next 15-minute slot; elapsed slots are read-only in the calendar and invalid in the form.
- A multi-day request is remote and reserves the complete inclusive Bangkok date range, so it must begin on a future date.
- PostgreSQL rejects a pending or approved booking when its start instant is no longer in the future, including stale submissions and late approvals.
- Students need an assigned Advisor before creating a request.
- Student requests pass Technician, assigned Advisor, and Dean review in order. Technician requests start at pending Advisor, Advisor requests start at pending Dean, and Dean requests become approved immediately after availability validation.
- Reassigning a released Student moves only unresolved pending-Technician/pending-Advisor requests to the new Advisor; later-stage and closed history keeps its original attribution.
- Every role can cancel only its own active booking before it starts, with a trimmed 5–2000 character reason; cancellation records actor/time and releases the interval.
- Google identity does not grant an elevated application role; Technician, Advisor, and Dean roles come from a protected allowlist.
- Current Google-provider validation does not yet enforce the approved university domain; B24 is required before broad production use.
- Current privileged RPCs do not yet enforce MFA assurance level `aal2`; B25 is open.
- Current pending requests block availability without duration or per-user quotas; B26 is open.
- Rebooking and notifications are not implemented and must not be described as shipped. The exact institutional cancellation cut-off and no-show policy remain open beyond the implemented before-start rule.
