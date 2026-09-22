# Feature list — SE Lab PC Booking System

| Feature | Current behavior | Status |
|---|---|---|
| Google OAuth | Redirects through Supabase Auth; sessions persist and restore | Implemented; provider deployment configuration required |
| Trusted roles | New Google users default to Student; Advisor/Dean require protected allowlist entries | Done |
| Signed-out gate | Visitors see the sign-in page and cannot read application tables or calendar RPC output | Done |
| Role-specific navigation | Student, Advisor, and Dean receive appropriate pages and actions | Done |
| PC inventory | Ten seeded PCs with room, specification, available/maintenance/inactive state | Done |
| Week availability | Seven-day overview across all PCs | Done |
| Day timeline | 08:00–18:00 timeline with 15-minute Student selection | Done |
| Privacy-preserving calendar | Shows occupancy/status/access mode; unrelated private booking details are omitted | Done |
| One-day lab request | Valid time within 08:00–18:00 | Done |
| Multi-day remote request | Continuous full-day reservation over an inclusive date range | Done |
| Conflict prevention | PostgreSQL exclusion constraint rejects overlapping active intervals | Done |
| Student request history/detail | Students see only their own private records and rejection reasons | Done |
| Advisor review | Assigned Advisor approves to Dean or rejects with a reason | Done |
| Dean review | Dean sees Advisor-approved requests and gives final decision | Done |
| Approval audit | Append-only event for every approval/rejection | Done |
| Maintenance/inactive blocking | Non-available PCs cannot be selected or booked | Done |
| Student cancellation | Cancel an eligible request | Planned |
| Rebook/edit | Atomically change PC or interval | Planned |
| Notifications | Email or durable in-app decision notifications | Proposed |
| Admin operations UI | Manage PCs, allowlist, and Advisor assignments | Proposed |
| Realtime refresh | Automatic cross-device refresh | Optional follow-up; current app refetches after mutations |

Database authorization is authoritative. Frontend route guards and disabled controls are usability features only.
