# No real-user test — SE Lab PC Booking System

**Owner:** QA / Test · **Date:** 17 Nov 2026 · Main test report: [test.md](test.md)

No real users have tested the finished system yet. This page explains why, what we tested instead, what that does and does not prove, and how to run the real-user study.

Labels used on this page:

- **REAL**: a real target user (codes U01, U02, …). None yet.
- **PROXY**: a person outside the team standing in for a user (codes P01, P02, …). None yet.
- **TEAM**: measured by the team from code and tests.
- **SECONDARY**: published material written by others, with a link.

## 1. Why there was no real-user test

These blockers are recorded in the repository:

1. **The live database cannot yet be trusted for real people's data.** The hosted migration history is broken (BUG-05), so the past-booking rule is not confirmed on the hosted database (BUG-06). From a clean checkout, the database does not build at all (BUG-09).
2. **Privacy blockers are open for real accounts.** A deactivated account can still create bookings and read the calendar (BUG-07, retested 17 Nov). Nothing deletes expired accounts (BUG-08). Per [rule.md](../.docs/03-compliance/rule.md), the data-retention schedule is still "Policy pending". Bringing real Students into the system before these are fixed would put their data at risk.
3. **The study is large.** The [test plan](../.docs/05-testing/test_plan.md) (§10.1) needs at least 10 sessions of 35–50 minutes, each with consent, a manual "before" condition and a system "after" condition.
4. **[Team to add any other reason here, in your own words — e.g. schedule. Delete this line if there is none.]**

## 2. What we tested instead

