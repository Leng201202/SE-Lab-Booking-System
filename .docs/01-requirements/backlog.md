# Product backlog — SE Lab PC Booking System

Status reflects the repository as of 22 September 2026.

Legend: **Done** = implemented and locally verified · **Configured deployment required** = code exists but external credentials/configuration remain · **Planned** = accepted but not built · **Proposed** = candidate requiring validation.

| ID | User story | Priority | Status | Source |
|---|---|---|---|---|
| B1 | As a university user, I sign in with Google so my identity is not controlled by browser state. | Must | Configured deployment required | Security/product requirement |
| B2 | As an authenticated user, I can view week and day availability for all managed PCs. | Must | Done | Research #1, #2, #5 |
| B3 | As a Student, I can request an available PC for a valid date and time. | Must | Done | Research #3, #4 |
| B4 | As a Student, I can request a one-day in-lab session or a continuous multi-day remote reservation. | Must | Done | Research #1, #2 |
| B5 | As an authenticated user, I can see occupied periods without seeing unrelated Student identity or purpose. | Must | Done | Privacy requirement derived from research #1, #2 |
| B6 | As a Student, I can see my request status and any rejection reason. | Must | Done | Workflow requirement |
| B7 | As an Advisor, I can approve or reject requests from assigned Students only. | Must | Done | Institutional approval workflow |
| B8 | As a Dean, I can make the final decision only after Advisor approval. | Must | Done | Institutional approval workflow |
| B9 | As a user, overlapping active bookings for the same PC cannot both succeed, including concurrent requests. | Must | Done | Research #3, #4 |
| B10 | As a signed-out visitor, I cannot read profiles, PCs, bookings, or calendar occupancy. | Must | Done | Privacy/security requirement |
| B11 | As an authorized user, I can open a booking detail appropriate to my role. | Must | Done | Workflow requirement |
| B12 | As a reviewer, every approval or rejection creates an attributable audit event. | Must | Done | Accountability requirement |
| B13 | As a Student, I can cancel an eligible future request. | Should | Planned | Research #3, #4 |
| B14 | As a Student, I can safely change a booking's PC or interval without losing the original slot mid-operation. | Should | Planned | Research #3, #4 |
| B15 | As a user, I receive clear success or failure feedback after a workflow action. | Should | Done (in-app) | Trust/usability requirement |
| B16 | As an operator, I can manage maintenance/inactive PC state through a protected administrative process. | Should | Planned UI; database model done | Operational requirement |
| B17 | As a user, I receive email or in-app notifications when a decision is made. | Could | Proposed | Not yet supported by interviews |
| B18 | As a lab operator, I can configure limits, blackout periods, and no-show rules. | Could | Proposed | Requires stakeholder policy |
| B19 | As a user, I can create recurring weekly reservations. | Won't this cycle | Proposed | Not supported by current research |

## Acceptance notes

- Active statuses are **pending_advisor**, **pending_dean**, and **approved**.
- One-day lab bookings use 08:00–18:00 in 15-minute increments.
- A multi-day request is remote and reserves the complete inclusive Bangkok date range.
- Students need an assigned Advisor before creating a request.
- Google identity does not grant an elevated application role; Advisor and Dean roles come from a protected allowlist.
- Cancellation, rebooking, notifications, and administrative UI are not implemented and must not be described as shipped.
