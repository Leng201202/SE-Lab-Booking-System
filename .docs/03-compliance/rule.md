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
| The calendar (who booked what — **student ID + role**, when, onsite/remote) is visible to every **signed-in** user; signed-out visitors are not shown the calendar or any booking data — only the sign-in screen | Enforced (gate) / **needs RLS change** — UI gates on `user` in `src/routes/index.tsx`, but RLS still grants `anon` SELECT | `src/routes/index.tsx`; `supabase/migrations/*_292b4570*.sql` (revoke anon read) |
| Computer IDs are limited to the lab's 10 physical machines (1–10) | Enforced | DB check `bookings_computer_range` |
| TODO (team): max booking length per user/day, if the lab wants one | TODO | — |
| TODO (team): no-show policy (unused onsite booking after N minutes) | TODO | — |

## Data rules

> TODO (team): fill this section in from your actual W2 legal spec — see
> [legal-requirement-trace.md](legal-requirement-trace.md). Starter rows
> below are placeholders only.

| Rule | Status | Where |
|---|---|---|
| Only the minimum identity — the holder's 8-digit **student ID** and `role` — is stored and shown, instead of a full name; no other personal data is collected | Enforced (agreed) — `profiles` table; app still maps/renders from `full_name` until the student-ID change ships | `profiles` table, `AuthPanel` sign-up |
| Users can only edit their own profile | Enforced | RLS policy `Users can update own profile` |
| TODO (team): data retention — how long are past bookings kept? | TODO | — |
| TODO (team): who can access the Supabase project/service-role key, and how is it kept out of the client bundle | TODO | `.env` (`VITE_*` keys are public by design; service-role key must never be `VITE_`-prefixed) |
