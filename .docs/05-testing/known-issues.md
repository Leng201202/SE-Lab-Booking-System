# Known issues and bug log — SE Lab PC Booking System

This is a living log of bugs and known limitations. The system is still in development, so update it whenever a bug is found or fixed.

_Last updated: 23 September 2026_

## How to use this log

1. **Found a bug?** Add a row to [Bug log](#bug-log) with the next ID (`BUG-xx`), a short description, where it happens, the date, and status **Open**.
2. **Fixed a bug?** Change the status to **Fixed** and put the commit hash (or pull request number) in **Fixed in**.
3. **Can't reproduce or won't fix?** Use status **Closed** and explain in **Notes**.
4. Missing features belong in the [product backlog](../01-requirements/backlog.md), not here. The [Known limitations](#known-limitations) section only summarizes the ones users are most likely to notice.

**Severity:** **High** = blocks a main workflow or affects security/data · **Medium** = wrong behavior with a workaround · **Low** = cosmetic or minor.

**Status:** **Open** · **In progress** · **Fixed** · **Closed**

## Bug log

| ID | Description | Area | Severity | Found on | Status | Fixed in | Notes |
|---|---|---|---|---|---|---|---|
| BUG-01 | Mermaid syntax error stopped the booking sequence diagram from rendering | Docs / diagrams | Low | 2026-09-22 | Fixed | `f2cd893` | `.docs/02-design/diagrams/04-sequence-diagram-booking.md` |
| BUG-02 | Google sign-in failed when running the app on localhost | Auth | High | 2026-09-22 | Fixed | `655b663` | Updated `authService.js` and added a migration backfilling profiles for existing Google users |
| BUG-03 | New Google users could be refused a profile because `email_confirmed_at` may not be set yet when the sign-up trigger runs | Auth / database | High | 2026-09-22 | Fixed | `b994e0d` | Migration `20260922000500_fix_google_profile_creation.sql` checks the Google provider instead |
| BUG-04 | Users could book a PC on a past day, or at a time that had already passed today | Booking form / calendar | High | 2026-09-23 | Fixed | `8b9a03d`, `e2adeb3` | Frontend blocks past dates and elapsed slots; migration `20260923000100_enforce_future_booking_start.sql` also enforces it in the database |
| BUG-05 | "Supabase Preview" GitHub check fails on pushes to `main` with `column "student_id" does not exist` | Deployment / database migrations | Medium | 2026-09-23 | Open | — | Migration `20260922000400_expand_role_capabilities.sql` tries to rename a column that is already renamed in the hosted database. Likely fix: `supabase migration repair --status applied 20260922000400` after checking `supabase migration list`, or make the rename conditional. The Vercel deployment is not affected |
| BUG-06 | The future-start database rule (BUG-04) has not been confirmed on the hosted Supabase project | Deployment | Medium | 2026-09-23 | Open | — | Blocked by BUG-05. Verify after the migration history is repaired |

## Known limitations

These are features that are not built yet. Users may run into them, so they are listed here with a workaround.

| Limitation | Workaround | Backlog |
|---|---|---|
| Students cannot cancel a request | Ask the Advisor to reject it, or contact the Dean | B13 |
| A booking cannot be edited or moved to another PC/time | Submit a new request (the old one still blocks the slot until it is rejected) | B14 |
| No email or in-app notifications for decisions | Check **My Bookings** or the request detail page | B17 |
| No limits on booking length or number of pending requests per user | Advisors and the Dean should reject unreasonable requests | B26 |
| Pages do not refresh automatically when someone else changes data | Reload the page to see the latest status | — |
| Any Google account can sign in, not only university accounts | Only use university accounts. Roles above Student are still controlled by the allowlist | B24 |

Other security gaps (MFA, user suspension, audit of role changes, security headers) are tracked in the [security review](../03-compliance/security-review.md) as backlog items B25–B33.

## Change history of this log

| Date | Change |
|---|---|
| 2026-09-23 | Log created with bugs found from the commit history and current CI status |
