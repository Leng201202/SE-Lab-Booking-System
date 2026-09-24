# Feature list — SE Lab PC Booking System

| Feature | Current behavior | Status |
|---|---|---|
| Google OAuth | Redirects through Supabase Auth; sessions persist and restore | Implemented; provider deployment configuration required |
| Trusted roles | Every new Google user starts as Student; Technician/Advisor/Dean require a later protected allowlist update | Done |
| Signed-out gate | Visitors see the sign-in page and cannot read application tables or calendar RPC output | Done |
| Role-specific navigation | Student, Technician, Advisor, and Dean receive appropriate pages and actions | Done |
| PC inventory | Ten seeded PCs with room, specification, available/maintenance/inactive state | Done |
| Week availability | Seven-day overview across all PCs; past dates and days without a remaining slot are read-only | Done |
| Day timeline | 08:00–18:00 timeline with 15-minute selection; elapsed slots are disabled using Bangkok time | Done |
| Privacy-preserving calendar | Shows occupancy/status/access mode; unrelated private booking details are omitted | Done |
| One-day lab request | Future start within 08:00–18:00, beginning at the next valid 15-minute slot when booking today | Done |
| Multi-day remote request | Continuous full-day reservation over an inclusive future date range | Done |
| Conflict prevention | PostgreSQL exclusion constraint rejects overlapping active intervals | Done |
| Own request history/detail | Every role sees its own private records and rejection reasons | Done |
| Technician review | Technician approves Student requests to the assigned Advisor or rejects with a reason | Done |
| Advisor review | Assigned Advisor reviews Technician-approved Student requests; any Advisor may review a Technician request | Done |
| Technician booking | Skips technical review and begins at pending Advisor | Done |
| Advisor booking | Skips Advisor review and begins at pending Dean | Done |
| Dean booking | Immediately approved after PC/rule/conflict validation | Done |
| Dean review | Dean sees requests that completed their required earlier stages | Done |
| Approval audit | Append-only event for every approval/rejection | Done |
| Maintenance/inactive blocking | Non-available PCs cannot be selected or booked | Done |
| Requester cancellation | Any role owner cancels an active future booking with a required reason; actor/time are recorded and the slot is released | Done |
| Rebook/edit | Atomically change PC or interval | Planned |
| Notifications | Email or durable in-app decision notifications | Proposed |
| Advisor relationship management | Advisor claims unassigned Students or releases own advisees | Done |
| Dean user management | View all profiles, change roles, and assign Advisors | Done |
| Technician/Dean PC management | Add PCs and update room, specification, status, and notes | Done |
| Realtime refresh | Automatic cross-device refresh | Optional follow-up; current app refetches after mutations |

Database authorization is authoritative. Frontend route guards and disabled controls are usability features only.
