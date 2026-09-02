# SE Lab Resource Booking System

A university Software Engineering project exploring a centralized way for students to discover and reserve shared resources in the Software Engineering Lab.

## Proposed Resource Scope

```text
SE Lab Resource
├── Computer
│   ├── High-Performance PC
│   ├── iMac
│   └── Standard PC
└── Meeting Room
```

The proposed system lets students browse verified resource details, check availability, request a date/time interval, receive a booking confirmation or conflict result, and manage their own bookings. Candidate administrative functions cover verified resource records, maintenance/unavailable status, and approved booking-management actions.

## Current Stage: DISCOVER

This repository is currently documenting problem hypotheses, candidate requirements, user research, and early design. All product features are **To Be Validated**. No real interview responses, hardware specifications, legal citations, or lecturer-specific requirements are assumed.

Current User Validation Gate: **NOT PASSED**.

- Required during this stage: at least 5 documented real-user interviews
- Target during September 2026: at least 15 documented real-user interviews
- Documented interviews supplied so far: 0
- Production application coding must not begin until the gate criteria are met

## Documentation

- [Project proposal](.docs/00-proposal/proposal.md)
- [Candidate requirements backlog](.docs/01-requirements/backlog.md)
- [User interview plan and evidence register](.docs/01-requirements/user-interviews.md)
- [Traceability matrix](.docs/01-requirements/traceability.md)
- [Candidate feature list](.docs/02-design/feature-list.md)
- [Candidate user journey](.docs/02-design/user-journey.md)
- [Low-fidelity prototype](.docs/02-design/prototype.md)
- Design diagrams: [system context](.docs/02-design/diagrams/diagram-1.md), [use cases](.docs/02-design/diagrams/diagram-2.md), [booking activity](.docs/02-design/diagrams/diagram-3.md), and [conceptual domain model](.docs/02-design/diagrams/diagram-4.md)
- [Project and booking rules](.docs/03-compliance/rule.md)
- [Legal and institutional requirements register](.docs/03-compliance/legal-requirements.md)

The design treats conflict prevention consistently across High-Performance PCs, iMacs, Standard PCs, and Meeting Rooms: overlapping active bookings are rejected for the same resource, while another resource may remain bookable for the same interval. Boundary and policy details remain subject to validation.
