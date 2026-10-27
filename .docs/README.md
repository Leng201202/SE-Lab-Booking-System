# Project documentation map

This folder contains the requirements, design, and compliance evidence for the current SE Lab PC Booking System. It reflects the React/Vite frontend and repository-root Supabase backend as reviewed on 28 October 2026.

The system supports:

- Google OAuth authentication
- trusted Student, Technician, Advisor, and Dean roles
- Student → Technician → selected Advisor → Dean, Technician → Advisor → Dean, Advisor → Dean, and immediate validated Dean booking paths
- per-booking Advisor selection for Students, Technician/Dean PC management, and Dean user administration
- future-only one-day in-lab and multi-day remote reservations using Bangkok time
- reason-required cancellation by the authenticated role that owns an active future booking
- self-service soft account deactivation with a 90-day reactivation window
- authenticated, privacy-preserving PC availability
- PostgreSQL RLS, transactional workflow functions, conflict prevention, and approval audit events

## Deliverables

| Area | Contents |
|---|---|
| Requirements | [Proposal](01-requirements/proposal.md), [backlog](01-requirements/backlog.md), and [user research](01-requirements/user-research.md) |
| Design | [Feature list](02-design/feature-list.md), [user journeys](02-design/user-journey.md), [prototype guide](02-design/prototype.md), and four diagrams |
| Compliance | [System rules](03-compliance/rule.md), [security review](03-compliance/security-review.md), and [legal requirement trace](03-compliance/legal-requirement-trace.md) |

## Evidence status

- [x] Five interview records are present. The team must confirm they are genuine and retain consent/notes outside this public repository.
- [x] Four design diagrams are present and aligned with the implementation.
- [x] Implemented requirements trace to code, database rules, research pain, or an explicit institutional workflow source.
- [x] The database suite defines 147 pgTAP assertions across three files; the prior foundation passed a clean rebuild and schema lint. The latest Advisor-selection migration still requires deployment verification.
- [x] Frontend lint, 11 unit tests, and the production build pass, including Bangkok next-slot, cancellation eligibility, and Advisor request-parameter coverage.
- [x] A repository and unauthenticated production security review is recorded; no confirmed critical issue was found, and the backlog through B38 tracks required remediation.
- [x] Hosted Google OAuth has been verified from the local frontend against the production Supabase project.
- [ ] Production Vercel-origin OAuth, migration parity, protected first-Dean promotion, role boundaries, and Priority 0 security remediation still require release verification.
- [ ] Privacy notice, retention schedule, legal applicability, and final university/supervisor approval remain open governance work.

The root [README](../README.md), [plan](../plan.md), and [agent guide](../agent.md) are the technical sources of truth. Do not use older screenshots or hosted prototype claims unless they are revalidated against the current repository.
