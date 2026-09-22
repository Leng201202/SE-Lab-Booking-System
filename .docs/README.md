# Project documentation map

This folder contains the requirements, design, and compliance evidence for the current SE Lab PC Booking System. It reflects the React/Vite frontend and repository-root Supabase backend as implemented on 22 September 2026.

The system supports:

- Google OAuth authentication
- trusted Student, Advisor, and Dean roles
- Student request → Advisor review → Dean review
- one-day in-lab and multi-day remote reservations
- authenticated, privacy-preserving PC availability
- PostgreSQL RLS, transactional workflow functions, conflict prevention, and approval audit events

## Deliverables

| Area | Contents |
|---|---|
| Requirements | [Proposal](01-requirements/proposal.md), [backlog](01-requirements/backlog.md), and [user research](01-requirements/user-research.md) |
| Design | [Feature list](02-design/feature-list.md), [user journeys](02-design/user-journey.md), [prototype guide](02-design/prototype.md), and four diagrams |
| Compliance | [System rules](03-compliance/rule.md) and [legal requirement trace](03-compliance/legal-requirement-trace.md) |

## Evidence status

- [x] Five interview records are present. The team must confirm they are genuine and retain consent/notes outside this public repository.
- [x] Four design diagrams are present and aligned with the implementation.
- [x] Implemented requirements trace to code, database rules, research pain, or an explicit institutional workflow source.
- [x] Local verification includes a clean database rebuild, 37 pgTAP tests, schema lint, frontend lint, four unit tests, production build, and dependency audit.
- [ ] Real hosted Google OAuth, production redirects, role allowlist, and Advisor assignments still require deployment configuration.
- [ ] Privacy notice, retention schedule, legal applicability, and final university/supervisor approval remain open governance work.

The root [README](../README.md), [plan](../plan.md), and [agent guide](../agent.md) are the technical sources of truth. Do not use older screenshots or hosted prototype claims unless they are revalidated against the current repository.
