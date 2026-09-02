# Candidate Requirements Backlog

## Status and Use

This is a DISCOVER-stage backlog. Every item is a candidate and has status **To Be Validated** unless real interview or approved compliance evidence is added later. Proposed priorities are conversation starters, not delivery commitments.

Status vocabulary:

- `To Be Validated` — hypothesis without sufficient evidence
- `Validated` — supported by recorded real-user pain or approved compliance evidence
- `Invalidated` — evidence indicates the item should not proceed
- `Deferred` — valid but deliberately outside the current release scope

## Requested Candidate-Requirement Coverage

Some closely related capabilities share one requirement specification, but every capability requested in the project brief is explicitly covered.

| Requested capability | Requirement | Backlog item | Status |
|---|---|---|---|
| User authentication | REQ-001 | BL-001 | To Be Validated |
| Resource dashboard | REQ-002 | BL-002 | To Be Validated |
| Resource categories | REQ-002 | BL-002 | To Be Validated |
| Search/filter resources | REQ-003 | BL-003 | To Be Validated |
| View computers | REQ-004 | BL-004 | To Be Validated |
| View computer specifications | REQ-004 | BL-004 | To Be Validated |
| View meeting rooms | REQ-005 | BL-005 | To Be Validated |
| View meeting-room capacity | REQ-005 | BL-005 | To Be Validated |
| Check resource availability | REQ-006 | BL-006 | To Be Validated |
| Availability calendar | REQ-006 | BL-006 | To Be Validated |
| Book a resource | REQ-007 | BL-007 | To Be Validated |
| Select date and time | REQ-007, REQ-017 | BL-007, BL-017 | To Be Validated |
| Enter booking purpose | REQ-007 | BL-007 | To Be Validated |
| Prevent overlapping bookings | REQ-008 | BL-008 | To Be Validated |
| My Bookings | REQ-010 | BL-010 | To Be Validated |
| Booking details | REQ-009, REQ-010 | BL-009, BL-010 | To Be Validated |
| Cancel booking | REQ-011 | BL-011 | To Be Validated |
| Reschedule booking | REQ-012 | BL-012 | To Be Validated |
| Booking confirmation | REQ-009 | BL-009 | To Be Validated |
| Resource status | REQ-018 | BL-018 | To Be Validated |
| Maintenance/unavailable status | REQ-013, REQ-018 | BL-013, BL-018 | To Be Validated |
| Admin resource management | REQ-014, REQ-016 | BL-014, BL-016 | To Be Validated |
| Admin booking management | REQ-015, REQ-016 | BL-015, BL-016 | To Be Validated |

## Candidate User Stories

| Backlog ID | Requirement | Candidate user story | Candidate acceptance notes | Proposed priority | Status |
|---|---|---|---|---|---|
| BL-001 | REQ-001 | As a user, I want to sign in so that I can access functions permitted for me. | Recognize an authenticated user; reject invalid access; sign-out/session behavior is still to be defined. | Must | To Be Validated |
| BL-002 | REQ-002 | As a student, I want a dashboard grouped by resource category so that I can begin with the kind of resource I need. | Show High-Performance PCs, iMacs, Standard PCs, and Meeting Rooms; show a clearly defined status. | Must | To Be Validated |
| BL-003 | REQ-003 | As a student, I want to search and filter resources so that I can narrow the choices. | Candidate filters include type, availability, capabilities, and room capacity; exact filters are pending interviews. | Should | To Be Validated |
| BL-004 | REQ-004 | As a student, I want to browse computers and view verified specifications so that I can assess suitability. | Show ID/name, type, status, and verified CPU/chip, GPU, RAM, storage, OS, and relevant software; never invent missing values. | Must | To Be Validated |
| BL-005 | REQ-005 | As a project-team member, I want to view meeting-room details so that I can assess suitability. | Show verified room ID/name, capacity, equipment, status, and reservations; missing facts use explicit placeholders. | Must | To Be Validated |
| BL-006 | REQ-006 | As a student, I want to view resource availability so that I can choose an open time. | Show current availability and a calendar/list of upcoming reservations without exposing unnecessary personal information. | Must | To Be Validated |
| BL-007 | REQ-007 | As a student, I want to enter a date, start time, end time, and purpose so that I can request a resource booking. | Require a resource and valid time interval; purpose policy and requiredness are pending validation. | Must | To Be Validated |
| BL-008 | REQ-008 | As a user, I want the system to prevent overlapping reservations so that a resource is not promised to two bookings at once. | Reject an active booking when the same resource overlaps; allow the same time on a different resource; boundary/status rules remain to be validated. | Must | To Be Validated |
| BL-009 | REQ-009 | As a student, I want a clear booking result so that I know whether my request succeeded. | On success show confirmation and booking details; on conflict show a non-destructive error and paths to another time/resource. | Must | To Be Validated |
| BL-010 | REQ-010 | As a student, I want to view my bookings and their details so that I can manage my plans. | Show relevant upcoming/past bookings, resource, interval, purpose where appropriate, and status. | Must | To Be Validated |
| BL-011 | REQ-011 | As a student, I want to cancel a booking so that a resource can become available when plans change. | Require confirmation; update availability; cancellation deadline and notifications are pending policy. | Should | To Be Validated |
| BL-012 | REQ-012 | As a student, I want to reschedule a booking so that I can change plans without creating a conflict. | Check the replacement interval under the same conflict rule; preserve the original if the change cannot be completed. | Should | To Be Validated |
| BL-013 | REQ-013 | As an administrator, I want to mark a resource under maintenance or unavailable so that users do not book it. | Status is visible; affected-booking behavior and authorized roles are pending policy. | Must | To Be Validated |
| BL-014 | REQ-014 | As an administrator, I want to create and update resource records so that displayed inventory information remains accurate. | Manage category and verified details; role authorization and audit needs are pending validation. | Should | To Be Validated |
| BL-015 | REQ-015 | As an administrator, I want to view and manage bookings so that I can support lab operations. | Candidate actions include view, search, cancel, and exceptional changes; override rules are not assumed. | Should | To Be Validated |
| BL-016 | REQ-016 | As a resource owner, I want administrative actions restricted to authorized people so that records and bookings are protected. | Student/admin permissions are separated; actual roles and identity source are pending stakeholder input. | Must | To Be Validated |
| BL-017 | REQ-017 | As a user, I want invalid dates and times rejected clearly so that I can correct my request. | End must be after start; allowed dates, lab hours, duration, quota, and time-zone rules are pending policy. | Must | To Be Validated |
| BL-018 | REQ-018 | As a user, I want resource status to use consistent terms so that I can interpret availability. | Candidate states include Available, Booked, Unavailable, and Maintenance; definitions and precedence are pending validation. | Should | To Be Validated |
| BL-019 | REQ-019 | As a data subject, I want the service to process only approved data for an understood purpose. | Candidate compliance control only; exact fields, lawful basis/authority, notice, and consent rules await Week 2 evidence. | Must | To Be Validated |
| BL-020 | REQ-020 | As an authorized stakeholder, I want booking and account data protected and retained only as approved. | Candidate compliance control only; access, retention, deletion, incident, and audit rules await Week 2 evidence. | Must | To Be Validated |

