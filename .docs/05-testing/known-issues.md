# Known issues and bug log — SE Lab PC Booking System

This is a living log of bugs and known limitations. The system is still in development, so update it whenever a bug is found or fixed.

_Last updated: 17 November 2026 (QA retest; full results in [test/test.md](../../test/test.md))_

## How to use this log

1. **Found a bug?** Add a row to [Bug log](#bug-log) with the next ID (`BUG-xx`), a short description, where it happens, the date, and status **Open**.
2. **Fixed a bug?** Change the status to **Fixed** and put the commit hash (or pull request number) in **Fixed in**. Then retest it and record the date, result and evidence (test name or log file) in **Retest**.
3. **Can't reproduce or won't fix?** Use status **Closed** and explain in **Notes**.
4. Missing features belong in the [product backlog](../01-requirements/backlog.md), not here. The [Known limitations](#known-limitations) section only summarizes the ones users are most likely to notice.

**Severity:** **High** = blocks a main workflow or affects security/data · **Medium** = wrong behavior with a workaround · **Low** = cosmetic or minor.

**Status:** **Open** · **In progress** · **Fixed** · **Closed**

## Bug log

| ID | Description | Area | Severity | Found on | Status | Fixed in | Retest (date · result · evidence) | Notes |
|---|---|---|---|---|---|---|---|---|
| BUG-01 | Mermaid syntax error stopped the booking sequence diagram from rendering | Docs / diagrams | Low | 2026-09-22 | Fixed | `f2cd893` | Not retested by QA (needs a rendered view of the diagram) | `.docs/02-design/diagrams/04-sequence-diagram-booking.md` |
| BUG-02 | Google sign-in failed when running the app on localhost | Auth | High | 2026-09-22 | Fixed | `655b663` | Not retested by QA (needs a real Google account on localhost). Profile creation part covered: 2026-11-17 · Pass · pgTAP `001` #2, #11 | Updated `authService.js` and added a migration backfilling profiles for existing Google users |
| BUG-03 | New Google users could be refused a profile because `email_confirmed_at` may not be set yet when the sign-up trigger runs | Auth / database | High | 2026-09-22 | Fixed | `b994e0d` | 2026-11-17 · **Pass** (local) · pgTAP `001` #2 "Google signup creates a Student profile before email confirmation is finalized" | Migration `20260922000500_fix_google_profile_creation.sql` checks the Google provider instead |
| BUG-04 | Users could book a PC on a past day, or at a time that had already passed today | Booking form / calendar | High | 2026-09-23 | Fixed | `8b9a03d`, `e2adeb3` | 2026-11-17 · **Pass** (local) · pgTAP `001` #29; Node test "does not offer past dates or a day with no remaining slot". Hosted: see BUG-06 | Frontend blocks past dates and elapsed slots; migration `20260923000100_enforce_future_booking_start.sql` also enforces it in the database |
| BUG-05 | "Supabase Preview" GitHub check fails on pushes to `main` with `column "student_id" does not exist` | Deployment / database migrations | Medium | 2026-09-23 | Open | — | Not retested by QA (needs hosted project access) | Migration `20260922000400_expand_role_capabilities.sql` tries to rename a column that is already renamed in the hosted database. Likely fix: `supabase migration repair --status applied 20260922000400` after checking `supabase migration list`, or make the rename conditional. The Vercel deployment is not affected |
| BUG-06 | The future-start database rule (BUG-04) has not been confirmed on the hosted Supabase project | Deployment | Medium | 2026-09-23 | Open | — | Not retested (blocked by BUG-05) | Blocked by BUG-05. Verify after the migration history is repaired |
| BUG-07 | A deactivated account is blocked by the React workspace and profile-write trigger, but its still-valid Supabase session can call RLS paths and RPCs that do not check `is_deactivated` | Auth / database authorization | High | 2026-09-26 | Open | — | 2026-11-17 · **Still fails** · `test/qa-retest.test.sql` QA-11 (deactivated account created a booking) and QA-12 (read the calendar); log `test/logs/2026-11-17-qa-retest.log` | Complete B28 and add direct API tests for Student, Technician, Advisor, and Dean |
| BUG-08 | Account-deletion copy may imply permanent removal after the 90-day recovery period, but no cleanup job deletes or pseudonymizes Auth/profile/history data | Privacy / account lifecycle | High | 2026-09-26 | Open | — | 2026-11-17 · **Still fails** · QA-13 found no cleanup function and no `pg_cron`; the English copy still says "let it be permanently removed" (`app/src/i18n/translations.js`) | Implement approved retention, booking disposition, session revocation, and cleanup under B38; keep UI/docs explicit that expiry is not erasure |
| BUG-09 | The repository contains two migration files with version `20260925000100`; the duplicate SQL is byte-identical, while its duplicate pgTAP file still asserts the obsolete 7-day recovery window | Database migrations/tests | **High** (raised from Medium on 2026-11-17) | 2026-10-28 | Open | — | 2026-11-17 · **Still fails, worse than logged** · a clean `supabase db reset` from the repository stops at the duplicate migration (`column "is_deactivated" ... already exists`); the duplicate test fails 2 of 14. Log `test/logs/2026-11-17-clean-reset-and-duplicate-test.log` | Before the next clean reset or hosted push, confirm migration history and remove the redundant ` 2.sql` migration/test files in a dedicated cleanup change. Severity raised because nobody can build the database from a clean checkout |
| BUG-10 | In **User Management**, changing a user's role in the dropdown saves immediately, with no confirmation or undo prompt | Dean administration UI | Medium | 2026-11-17 | Open | — | Found 2026-11-17 by QA heuristic review (`UserManagementPage.jsx`: `onChange` calls `setUserRole` directly) | A mis-click can promote or demote a real user. Partly limited by the database: an Advisor with unresolved requests cannot be demoted (pgTAP `003` #25), and the Dean cannot change their own role. Add a confirm dialog naming the user, old role and new role |

## Known limitations

These are features that are not built yet. Users may run into them, so they are listed here with a workaround.

| Limitation | Workaround | Backlog |
|---|---|---|
| A booking cannot be edited or moved to another PC/time | Cancel the eligible original booking, then submit a new request; if it is not cancellable, wait for the workflow decision | B14 |
| No email or in-app notifications for decisions | Check **My Bookings** or the request detail page | B17 |
| No limits on booking length or number of pending requests per user | Advisors and the Dean should reject unreasonable requests | B26 |
| Pages do not refresh automatically when someone else changes data | Reload the page to see the latest status | — |
| Any Google account can sign in, not only university accounts | Only use university accounts. Roles above Student are still controlled by the allowlist | B24 |
| Account deletion currently means soft deactivation, not erasure | Reactivate within 90 days or contact the system/privacy administrator | B28, B38 |

Other security gaps (MFA, user suspension, audit of role changes, security headers) are tracked in the [security review](../03-compliance/security-review.md) as backlog items B25–B33.

## Change history of this log

| Date | Change |
|---|---|
| 2026-09-23 | Log created with bugs found from the commit history and current CI status |
| 2026-09-26 | Added account-deactivation authorization and permanent-cleanup gaps; removed the obsolete cancellation limitation |
| 2026-10-28 | Aligned recovery-window and per-booking Advisor documentation; recorded the duplicated legacy migration/test files |
| 2026-11-16 | Re-audited documentation against the repository; reconfirmed BUG-09 and verified the 11 frontend tests, lint, and production build |
| 2026-11-17 | QA retest: added the Retest column; BUG-03 and BUG-04 pass locally; BUG-07, BUG-08 and BUG-09 still fail; BUG-09 raised to High (clean reset fails); added BUG-10 from the heuristic review |