| Method | Label | What was done | Result |
|---|---|---|---|
| Our own automated tests | TEAM | 147 pgTAP database assertions, 11 frontend unit tests, ESLint, build and schema lint, run 17 Nov 2026 | All pass (after removing the BUG-09 duplicates in a scratch copy). [test.md §1](test.md#1-automated-test-results-17-nov-2026) |
| QA's own test cases | TEAM | 13 cases in [qa-retest.test.sql](qa-retest.test.sql): multi-day rules, overlap across access modes, calendar privacy, anonymous access, open-bug retests | 10 pass, 3 known failures (BUG-07 ×2, BUG-08) |
| Bug retest | TEAM | Every logged bug retested; Retest column added to the [issue log](../.docs/05-testing/known-issues.md) | 2 fixes confirmed, 3 bugs still open, 1 new bug (BUG-10) |
| Heuristic review | TEAM | Nielsen's 10 usability heuristics, applied to the code and the running sign-in page | 10 heuristics checked, 8 with a problem (§3) |
| Before / after | TEAM | Old browser demo `516bb12` compared with `dev`, for every MUST story | [test.md §3](test.md#3-before--after-for-every-must-task) |
| Proxy users | PROXY | **Not run.** Plan in §6 (same protocol, codes P01…) | — |
| Secondary evidence | SECONDARY | Method references only (below). No secondary evidence about the problem itself was collected | — |

### Secondary references (methods only)

| Source | Label | Used for | What it does **not** prove |
|---|---|---|---|
| Nielsen Norman Group, *10 Usability Heuristics for User Interface Design*: <https://www.nngroup.com/articles/ten-usability-heuristics/> | SECONDARY | The checklist for the heuristic review in §3 | That real users have these problems, or how often |
| MeasuringU (J. Sauro), *Measuring Usability with the System Usability Scale (SUS)*: <https://measuringu.com/sus/> | SECONDARY | Why 68 is the published average SUS score, and why our target is 70 | Anything about this system's actual score. We have no SUS responses |

## 3. Heuristic review

**Reviewer:** QA. **Date:** 17 Nov 2026. **Evidence:** the code on `dev` at `a01f057` and the running sign-in page. **Severity scale:** 0 = not a problem, 1 = cosmetic, 2 = minor, 3 = major, 4 = catastrophic.

A heuristic review finds likely problems. It does not show how often real users hit them.

| # | Heuristic | Finding | Evidence | Severity |
|---|---|---|---|---|
| 1 | Visibility of system status | **Good:** each booking shows a 5-step progress tracker (submitted → Technician → Advisor → Dean → final). **Problem:** no notifications, and pages don't refresh by themselves, so users must keep checking. | `BookingDetailPage.jsx` `ProgressStep`; known limitations B17 and "no auto-refresh" | 2 |
| 2 | Match with the real world | The account screen says the account may be "permanently removed", but nothing removes it. It is only deactivated. | `translations.js` (account deletion text); BUG-08 | 3 |
| 3 | User control and freedom | In User Management, choosing a new role in the dropdown saves at once, with no confirmation and no undo. | `UserManagementPage.jsx` `onChange` → `setUserRole`; **BUG-10** | 2 |
| 4 | Consistency and standards | **Good:** one shared dropdown and input style across the app, and the same status badges everywhere. | `components/ui/FormFields.jsx`, `StatusBadge.jsx` | 0 |
| 5 | Error prevention | **Good:** past dates and used-up slots are not offered, times snap to 15 minutes, maintenance PCs can't be chosen, a reason is required to reject or cancel. **Problem:** the role dropdown (see #3). | Node tests; pgTAP; QA-04, QA-05; `BookingDetailPage.jsx` reason check | 2 |
| 6 | Recognition rather than recall | **Good:** choosing a free slot on the calendar opens the booking form with the PC, date and times already filled. | `BookingFormPage.jsx` reads `pc`, `date`, `start`, `end` from the URL | 0 |
| 7 | Flexibility and efficiency | **Good:** search and role filter in User Management. **Problem:** a booking can't be edited, only cancelled and booked again. | `UserManagementPage.jsx`; known limitation B14 | 1 |
| 8 | Aesthetic and minimal design | **Good:** the shared calendar shows only PC, time, mode and status. **Problem:** the first page load downloads an 880 kB JavaScript file. | QA-08; build log (chunk-size warning) | 1 |
| 9 | Help users recognise and recover from errors | Booking and approval errors show the database's English text directly, even when the app is in Thai. Only the Profile page translates its errors. | `BookingFormPage.jsx` `setError('root.server', { message: error.message })`; `ProfilePage.jsx` error map; security review L2 | 2 |
| 10 | Help and documentation | No help or FAQ inside the app. A user manual exists only in the repository. | No help page in `app/src`; [user-manual.md](../.docs/04-user-guide/user-manual.md) | 2 |

**Top three to fix before real users:** #2 (misleading deletion text), #3 (role change without confirmation), #9 (English-only errors in Thai mode).

## 4. Before / after measured by the team

The full table, with every MUST story, is in [test.md §3](test.md#3-before--after-for-every-must-task). In short, comparing the old browser demo `516bb12` with `dev` on 17 Nov 2026 (TEAM):

| Measure | Before | After |
|---|---|---|
| MUST stories with passing automated evidence | 0 enforced on a server | 18 of 18 "Done" stories |
| Automated checks passing | 6 (browser only) | 147 database + 11 frontend + 10 QA |
| Can two different users book the same PC and time? | **Yes**: the check only saw one browser's data | **No**: rejected by PostgreSQL (pgTAP 001 #32, QA-06) |
| Can a booking start in the past? | **Yes**: no check existed | **No**: blocked in the form and the database (pgTAP 001 #29) |
| Can a signed-out visitor see bookings? | No sign-in existed | **No**: denied (pgTAP 001 #16–#19, QA-09, QA-10) |

These are facts about the software, measured by tests. They are **not** user task times or error rates.

## 5. What this does and does not prove

**It proves:**

- The database enforces the booking rules, the role workflow, privacy and anonymous denial. 147 + 10 automated checks pass.
- The system is much safer than the old browser demo: double booking and past bookings are now impossible.
- Three open defects are real and reproducible (BUG-07, BUG-08, BUG-09).

**It does not prove:**

- That Students find the system easy, fast or useful. There is no SUS, no TAM and no timing data.
- That the system is faster than the manual process. No real-user before/after was measured.
- That staff (Technician, Advisor, Dean) accept the approval workflow. The interviews in September covered Students only.
- That the hosted (live) deployment behaves like the local database (BUG-05, BUG-06).

## 6. Ready-to-run plan for real users

This uses the existing [test plan](../.docs/05-testing/test_plan.md) §10–§13 and adds what is needed to start.

### 6.1 Before the first session

- [ ] Fix BUG-09 (remove the duplicate files) and BUG-05 (repair hosted migration history), then confirm BUG-06 on the hosted site.
- [ ] Fix or switch off account deactivation for the study (BUG-07), and fix the deletion text (BUG-08 / heuristic #2).
- [ ] Prepare accounts: one Student account per participant, plus one Technician, one Advisor and one Dean run by the team.
- [ ] Prepare the "before" materials: a printed availability sheet and a paper request form (test plan §10.1).
- [ ] Print the consent form and the SUS and TAM sheets (test plan §12 and §13).

### 6.2 Participants

- **REAL:** at least 10 Students who use, or could use, the SE lab (test plan §10.1). Codes **U01–U10**. Staff sessions are optional extras.
- **PROXY (if real users can't be booked in time):** 3–5 students **outside the team** who don't use the SE lab. Codes **P01–P05**. Always report them separately and label them PROXY.
- **Privacy:** record only the code. Write no names, emails, Student IDs or faces into the repository. Keep consent forms on paper or in a private university drive, never in this public repo. Do not paste participant data into any AI tool (see [AI_DISCLOSURE.md](../AI_DISCLOSURE.md)).

### 6.3 Each session (35–50 minutes)

1. Consent; explain that we test the system, not the person.
2. **Before (manual):** the participant does UAT-01 to UAT-05 with the paper sheet and form.
3. **After (system):** the participant does the same tasks in the app.
4. Fill in the SUS (10 items) and TAM (10 items) sheets.
5. Short exit interview (test plan §13.6).

| Task | Instruction (test plan §10.2) | Measure |
|---|---|---|
| UAT-01 | Find an available PC for a given future date and time | Time, correct PC, navigation errors |
| UAT-02 | Submit a one-day request and select the given Advisor | Completion, field errors, confidence |
| UAT-03 | Find the request and explain its current and next approval stage | Correct explanation |
| UAT-04 | Find another PC or time when the first choice is taken | Time, recovery |
| UAT-05 | Cancel an eligible request and check that the slot is free again | Completion, correct booking cancelled |

### 6.4 Session log template

Copy one table per session into `test/sessions/U01.md`, `U02.md`, and so on (or `P01.md` for PROXY).

| Field | Value |
|---|---|
| Code | U01 |
| Cohort | REAL / PROXY |
| Date and place | |
| Role tested | Student |
| Device and browser | |
| Consent recorded (off-repo) | Yes / No |

| Task | Condition | Start | End | Time (s) | Outcome (independent / assisted / failed) | Errors | Critical error? | Confidence (1–5) | Neutral observation |
|---|---|---|---|---|---|---|---|---|---|
| UAT-01 | Before | | | | | | | | |
| UAT-01 | After | | | | | | | | |
| … | | | | | | | | | |

### 6.5 Results

- Enter the SUS and TAM answers in [data/sus_tam_responses.csv](data/sus_tam_responses.csv), one row per session, with cohort `REAL` or `PROXY`.
- Run `python3 test/score_sus_tam.py`. It prints each participant's SUS and TAM scores and the medians against the targets (SUS ≥ 70; PU, PEOU and BI ≥ 5.0), with REAL and PROXY kept apart. Check the formulas any time with `--selftest`.
- Compute time improvement, completion rate and critical-error rate with the formulas in test plan §11. Report medians and ranges, and don't generalise from 10 people.
- Add the real numbers to [test.md](test.md) §3 and to `.docs/final/comparison-table.md`, each with its session codes as evidence.

### 6.6 Pass criteria (test plan §10.3)

At least 10 valid sessions · no private data shown to another user · at least 8 of 10 complete each task independently · the system is faster than paper in at least 3 of 4 timed tasks · median SUS ≥ 70 · TAM targets met · all critical automated tests pass.