## Requirement Specifications

### REQ-001 — Authentication

The system shall authenticate users before exposing personalized booking functions. The identity provider, account eligibility, and session rules are **To Be Validated**.

### REQ-002 — Resource dashboard and categories

The system shall present resources under the parent type `SE Lab Resource`, with subtypes `Computer` and `Meeting Room`. Computer categories shall be High-Performance PC, iMac, and Standard PC.

### REQ-003 — Search and filter

The system shall provide candidate search/filter controls. The final searchable fields and filters depend on interview evidence and actual inventory data.

### REQ-004 — Computer information

The system shall display only verified computer attributes. Candidate fields are ID/name, type, status, CPU/chip, GPU, RAM, storage, operating system, relevant installed software, current availability, and upcoming reservations. Unknown values shall read `Replace with actual SE Lab specification` or `Not yet collected`.

### REQ-005 — Meeting-room information

The system shall display verified room ID/name, capacity, equipment, current availability, and upcoming reservations. Unknown values shall be labeled as not yet collected.

### REQ-006 — Availability

The system shall show current and future resource availability in an accessible list/calendar representation. The exact horizon, granularity, and privacy rules are **To Be Validated**.

### REQ-007 — Booking request

The system shall accept one resource, date, start time, end time, and booking purpose as candidate booking input. Any purpose taxonomy or limits are **To Be Validated**.

### REQ-008 — Conflict prevention

For active bookings of the same resource, the system shall reject a requested interval when:

```text
existing.start < requested.end AND requested.start < existing.end
```

This candidate formula treats intervals as `[start, end)`. Booking statuses counted as active, concurrent-request handling, setup buffers, administrator overrides, and recurring bookings remain **To Be Validated**.

### REQ-009 — Booking outcome

The system shall show a confirmation when a booking succeeds. If the resource is unavailable or the interval conflicts, it shall preserve user input where safe, identify the conflict without disclosing another user's private data, and allow selection of another time or resource.

### REQ-010 — My Bookings

The system shall provide an authenticated user with a list and detail view of their own bookings. The definition of historical retention is pending compliance review.

### REQ-011 — Cancellation

The system shall support user cancellation, subject to an uncollected cancellation policy. It shall require confirmation and update the booking's status rather than silently removing evidence needed for legitimate operations.

### REQ-012 — Rescheduling

The system shall validate a proposed new interval using the same availability and conflict rules. If the operation fails, the current confirmed booking shall remain unchanged.

### REQ-013 — Maintenance/unavailable status

An authorized administrator shall be able to mark a resource unavailable or under maintenance. Rules for existing bookings, reasons, dates, and notifications are pending stakeholder evidence.

### REQ-014 — Administrative resource management

An authorized administrator shall be able to manage resource inventory and verified descriptive fields. Deletion/archive behavior is **To Be Validated**.

### REQ-015 — Administrative booking management

An authorized administrator shall be able to find and inspect bookings and perform only approved management actions. No override capability is assumed.

### REQ-016 — Authorization

The system shall enforce permissions for student and administrative operations. The role model and exceptional access process require stakeholder validation.

### REQ-017 — Date/time validity

The system shall reject missing or malformed inputs and any interval whose end is not after its start. Lab hours, duration, future-date, quota, and time-zone constraints are pending policy discovery.

### REQ-018 — Resource status

The system shall use consistently defined status labels. Candidate labels are Available, Booked, Unavailable, and Maintenance; their calculation and precedence require validation.

### REQ-019 — Data minimization and transparency candidate

The system shall collect and display only data approved for a documented purpose and shall present any required notice. This is a candidate control awaiting Week 2 legal requirements and institutional policy.

### REQ-020 — Data protection and retention candidate

The system shall restrict access to booking/account data and retain or delete it according to an approved schedule. Specific obligations await Week 2 legal requirements and institutional policy.

## Definition of Ready for Implementation

A backlog item is not ready for production coding until it has:

- a `Validated` decision with evidence;
- traceability to a real user pain or approved legal requirement;
- agreed acceptance criteria and policy decisions;
- updated feature and design references;
- no unresolved critical dependency, privacy, or authorization question.

Current result: **No backlog item is ready for production implementation.**
