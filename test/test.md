# TEST — SE Lab PC Booking System

**Owner:** QA / Test · **Test run:** 17 Nov 2026, Asia/Bangkok · **Code under test:** branch `dev` at commit `a01f057`

This page is the index and report for the TEST part of the project. Every number on it comes from a command that was run on 17 Nov 2026, and each one links to its log in [`logs/`](logs/).

> **Real-user status:** no real-user sessions have been run yet. There are **no** session logs, SUS or TAM answers, and no real-user before/after timings. None of these were invented. The reason, what we tested instead, and a ready-to-run plan are in **[no-real-user-test.md](no-real-user-test.md)**.

## Contents

| Required item | Where | Status |
|---|---|---|
| Test Plan | [.docs/05-testing/test_plan.md](../.docs/05-testing/test_plan.md) ([PDF](../.docs/05-testing/test_plan.pdf)) | Done (written 28 Oct 2026) |
| Session logs of real users (U01, U02, …) | [no-real-user-test.md §6](no-real-user-test.md#6-ready-to-run-plan-for-real-users) (template) | **Not run yet** |
| Before / After numbers for every MUST task | [§3 below](#3-before--after-for-every-must-task) | Team-measured (repository), not user-measured |
| SUS / TAM responses and results | [data/sus_tam_responses.csv](data/sus_tam_responses.csv) + [score_sus_tam.py](score_sus_tam.py) | **No responses yet**; scorer ready and self-tested |
| Issue log: severity, fix commit, retest | [.docs/05-testing/known-issues.md](../.docs/05-testing/known-issues.md) | Updated 17 Nov 2026 with a Retest column |
| No real-user test report | [no-real-user-test.md](no-real-user-test.md) | Done |
| QA's own test cases | [qa-retest.test.sql](qa-retest.test.sql) | 13 cases, run 17 Nov 2026 |

## 1. Automated test results (17 Nov 2026)

| Check | Result | Command | Log |
|---|---|---|---|
| Database tests (pgTAP) | **147 / 147 pass** (106 + 14 + 27) | `npm run supabase:test` | [pgtap](logs/2026-11-17-pgtap.log) |
| Frontend unit tests | **11 / 11 pass** | `npm test --prefix app` | [frontend](logs/2026-11-17-frontend.log) |
| ESLint | 0 errors | `npm run lint --prefix app` | [frontend](logs/2026-11-17-frontend.log) |
| Production build | Builds; warning: 880 kB JavaScript chunk (over 500 kB) | `npm run build --prefix app` | [frontend](logs/2026-11-17-frontend.log) |
| Schema lint (public, private) | 0 errors | `npm run supabase:lint --prefix app` | [schema-lint](logs/2026-11-17-schema-lint.log) |
| QA test cases | **10 pass**, 3 known failures (open bugs, marked TODO) | see [§2](#2-qa-test-cases) | [qa-retest](logs/2026-11-17-qa-retest.log) |
| Clean database build from the repo | **Fails** at the duplicate migration (BUG-09) | `supabase db reset --local` | [clean-reset](logs/2026-11-17-clean-reset-and-duplicate-test.log) |
| Baseline: browser demo `516bb12` | 6 / 6 pass | `npm test` at commit `516bb12` | [baseline](logs/2026-11-17-baseline-516bb12.log) |

**Important condition:** the repository cannot build a clean database as it is (BUG-09). The duplicate file `20260925000100_add_account_deletion 2.sql` runs first, then the real migration fails with `column "is_deactivated" already exists`. To test the code anyway, QA ran the reset from a temporary copy of `supabase/` with the two duplicate files (`… 2.sql`) removed. Nothing else was changed. The duplicate test file was then run separately: it fails 2 of 14, because it still expects the old 7-day recovery window. **The 147/147 result applies to the repository after BUG-09 is fixed.**

## 2. QA test cases

[`qa-retest.test.sql`](qa-retest.test.sql) adds cases that the team suite does not name directly, plus retests of open bugs. Each assertion states the *correct* behaviour. Cases for open bugs are marked `TODO`, so they show as known failures.

| ID | Story / bug | Checks | Result |
|---|---|---|---|
| QA-01 | B4 | A Student can request a multi-day reservation | Pass |
| QA-02 | B4 | A multi-day reservation is stored as remote access | Pass |
| QA-03 | B4 | A 3-day reservation blocks three whole Bangkok days | Pass |
| QA-04 | B4 | A one-day session before 08:00 is rejected | Pass |
| QA-05 | B4 | A one-day session off the 15-minute grid is rejected | Pass |
| QA-06 | B9 | A lab session inside an active multi-day reservation is rejected | Pass |
| QA-07 | B9 | Only one active booking exists for that PC and day | Pass |
| QA-08 | B5 | The shared calendar does not return the booking purpose | Pass |
| QA-09 | B10 | Anonymous visitors cannot call the calendar function | Pass |
| QA-10 | B10 | Anonymous visitors cannot read the bookings table | Pass |
| QA-11 | BUG-07 / B28 | A deactivated account cannot create a booking | **Fail** (known): the booking was created |
| QA-12 | BUG-07 / B28 | A deactivated account cannot read the shared calendar | **Fail** (known): the calendar was returned |
| QA-13 | BUG-08 / B38 | A cleanup routine exists for expired accounts | **Fail** (known): no function and no `pg_cron` |

## 3. Before / After for every MUST task

**How this was measured:** by QA from the repository, not with users. **Before** is the browser demo at commit `516bb12` (15 Sep 2026). We read its code and re-ran its 6 tests. **After** is `dev` on 17 Nov 2026, measured by the test assertions listed. The numbers are counts of passing checks and of where a rule is enforced. They are **not** task times or error rates from people. Those need the real-user study ([no-real-user-test.md §6](no-real-user-test.md#6-ready-to-run-plan-for-real-users)).

In the Before column, "browser only" means the rule ran in the user's own browser, on data in that browser's `localStorage`. Another user could not see the data, and anyone could bypass the rule.

### Summary

| | Before (`516bb12`) | After (`dev`, 17 Nov) |
|---|---|---|
| MUST stories in the backlog | 30 | 30 |
| MUST stories with passing automated evidence | 0 enforced on a server (6 browser-only tests) | **18 of 18 "Done" stories** |
| Implemented but failing a QA retest | — | 1 (B37, blocked by BUG-07) |
| Need hosted configuration (not testable locally) | — | 2 (B1, B31) |
| Planned, not built | — | 9 (B24–B30, B33, B38) |
| Automated checks passing | 6 | 147 database + 11 frontend + 10 QA |

### Per MUST story

| Story | Task | Before (`516bb12`) | After (`dev`) | Evidence (all pass unless stated) |
|---|---|---|---|---|
| B1 | Sign in with Google | No sign-in: user clicked a role button (`demoUsers`) | Google OAuth; profile created as Student by trigger | pgTAP 001 #1, #2, #8–#14. Hosted Google setup **not tested** (configuration) |
| B2 | Week/day availability for all PCs | Calendar showed only bookings stored in this browser | Shared calendar from the database for every user | Node "maps sanitized calendar rows…"; pgTAP 001 #35 |
| B3 | Book only a future start | **No past-time check** (BUG-04 existed) | Blocked in the form and by the database | pgTAP 001 #29; Node "does not offer past dates…" |
| B4 | One-day lab or multi-day remote | Lab hours and multi-day checked in browser only | Enforced in the database, plus 15-minute grid and remote mode | QA-01 to QA-05 |
| B5 | Occupancy without others' identity/purpose | Not applicable: no other users' data | Calendar omits name, ID and purpose | pgTAP 001 #34–#36; QA-08; Node calendar mapping |
| B6 | Student sees status and rejection reason | Status in a browser-only record | Stored status plus a 5-step progress tracker | pgTAP 001 #31, #47, #52, #57 (status); #68, #70 (rejection reason required, request closed) |
| B7 | Advisor reviews only selected, Technician-approved requests | Any user in the Advisor role could approve, in the browser | Only the selected Advisor, only after Technician | pgTAP 001 #39, #40, #44, #50–#53; 003 #21, #24 |
| B8 | Dean decides only after Advisor | Browser status check only | Database blocks bypass | pgTAP 001 #41, #43, #54–#57 |
| B9 | Overlapping bookings cannot both succeed | Overlap check only within one browser's storage: **two browsers could double-book** | PostgreSQL exclusion constraint | pgTAP 001 #32; 003 #16; QA-06, QA-07 |
| B10 | Signed-out visitors read nothing | No sign-in existed, so anyone could open every page | Anonymous access denied | pgTAP 001 #16–#19; 003 #1; QA-09, QA-10 |
| B11 | Booking detail fits the role | Any role could open any booking | Row-level security per role | pgTAP 001 #34, #36, #39, #41; 003 #15, #17, #23 |
| B12 | Every decision creates an audit event | Decision time saved in the browser; could be edited | Database audit events | pgTAP 001 #48, #49, #53, #58, #71 |
| B20 | Advisor booking goes to the Dean | Not available (Students only) | Advisor request starts at Dean review | pgTAP 001 #89–#91, #93 |
| B21 | Dean books immediately | Not available | Approved immediately after checks | pgTAP 001 #97, #98 |
| B22 | Student selects an active Advisor per booking | Not available | Required and validated per booking | pgTAP 001 #30, #38, #72–#74; 003 #4–#13 |
| B23 | Dean manages roles | Not available | Dean-only RPC | pgTAP 001 #42, #105, #106; 003 #25, #26. UX issue: BUG-10 |
| B34 | Technician first review | **No Technician stage** (requests began at Advisor) | Technician reviews Student requests first | pgTAP 001 #45–#49 |
| B35 | Technician booking skips technical review | Not available | Starts at Advisor review | pgTAP 001 #82–#84, #88, #92 |
| B36 | Advisor attribution kept on bookings | Not available | Stored per booking | pgTAP 001 #73, #74; 003 #13 |
| B37 | Deactivate own account, reactivate within 90 days | Not available | Works in the app and database | pgTAP 002 #1–#14 pass. **Fails** QA-11, QA-12 (BUG-07) |
| B31 | Only Google enabled, no drift | — | Hosted setting | **Not tested** (needs hosted access) |
| B24–B30, B33, B38 | Domain gate, MFA, limits, trusted ID, suspension, audit of admin actions, CSP, race-safe status, cleanup | — | Not built | Not tested. Release blockers in the [security review](../.docs/03-compliance/security-review.md) |

## 4. Issue log and retest

The issue log stays in one place: [.docs/05-testing/known-issues.md](../.docs/05-testing/known-issues.md). On 17 Nov 2026 QA added a **Retest** column and retested every bug.

| Bug | Severity | Fix commit | Retest 17 Nov 2026 |
|---|---|---|---|
| BUG-01 | Low | `f2cd893` | Not retested (needs a rendered view of the diagram) |
| BUG-02 | High | `655b663` | Not retested (needs a real Google account); profile part passes |
| BUG-03 | High | `b994e0d` | **Pass** (pgTAP 001 #2) |
| BUG-04 | High | `8b9a03d`, `e2adeb3` | **Pass** locally (pgTAP 001 #29 + Node); hosted still unconfirmed (BUG-06) |
| BUG-05 | Medium | — (open) | Not retested (needs hosted access) |
| BUG-06 | Medium | — (open) | Not retested (blocked by BUG-05) |
| BUG-07 | High | — (open) | **Still fails** (QA-11, QA-12) |
| BUG-08 | High | — (open) | **Still fails** (QA-13; the "permanently removed" text is still in the UI) |
| BUG-09 | **High** (was Medium) | — (open) | **Still fails, worse**: a clean reset from the repo fails |
| BUG-10 (new) | Medium | — (open) | Found today: role changes save with no confirmation |

**Result: 2 fixed bugs confirmed, 3 open bugs reproduced, 1 new bug, 4 not retestable without Google or hosted access.**

## 5. Heuristic review (summary)

QA reviewed the main screens against Nielsen's 10 usability heuristics, using the code and the running sign-in page. Full table: [no-real-user-test.md §3](no-real-user-test.md#3-heuristic-review).

## 6. How to repeat these tests

```bash
# Frontend
npm test --prefix app && npm run lint --prefix app && npm run build --prefix app

# Database (local Supabase in Docker). Until BUG-09 is fixed, first remove the two
# duplicate "… 2.sql" files in a scratch copy of supabase/ and reset from that copy.
npm run supabase:reset --prefix app
npm run supabase:test --prefix app
npm run supabase:lint --prefix app

# QA cases (rolled back, safe to repeat)
docker exec -i supabase_db_SE-Lab-Booking-System psql -U postgres -d postgres -qAt < test/qa-retest.test.sql

# SUS / TAM scoring (after real responses are entered in test/data/sus_tam_responses.csv)
python3 test/score_sus_tam.py
```

## AI disclosure for this page

QA prepared this report with Claude Code (Opus 5.5). Claude ran the commands above on QA's machine on 17 Nov 2026, wrote `qa-retest.test.sql` and `score_sus_tam.py`, and drafted these pages. QA reviewed the results and owns them. No participant, response or timing was generated.
