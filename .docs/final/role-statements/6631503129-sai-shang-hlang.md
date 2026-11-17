# Role statement — Sai Shang Hlang

**Student ID:** 6631503129  
**Role:** Tech Lead

I owned the technical direction of the SE Lab PC Booking System and helped connect the React frontend to the Supabase/PostgreSQL backend. My work focused on making the database the authoritative security and booking boundary rather than relying only on interface controls. I contributed to the role-aware workflow, future-start validation, booking conflict prevention, cancellation behavior, and the migration-backed data model. I also helped maintain the booking and calendar behavior so that Bangkok time, 15-minute slots, multi-day remote reservations, and active booking statuses are handled consistently.

I documented how the system is structured and how a Student request moves through Technician, selected Advisor, and Dean review. I also helped keep the implementation guide and backend setup instructions aligned with the current per-booking Advisor model, trusted roles, RLS policies, and protected RPC functions. For the presentation, I own the live demonstration and explain why a request rejected by PostgreSQL cannot be bypassed by changing the browser flow.

Evidence: [architecture rules](../../../agent.md), [ER diagram](../../02-design/diagrams/03-er-diagram.md), [booking sequence](../../02-design/diagrams/04-sequence-diagram-booking.md), [prototype guide](../../02-design/prototype.md), and [Supabase setup](../../../supabase/README.md).

**AI disclosure:** AI tools supported some code, documentation, and explanation drafts. I reviewed the resulting implementation, migrations, and security claims and remain accountable for the technical decisions. The product itself does not send user data to an AI service.
