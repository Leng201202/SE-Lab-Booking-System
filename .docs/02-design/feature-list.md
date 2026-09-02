# Candidate Feature List

All features are **To Be Validated**. Their presence here means they are represented in discovery/design artifacts; it does not authorize production implementation.

| Feature ID | Candidate feature | Requirements | Backlog | Prototype/design | Status |
|---|---|---|---|---|---|
| FT-01 | User authentication | REQ-001 | BL-001 | DS-00; DGM-01, DGM-02 | To Be Validated |
| FT-02 | Resource dashboard and categories | REQ-002 | BL-002 | DS-01; DGM-02 | To Be Validated |
| FT-03 | Resource search and filters | REQ-003 | BL-003 | DS-01 | To Be Validated |
| FT-04 | Computer list and verified specifications | REQ-004 | BL-004 | DS-01, DS-02; DGM-04 | To Be Validated |
| FT-05 | Meeting-room list, capacity, and equipment | REQ-005 | BL-005 | DS-01, DS-02; DGM-04 | To Be Validated |
| FT-06 | Availability calendar and upcoming reservations | REQ-006 | BL-006 | DS-02, DS-03; DGM-03 | To Be Validated |
| FT-07 | Book a resource with date/time/purpose | REQ-007 | BL-007 | DS-03 | To Be Validated |
| FT-08 | Overlapping-booking prevention | REQ-008 | BL-008 | DS-03, DS-04; DGM-03 | To Be Validated |
| FT-09 | Booking confirmation or conflict result | REQ-009 | BL-009 | DS-04, DS-05 | To Be Validated |
| FT-10 | My Bookings and booking details | REQ-010 | BL-010 | DS-06 | To Be Validated |
| FT-11 | Cancel booking | REQ-011 | BL-011 | DS-06 | To Be Validated |
| FT-12 | Reschedule booking | REQ-012 | BL-012 | DS-03, DS-06 | To Be Validated |
| FT-13 | Maintenance/unavailable status | REQ-013 | BL-013 | DS-01, DS-02, DS-07 | To Be Validated |
| FT-14 | Admin resource management | REQ-014 | BL-014 | DS-07 | To Be Validated |
| FT-15 | Admin booking management | REQ-015 | BL-015 | DS-07 | To Be Validated |
| FT-16 | Role-based authorization | REQ-016 | BL-016 | DS-00, DS-07; DGM-01 | To Be Validated |
| FT-17 | Date/time input validation | REQ-017 | BL-017 | DS-03, DS-04 | To Be Validated |
| FT-18 | Consistent resource status | REQ-018 | BL-018 | DS-01, DS-02, DS-07 | To Be Validated |
| FT-19 | Candidate data minimization/transparency controls | REQ-019 | BL-019 | All screens | Awaiting Week 2 evidence |
| FT-20 | Candidate data access/retention controls | REQ-020 | BL-020 | DS-00, DS-06, DS-07; DGM-04 | Awaiting Week 2 evidence |

## Resource Detail Fields

### Computer — candidate fields

- Computer ID/name
- Computer category: High-Performance PC, iMac, or Standard PC
- Status
- CPU or chip
- GPU where applicable
- RAM
- Storage
- Operating system
- Relevant installed/special software
- Current availability
- Upcoming reservations

Actual values must come from the SE Lab inventory. Until then, show `Replace with actual SE Lab specification`.

### Meeting room — candidate fields

- Room ID/name
- Capacity
- Available equipment
- Status/current availability
- Upcoming reservations

Actual values must come from an authorized SE Lab source. Until then, show `Not yet collected`.

## Feature Decisions Still Needed

- Whether real-time “currently available” status is reliable and valuable
- Which filters users actually use
- Whether booking purpose is required, free text, categorized, or visible to staff
- Calendar granularity and whether another user's identity is ever displayed
- Booking duration, advance window, quotas, operating hours, and buffers
- Cancellation/rescheduling deadlines and notifications
- Maintenance effects on existing bookings
- Administrator roles and permitted actions
- Accessibility, localization, and notification needs
- Week 2 compliance requirements
