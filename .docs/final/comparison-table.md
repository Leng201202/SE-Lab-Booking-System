# Before / After comparison

**Before** = the browser-only demo at commit `516bb12` (15 Sep 2026: mock users, `localStorage`, no database), or the manual/paper process where stated.
**After** = current `main` at `8a51bb1` (17 Nov 2026), live at <https://se-lab-booking-system.vercel.app/>.

Every number can be reproduced with [evidence/measure.sh](evidence/measure.sh) or the commands in the *Measured with* column. "Not measured" means we have no data and do not guess.

## Engineering measures

| Item | Before | After | Change | Measured with | Evidence |
|---|---|---|---|---|---|
| Frontend unit tests passing | 6 / 6 | 11 / 11 | +5 tests, 100% pass in both | `node --test` at `516bb12`; `npm test --prefix app` on `main` | [baseline log](evidence/frontend-tests-baseline-516bb12.log), [current log](evidence/frontend-tests-current.log) |
| Database (pgTAP) assertions defined | 0 | 147 (106 + 14 + 27) | +147 | `select plan(...)` in `supabase/tests/database/001–003` | [measure-log.txt](evidence/measure-log.txt) |
| Database assertions passing | — (no database) | Not measured (suite not rerun; local Supabase could not start) | Unknown | `npm run supabase:test --prefix app` (pending) | Limitation noted in [ai-logic.md](ai-logic.md#3-prove) |
| Overlap protection for the same PC and time | Client-side check only | 1 PostgreSQL GiST exclusion constraint (`bookings_no_active_overlap`) | Conflicts now rejected by the database, including concurrent requests | `grep bookings_no_active_overlap supabase/migrations` | `20260922000100_initial_production_backend.sql`; live two-tab demo |
| Controlled server operations (RPCs) | 0 (`localStorage`) | 12 distinct RPCs | +12 | `grep -rhoE "\.rpc\('…" app/src \| sort -u` | [measure-log.txt](evidence/measure-log.txt) |
| Identity | Mock users in the browser | Google OAuth via Supabase Auth | Browser can no longer choose its own identity or role | Code review | `app/src/features/auth/authService.js` |
| Data access control | None | Row Level Security on all 4 `public` tables (`profiles`, `pcs`, `bookings`, `approval_events`) | Signed-out visitors denied; other Students' identity/purpose hidden | pgTAP suite (defined) | `001_booking_security.test.sql` |
| Lint / production build | — | Lint clean; build passes (1 bundle-size warning) | — | `npm run lint`, `npm run build` | [current log](evidence/frontend-tests-current.log) |

## MUST user tasks

The Before column describes the manual process from the [proposal](../01-requirements/proposal.md) and [interviews](../01-requirements/user-research.md). **No real-user timing sessions have been run**, so time, completion rate and error rate are *Not measured* for every task.

| Item (MUST task) | Before | After | Change | Measured with | Evidence |
|---|---|---|---|---|---|
| B2/B5 — See if a PC is free (incl. remote use) | Check in person; remote use invisible (interviews #1, #2, #5) | Week + 15-min timeline calendar with status and access mode | Remote use now visible. Time: Not measured | Live demo; user sessions pending | `CalendarPage.jsx`, `get_booking_calendar` |
| B3/B4/B22 — Request a PC | Paper/manual request | Online form: one-day lab or multi-day remote, Advisor selected, future-only | Online. Time: Not measured | Live demo; 11 unit tests cover date and Advisor rules | `BookingFormPage.jsx`, `create_booking` |
| B9 — No double booking | Not prevented (interviews #3, #4) | Database rejects the overlap | Prevented in the database | Two-tab live demo; pgTAP (defined) | exclusion constraint |
| B6/B12 — Track status | Hard to follow on paper | Status per stage, rejection reason, approval history | Visible. Time: Not measured | Live demo | `MyBookingsPage.jsx`, approval events |
| B7/B8/B34 — Review a request | Paper sign-off | Technician → Advisor → Dean queues; each acts only at its stage | Enforced by RPC. Time: Not measured | pgTAP workflow tests (defined) | `approve_booking` |
| B1/B10 — Sign in / stay protected | No sign-in | Google sign-in; anonymous access denied | Added | pgTAP (defined); live sign-out demo | `authService.js`, RLS |

## AI row

| Item | Before | After | Change | Measured with | Evidence |
|---|---|---|---|---|---|
| **AI-assisted development** | No AI rules, agents or skills (baseline `516bb12` has none) | 7 of 65 commits carry a `Co-Authored-By: Claude` trailer; 3 reusable AI workflows (2 agents + 1 skill); `CLAUDE.md` rules; 2 AI-assisted diagrams | +7 disclosed AI commits; +3 workflows. Time saved: **Not measured** (no controlled comparison) | `git log --all -i --grep='Co-Authored-By: Claude'`; `git rev-list --all --count` | [measure-log.txt](evidence/measure-log.txt), [ai-logic.md](ai-logic.md), `b4614f4` |
| **AI inside the product** | 0 | 0 | None — the running system has no AI feature | Search of `app/` and `supabase/` for AI libraries/APIs | [AI_DISCLOSURE.md](../../AI_DISCLOSURE.md) |

## What this table does not prove

- It does not show that users book faster or make fewer mistakes. That needs real-user sessions (test plan on branch `test/test-plan`, §10–13).
- 147 database assertions are written, not yet re-verified as passing.
- Commit trailers measure disclosure, not how much code AI wrote or its quality.
