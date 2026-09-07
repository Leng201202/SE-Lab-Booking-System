# Rules — SE Lab Booking

Operating rules the system enforces or should enforce. Mark each as
**Enforced** (in code/DB today), **Policy-only** (stated but not enforced
by the system), or **TODO**.

## Lab & booking rules

| Rule | Status | Where |
|---|---|---|
| Lab hours are 09:00–20:00; no booking may start/end outside this window | Enforced | DB check `bookings_hours_valid` |
| A computer can't be double-booked for an overlapping time range | Enforced | DB trigger `prevent_booking_overlap` |
| Only the booking's owner can cancel or modify it | Enforced | RLS policies on `bookings` (`auth.uid() = user_id`) |
| Every booking must declare onsite or remote use | Enforced | `bookings.mode` is `NOT NULL`, UI requires a selection |
| The calendar (who booked what, when, onsite/remote) is visible to every signed-in user, and to signed-out visitors is not shown at all — only the sign-in screen is | Enforced | RLS `SELECT` grants on `bookings`/`profiles`; `src/routes/index.tsx` gates the calendar behind `user` |
| Computer IDs are limited to the lab's 10 physical machines (1–10) | Enforced | DB check `bookings_computer_range` |
| TODO (team): max booking length per user/day, if the lab wants one | TODO | — |
| TODO (team): no-show policy (unused onsite booking after N minutes) | TODO | — |

## Data rules

> TODO (team): fill this section in from your actual W2 legal spec — see
> [legal-requirement-trace.md](legal-requirement-trace.md). Starter rows
> below are placeholders only.

| Rule | Status | Where |
|---|---|---|
| Only `full_name` and `role` are stored beyond what Supabase Auth already holds (email, password hash) — no other personal data is collected | TODO — confirm against W2 spec | `profiles` table |
| Users can only edit their own profile | Enforced | RLS policy `Users can update own profile` |
| TODO (team): data retention — how long are past bookings kept? | TODO | — |
| TODO (team): who can access the Supabase project/service-role key, and how is it kept out of the client bundle | TODO | `.env` (`VITE_*` keys are public by design; service-role key must never be `VITE_`-prefixed) |
