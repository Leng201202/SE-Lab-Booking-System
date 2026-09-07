# Updated Proposal — SE Lab Booking

## Problem statement

The SE lab has 10 computers shared by students and teachers. Bookings —
especially **remote** use, where the person isn't physically sitting at the
machine — are invisible to everyone else. A team reserves a computer to run
something remotely; another team walks in, sees an "empty" seat, and takes
it. There's no shared source of truth for which computer is free, which is
in onsite use, and which is in remote use, and no way to see or change a
booking once it's made.

> TODO (team): tighten this with 1–2 direct quotes from real interviews,
> e.g. "we lost 40 minutes of a deadline because our remote session got
> taken" — see [user-research.md](user-research.md).

## Target users

| Persona | Who | What they need from the system |
|---|---|---|
| Student (individual/team) | SE students booking a machine for coursework or projects | See real-time availability, book a specific computer for specific hours, mark the session onsite/remote, cancel/rebook without asking anyone |
| Teacher | Lab instructors booking machines for class sections or demos | Same booking ability as students, plus visibility into who is using what (role shown on each booking) for accountability during class hours; holder identified by **student ID**, not name |

Both roles share one account system and one live calendar — there is no
separate "admin" view; every signed-in user sees the same shared timetable
(`src/components/LabCalendar.tsx`), which is the core fix for the
invisibility problem above.

### Identity: student ID instead of name (decided 9 Sep 2026)

To support data minimization, bookings identify the holder by their
**8-digit student ID** (e.g. `6631503***`) rather than their full name, so
the system stores and shows the minimum needed to hold someone accountable
for a slot. **Visibility rule (decided 9 Sep 2026):** the holder's
**student ID + role** are shown to **signed-in users only**; signed-out
visitors see nothing (only the sign-in screen). Teachers and students use
the same 8-digit code field at sign-up.

> **Status note:** this is the agreed target. The app as shipped still
> shows `full_name` and its current RLS lets signed-out (`anon`) users read
> bookings/profiles — see [feature-list.md](../02-design/feature-list.md)
> and [rule.md](../03-compliance/rule.md) for the backlogged
> student-ID + authenticated-only change.

## Why this approach

- **One shared, live calendar** (not a request-and-approve queue) — the
  fastest way to kill "I didn't know it was taken" is to make every booking
  visible to everyone, immediately, without a moderator in the loop.
- **Explicit onsite/remote mode** on every booking — the actual root cause
  identified isn't "no booking system," it's that remote use *looks* free
  from across the room. Surfacing the mode on the tile is the direct fix.
- **Self-service rebook/cancel** — teams' plans change; forcing them to
  release a slot they no longer need (instead of squatting on it "just in
  case") keeps the calendar honest.

## Current state vs. proposal

The app in this repo already implements the core loop: sign in, view the
day's 9:00–20:00 timetable across PC 01–10, book an open hour range, see
who holds a slot and whether it's onsite or remote, and cancel your own
booking. See [feature-list.md](../02-design/feature-list.md) for the full
built-vs-planned breakdown.

## Scope for this cycle

> TODO (team): confirm against real interview findings — cut or add rows.

In scope:
- Live, shared, view-for-everyone timetable
- Book / cancel own bookings, onsite or remote
- Teacher/student role shown per booking

Explicitly out of scope for now:
- Waitlists / notifications when a slot frees up
- Admin override or force-cancel of another user's booking
- Recurring/weekly bookings
