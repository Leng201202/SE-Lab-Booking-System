# SE Lab Resource Booking System — Project Proposal

## Document Control

| Field | Value |
|---|---|
| Project | SE-Lab-Booking-System |
| Stage | DISCOVER / early design |
| Status | Draft — To Be Validated |
| Intended readers | Student team, supervisor, SE Lab stakeholders |
| Last updated | 2 September 2026 |

## 1. Project Summary

The SE Lab Resource Booking System is a proposed centralized service through which students can discover and reserve shared Software Engineering Lab resources. The resource model is:

```text
SE Lab Resource
├── Computer
│   ├── High-Performance PC
│   ├── iMac
│   └── Standard PC
└── Meeting Room
```

The proposal is a hypothesis at this stage. It must be checked through real user interviews and stakeholder review before the team commits to implementation.

## 2. Problem Hypothesis

Students may currently have difficulty determining which lab resources are suitable, available, or already reserved. They may also encounter overlapping use, unnecessary waiting, and uncertainty about computer specifications or meeting-room capacity.

These statements are **problem hypotheses**, not validated findings. Each is marked **Pending User Interview** until supported by attributable interview evidence in [user-interviews.md](../01-requirements/user-interviews.md).

## 3. Proposed Users

### Primary user groups — To Be Validated

- Software Engineering students
- Students doing AI/ML or computationally demanding work
- Students doing programming, design, or platform-specific development
- Student project teams

### Secondary user groups — To Be Validated

- SE Lab administrators
- Lecturers or staff responsible for lab resources

The interviews must test whether these groups are correct and whether any important user group is missing.

## 4. Proposed Scope

### In scope — To Be Validated

- Sign in and identify the current student or administrator
- Browse resources by type
- View computer details using verified SE Lab specifications
- View meeting-room capacity and equipment using verified SE Lab information
- Search and filter resources
- Check present and future availability
- Request a booking for one resource over a date/time interval
- Record a booking purpose
- Reject overlapping bookings for the same resource
- View, cancel, or reschedule one's bookings, subject to policies still to be collected
- Mark a resource unavailable or under maintenance
- Allow authorized administrators to manage resources and bookings

### Out of scope for the DISCOVER stage

- Production application code
- A finalized database or technology stack
- Unverified hardware specifications
- Unverified institutional, lecturer-specific, cancellation, or usage policies
- Legal conclusions or citations not supplied or checked during Week 2 compliance work

## 5. Proposed Booking Rule

Two active bookings conflict when they refer to the **same resource** and their time intervals overlap. Using half-open intervals `[start, end)`, the candidate rule is:

```text
conflict = sameResource
           AND existingStart < requestedEnd
           AND requestedStart < existingEnd
```

Example: PC-01 booked from 10:00 to 12:00 conflicts with another PC-01 request from 11:00 to 13:00. The same time on PC-02 does not conflict because it is a different resource. Back-to-back bookings such as 10:00–12:00 and 12:00–13:00 do not overlap under this candidate rule.

The treatment of booking status, setup/cleanup buffers, recurring bookings, time zones, and administrator overrides is **To Be Validated**.

## 6. Expected Value — To Be Validated

- Reduce uncertainty when choosing a resource
- Reduce scheduling conflicts and wasted trips or waiting time
- Help students match work to appropriate computer capabilities or room capacity
- Improve visibility of resource demand and utilization for administrators

No benefit is considered proven until the team records supporting evidence and later measures an agreed outcome.

## 7. Discovery Method

The team will conduct semi-structured interviews and capture non-identifying evidence. It will:

1. Interview at least five real users during this stage.
2. Work toward at least fifteen real users during September 2026.
3. Include a reasonable mix of proposed primary and secondary users.
4. Ask about recent real behavior before presenting the proposed solution.
5. Record pains, frequency, impact, current workarounds, and anonymized evidence references.
6. Convert only supported pains into validated requirements.
7. Maintain the chain `User Pain → Requirement → Backlog → Feature → Design`.

## 8. Success and Gate Criteria

The **User Validation Gate** passes only when all of the following are true:

- At least 5 real users have been interviewed and evidence is recorded.
- The monthly plan can reach at least 15 real users.
- Each requirement marked `Validated` traces to at least one real, evidenced user pain.
- Conflicting or weak findings are documented rather than hidden.
- The candidate scope and priorities have been reviewed against the findings.
- Legal requirements from Week 2 are recorded and traced to system requirements.
- All four required design diagrams exist and reflect the current candidate scope.

Current gate status: **NOT PASSED — 0 documented real interviews supplied; production coding must not begin.**

## 9. Deliverables

- Requirements backlog, interview plan/records, and traceability matrix
- Candidate feature list and user journey
- Low-fidelity prototype specification
- Four diagrams: system context, use cases, booking activity, and conceptual domain model
- Compliance rule and legal-requirements register

## 10. Assumptions and Open Questions

All items below are **To Be Validated**:

- What identity provider or account type students use
- Who may book each resource category
- Opening hours, booking duration limits, advance-booking limits, and quotas
- Cancellation, rescheduling, no-show, and late-arrival policies
- Whether approval is required for any resource
- Whether accessibility or assistive-technology needs affect booking
- Which specifications and installed software students need to see
- Whether administrators may override conflicts and how that action is audited
- Which personal data the university permits the system to process and retain
