# SE Lab PC Booking System Test Plan

## 1. Document Control

| Item | Value |
|---|---|
| Project | SE Lab PC Booking System |
| System under test | `app/` React/Vite application and `supabase/` backend |
| Plan owner | SE Lab Booking project team |
| Primary users | Students, Technicians, Advisors, and the Dean |
| Required user study | At least 10 real-user sessions |
| Acceptance model | Technology Acceptance Model (TAM) only |
| Related backlog | B1–B38 in `.docs/01-requirements/backlog.md` |
| Target branch | `test/test-plan` |
| Primary timezone | Asia/Bangkok (UTC+7) |
| Last reviewed | 2026-10-28 |

This plan is based on the current repository, including the README,
implementation plan, requirements, backlog, design documentation, React
application, Supabase migrations, database policies, RPC functions, seed data,
and automated tests. It is a test plan, not a claim that every test has already
been executed in the hosted environment.

## 2. System Description

The SE Lab PC Booking System lets authenticated university users inspect PC
availability and request a computer in the Software Engineering laboratory at
Mae Fah Luang University. It supports one-day in-lab use and continuous
multi-day remote reservations.

```text
Student request → Technician review → selected Advisor review → Dean review → Approved
Technician request → Advisor review → Dean review → Approved
Advisor request → Dean review → Approved
Dean request → Immediate approval after validation
```

The current implementation includes:

- React 19, Vite 8, React Router 7, and Tailwind CSS 4.
- Google OAuth through Supabase Auth.
- Trusted Student, Technician, Advisor, and Dean roles.
- PostgreSQL profiles, PCs, bookings, and approval events.
- Explicit grants, Row Level Security, and protected RPC functions.
- Per-booking Advisor selection for Student requests.
- Role-specific booking creation and approval routes.
- Week and day PC-availability views.
- One-day bookings from 08:00–18:00 in 15-minute intervals.
- Multi-day remote bookings over complete inclusive date ranges.
- Database-enforced active-booking conflict prevention.
- Requester cancellation with a required reason.
- Technician/Dean PC management and Dean user-role management.
- Student ID extraction from Lamduan email or guarded manual entry.
- Account soft deactivation with a 90-day recovery window.
- English and Thai interface content.

Editing/rebooking, recurring bookings, automatic completion, notifications,
check-in/no-show handling, and automatic permanent account deletion are not
implemented in the current release.

## 3. Test Objectives

The test programme will determine whether the system:

1. Allows authenticated users to view reliable PC availability.
2. Requires a Student to select an eligible active Advisor before booking.
3. Stores the selected Advisor on each booking rather than permanently on the
   Student profile.
4. Routes each requester role through the correct approval stages.
5. Rejects past, invalid, unavailable, and conflicting reservations.
6. Preserves booking, decision, rejection, and cancellation information.
7. Enforces authentication, role boundaries, ownership, and privacy at the
   database boundary.
8. Supports PC administration, role management, and account recovery.
9. Remains usable on desktop and mobile in English and Thai.
10. Produces usability and acceptance evidence through SUS and TAM.

## 4. Scope

### 4.1 In scope

- Google sign-in, callback, session restoration, sign-out, and default Student
  profile creation.
- Profile identity, role, automatic Lamduan Student ID, and guarded manual ID.
- Active Advisor listing, required Student selection, validation, storage, and
  independent per-booking attribution.
- PC inventory, operational state, calendar, booking history, and details.
- One-day lab and multi-day remote reservations.
- Bangkok date/time, 15-minute interval, purpose, PC-state, and overlap rules.
- Student, Technician, Advisor, and Dean booking paths.
- Approval, rejection, reasons, wrong-stage denial, and approval history.
- Cancellation of the requester's own active future booking.
- Technician/Dean PC management and Dean role management.
- Soft deactivation, restricted recovery screen, and recovery within 90 days.
- Loading, empty, retry, success, and failure states.
- Responsive layout, keyboard basics, English/Thai wording, and privacy.
- Local migration rebuild, pgTAP, schema lint, frontend tests, lint, and build.

### 4.2 Out of scope for this release

- Editing or rebooking an existing request.
- Recurring bookings.
- Email or durable in-app notifications.
- Automatic completion, check-in/check-out, and no-show processing.
- Usage analytics and reporting.
- Automatic permanent deletion or pseudonymization.
- Unapproved policy features such as quotas, maximum advance windows, and MFA.

## 5. Implementation Status, Planned Features and Assumptions

### 5.1 Implemented features to verify

The implemented backlog covers Google OAuth (B1, with deployment configuration),
availability (B2), future booking creation (B3), lab/remote modes (B4), private
occupancy (B5), status and reasons (B6), staged review (B7, B8, B34), conflict
prevention (B9), anonymous denial (B10), details (B11), decision audit (B12),
cancellation (B13), feedback (B15), PC management (B16), role-specific request
paths (B20, B21, B35), per-booking Advisor selection (B22), Dean role management
(B23), preserved Advisor attribution (B36), and account recovery (B37).

“Implemented” means code and focused checks exist. System, staging, and user
evidence are still required before acceptance.

### 5.2 Planned or deferred features

Rebooking (B14), notifications (B17), configurable limits (B18/B26), recurring
reservations (B19), institutional-domain enforcement (B24), MFA (B25), verified
manual Student IDs (B27), complete session offboarding (B28), management audit
(B29), browser headers (B30), hosted Auth drift control (B31), additional data
minimization (B32), PC-status concurrency hardening (B33), and permanent
deletion/pseudonymization (B38) remain planned, deployment-dependent, or
policy-dependent in this repository state.

### 5.3 Test assumptions

1. Testing uses synthetic users and bookings, not real Student records.
2. Node.js, npm, Docker, and Supabase CLI dependencies are available.
3. OAuth tests use test-only Google identities and approved callbacks.
4. Asia/Bangkok is authoritative for date/time rules.
5. At least two active Advisor fixtures exist.
6. Each participant receives an isolated or reset test account.
7. Participants never provide real Student IDs, passwords, or booking purposes.
8. TAM is the only acceptance model; SUS is a usability scale.

## 6. Test Environment and Data

### 6.1 Environments

| Environment | Purpose | Data policy |
|---|---|---|
| Local development | Frontend checks, clean rebuild, pgTAP, and diagnosis | Synthetic fixtures only |
| Staging Supabase/Vercel | OAuth, migration, browser, API, and role workflows | Isolated test accounts and bookings |
| User-study environment | At least ten observed sessions | One isolated account per participant |
| Production smoke environment | Non-destructive OAuth and route checks | Approved test accounts; no reset or bulk seed |

### 6.2 Required fixtures

- Student A and Student B with valid Student IDs.
- Student without a Student ID.
- Technician, Advisor Alpha, Advisor Beta, and Dean.
- Deactivated Advisor and users inside/outside the recovery window.
- Available, Maintenance, and Inactive PCs.
- Pending Technician, Pending Advisor, Pending Dean, Approved, Rejected,
  Cancelled, and Completed bookings.
- One-day and multi-day bookings.
- Overlapping intervals for conflict/concurrency testing.
- Controlled invalid Advisor, date, time, purpose, session, and network cases.

### 6.3 Data protection controls

- Obtain consent before each user-study session.
- Identify participants as P01–P10 rather than by name.
- Use test Google accounts and synthetic Student IDs.
- Do not collect real passwords, purposes, or university records.
- Record sessions only with separate consent.
- Store study exports in an access-controlled location.
- Delete fixtures according to the approved test-data retention period.
- Never expose OAuth secrets, Supabase secret keys, database passwords, or
  participant data in source control, screenshots, or logs.

## 7. Test Levels and Methods

### 7.1 Static and code-quality verification

Run from the repository root:

```bash
npm run lint --prefix app
npm test --prefix app
npm run build --prefix app
git diff --check
```

Record the command, date, commit, result, and warnings. The frontend suite has
11 Node tests for mapping, Bangkok dates, time slots, conflict/cancellation
rules, and Advisor RPC parameters.

### 7.2 Unit and component testing

Current unit coverage includes active-status conflicts, database-to-frontend
mapping, sanitized calendar rows, Bangkok date boundaries, next bookable slot,
past-date behavior, cancellation eligibility, selected Advisor parameters, and
Advisor-list mapping.

Additional coverage should target form validation, empty/retry states,
role-aware navigation, account recovery, and translation-key parity.

### 7.3 Database and integration testing

```bash
npm run supabase:start --prefix app
npm run supabase:reset --prefix app
npm run supabase:test --prefix app
npm run supabase:lint --prefix app
npm run supabase:stop --prefix app
```

Canonical database tests:

- `001_booking_security.test.sql` — 106 assertions.
- `002_account_deletion.test.sql` — 14 assertions.
- `003_booking_advisor_selection.test.sql` — 27 assertions.

The intended canonical total is 147. Duplicate files containing ` 2.sql` are a
known repository issue and are not an additional canonical suite.

### 7.4 System and end-to-end testing

```text
Google sign-in → profile/Student ID → availability → PC/date/time →
selected Advisor → submit → Technician → selected Advisor → Dean →
final status → cancellation when eligible
```

Separate paths cover Technician, Advisor, and Dean requests, reviewer queues,
role management, and PC management.

### 7.5 Security and authorization testing

Test anonymous, expired-session, cross-user, wrong-role, wrong-stage,
non-selected Advisor, protected-column, direct-mutation, deactivated-account,
and calendar-privacy cases. Requester identity must come from the authenticated
session rather than client input.

### 7.6 Usability and acceptance testing

Conduct the study in Section 10 and collect completion, task time, errors,
assistance, observations, SUS, and TAM.

## 8. Functional Test Cases

| ID | Area | Preconditions | Test steps | Expected result |
|---|---|---|---|---|
| AUTH-01 | New Google sign-in | Identity has no profile | Sign in and complete callback | Student profile is created and dashboard opens |
| AUTH-02 | Existing sign-in | Active profile exists | Sign in with same account | Correct role/workspace opens |
| AUTH-03 | Session restoration | Valid session exists | Reload application | Workspace restores without another login |
| AUTH-04 | Sign-out | User is authenticated | Select Sign out | Session clears and login page opens |
| AUTH-05 | Protected route | No session | Open `/dashboard` or `/book` | Redirect to login; no application data |
| AUTH-06 | Default role | New Google user | Complete first sign-in | User receives Student role only |
| PROF-01 | Lamduan ID | New `10digits@lamduan.mfu.ac.th` Student | Sign in and open Profile | ID derives from email local part |
| PROF-02 | Locked Lamduan ID | Derived ID exists | Save a different ID | Update rejected; derived value remains |
| PROF-03 | Manual ID | Non-Lamduan Student has no ID | Save unused 10-digit value | ID persists after reload |
| PROF-04 | Invalid ID | Student profile is open | Submit malformed/duplicate value | Error appears; profile unchanged |
| ADV-01 | Advisor list | Student opens booking form | Load dropdown | Only active Advisors appear |
| ADV-02 | Required Advisor | Other fields complete | Submit without Advisor | Submission blocked with validation |
| ADV-03 | Ineligible Advisor | Invalid/non-Advisor/deactivated ID supplied | Submit | Request rejected; no booking |
| ADV-04 | Valid selection | Active Advisor Alpha selected | Submit valid request | Booking stores Alpha and is Pending Technician |
| ADV-05 | Per-booking choice | Two requests created | Select Alpha then Beta | Each booking keeps its own Advisor |
| ADV-06 | Load failure | Advisor request fails | Open form and retry | Error/retry shown; submit disabled until loaded |
| ADV-07 | No Advisors | No active Advisor exists | Open form | Empty guidance; Student cannot submit |
| BOOK-01 | Valid lab booking | Student ID and Advisor exist | Choose free future PC, 09:00–10:00, valid purpose | Lab booking created Pending Technician |
| BOOK-02 | Missing ID | Student has no ID | Attempt booking | User must add ID; no booking |
| BOOK-03 | Past date | Form open | Select date before Bangkok today | Date rejected |
| BOOK-04 | Elapsed slot | Booking today | Select elapsed time | Slot unavailable/rejected |
| BOOK-05 | Time interval | Form open | Enter non-15-minute time | Validation rejects request |
| BOOK-06 | Lab hours | Form open | Use time outside 08:00–18:00 | Validation rejects request |
| BOOK-07 | Time order | Form open | End at/before start | Validation rejects request |
| BOOK-08 | Multi-day remote | Start tomorrow or later | Select valid range | Inclusive full-day Remote range reserved |
| BOOK-09 | Multi-day today | Form open | Start multi-day request today | Request rejected |
| BOOK-10 | Unavailable PC | PC is Maintenance/Inactive | Try selection/submission | PC disabled; no booking |
| BOOK-11 | Purpose | Other fields valid | Submit fewer than five characters | Request rejected |
| BOOK-12 | Overlap | Active booking occupies interval | Submit overlapping request | Second request rejected as conflict |
| BOOK-13 | Released interval | Prior booking closed | Submit same interval | Booking succeeds if no active conflict |
| BOOK-14 | Technician request | Technician signed in | Submit valid request | Starts Pending Advisor |
| BOOK-15 | Advisor request | Advisor signed in | Submit valid request | Starts Pending Dean |
| BOOK-16 | Dean request | Dean signed in | Submit valid request | Immediately Approved after validation |
| FLOW-01 | Technician approval | Student request Pending Technician | Approve | Becomes Pending Advisor; event recorded |
| FLOW-02 | Technician rejection | Student request Pending Technician | Reject with reason | Rejected; reason/reviewer retained |
| FLOW-03 | Advisor approval | Request addressed to signed-in Advisor | Approve | Becomes Pending Dean; event recorded |
| FLOW-04 | Advisor rejection | Request Pending Advisor | Reject with reason | Rejected; reason retained |
| FLOW-05 | Wrong Advisor | Student selected Alpha | Sign in as Beta | Request hidden and cannot be decided |
| FLOW-06 | Technician requester | Technician request Pending Advisor | Advisor approves/rejects | Advances to Dean or closes Rejected |
| FLOW-07 | Dean approval | Request Pending Dean | Approve | Becomes Approved; event recorded |
| FLOW-08 | Dean rejection | Request Pending Dean | Reject with reason | Becomes Rejected; reason retained |
| FLOW-09 | Wrong stage | Request not at reviewer's stage | Attempt decision | Denied; booking unchanged |
| FLOW-10 | Empty reason | Correct rejection stage | Reject without reason | Blocked; status unchanged |
| CAN-01 | Owner cancellation | Own active future booking | Enter valid reason and cancel | Cancelled; reason/actor/time saved; slot released |
| CAN-02 | Other requester | Another user owns booking | Attempt cancellation | Denied |
| CAN-03 | Started booking | Start passed | Owner attempts cancellation | Denied |
| CAN-04 | Closed booking | Rejected/completed/cancelled | Attempt cancellation | Denied |
| CAN-05 | Invalid reason | Own eligible booking | Use reason outside 5–2000 characters | Denied; status unchanged |
| CAL-01 | Week calendar | Authenticated | Open Calendar | Seven Bangkok dates and occupancy render |
| CAL-02 | Day timeline | Calendar open | Select date | 08:00–18:00 and 15-minute slots appear |
| CAL-03 | Calendar-to-form | Free future interval exists | Select PC/time | Booking form opens prefilled |
| CAL-04 | Authorized detail | User owns/reviews booking | Open occupied block | Full authorized detail opens |
| CAL-05 | Private occupancy | Unrelated booking exists | Inspect block/response | Occupancy shown without private details |
| HIST-01 | My Bookings | User has records | Open history | Own PC/date/Advisor/status shown |
| HIST-02 | Decision detail | Booking decided | Open detail | Status and applicable reason shown |
| ADMIN-01 | Role update | Dean and target exist | Change target role | Role and allowlist update consistently |
| ADMIN-02 | Unauthorized role update | Non-Dean signed in | Attempt management | Unavailable or denied |
| ADMIN-03 | Dean self-change | Dean selects self | Change own role | Rejected |
| PC-01 | Add PC | Technician/Dean signed in | Save valid PC fields | PC appears in management/availability |
| PC-02 | Edit PC | Existing PC selected | Change supported fields | Changes persist |
| PC-03 | Maintenance/inactive | Existing PC | Change status | History remains; new booking blocked |
| PC-04 | Unauthorized PC edit | Student/Advisor signed in | Attempt mutation | Unavailable or denied |
| ACCT-01 | Deactivate | Active user | Confirm danger-zone action | Timestamp recorded; user signed out |
| ACCT-02 | Recovery screen | Deactivated within 90 days | Sign in | Recovery screen replaces workspace |
| ACCT-03 | Reactivate | Recovery screen open | Confirm reactivation | Account active; workspace opens |
| ACCT-04 | Expired recovery | More than 90 days elapsed | Attempt reactivation | Rejected with contact guidance |

## 9. Non-Functional Test Criteria

| Area | Measure | Proposed release criterion |
|---|---|---|
| Reliability | Valid submit/review/cancel trials | At least 95% complete without data loss/false success |
| Data integrity | Workflow, conflict, ownership, audit | 100% of critical database cases pass |
| Security | Anonymous/cross-user/wrong-role/stage | 100% rejected without disclosure |
| Usability | SUS | Median at least 70; investigate scores below 50 |
| Efficiency | Task time | Post-system median improves on 3 of 4 comparable tasks |
| Effectiveness | Independent completion | At least 80% per core task; no critical privacy error |
| Accessibility | Keyboard, labels, focus, errors, zoom | No blocking core-flow issue |
| Compatibility | Current Chrome, Firefox, Safari; mobile/tablet | No blocked core workflow |
| Performance | Local/staging response | Record p50/p95; investigate ordinary p95 above 2 seconds |
| Maintainability | Tests, lint, build, reset, pgTAP, schema lint | Pass or documented accepted disposition |

Threshold changes must be agreed before data collection and documented.

## 10. Real-User UAT Study

### 10.1 Mandatory design

- **Participants:** At least 10 university users, primarily Students who use or
  could use the SE laboratory.
- **Sessions:** At least 10 valid completed sessions.
- **Duration:** 35–50 minutes each.
- **Mode:** Moderated in person or remote with consent.
- **Design:** Within-subject before/after comparison.
- **Before:** Use a provided manual availability sheet and request form.
- **After:** Complete equivalent tasks in the booking system.
- **Evidence:** Time, completion, errors, assistance, observations, SUS, TAM.

### 10.2 Participant tasks

| Task | Participant instruction | Primary measure |
|---|---|---|
| UAT-01 | Find an available PC for a specified future date/time | Time, correctness, navigation errors |
| UAT-02 | Submit a one-day request and select the specified Advisor | Completion, field errors, confidence |
| UAT-03 | Find the request and explain its current/next approval stage | Findability, workflow understanding |
| UAT-04 | Find an alternative when the first PC/time is occupied | Time, conflict understanding, recovery |
| UAT-05 | Cancel an eligible request and confirm slot release | Completion, data accuracy, confidence |

Optional staff tasks may cover Technician, Advisor, and Dean review plus role
and PC management. They supplement rather than replace Student evidence.

### 10.3 UAT acceptance criteria

1. At least ten valid sessions are complete.
2. No cross-user private-data disclosure occurs.
3. At least 8 of 10 independently complete each mandatory task, or it is
   classified for redesign.
4. Post-system median is faster than baseline for at least three of four
   comparable timed tasks.
5. Median SUS is at least 70.
6. TAM thresholds in Section 12 are met or have documented remediation.
7. All critical functional and authorization tests pass.

## 11. Before/After Measurement Protocol

Record start/end time, independent/assisted/failed outcome, errors, moderator
interventions, incorrect PC/date/time/Advisor/workflow interpretation,
confidence (1–5), and neutral comments.

```text
time_seconds = end_timestamp - start_timestamp
completion_rate = independent_completions / valid_attempts × 100
critical_error_rate = critical_errors / valid_attempts × 100
time_improvement = (baseline_median - post_median) / baseline_median × 100
error_reduction = (baseline_error_rate - post_error_rate) / baseline_error_rate × 100
```

Critical errors include unnoticed wrong PC/time, private-data disclosure,
submission to the wrong Advisor, cancelling the wrong booking, or false success.
Report paired results, medians, and interquartile ranges; do not generalise from
ten participants.

## 12. Questionnaires

### 12.1 SUS questionnaire

Use 1 = Strongly disagree to 5 = Strongly agree.

1. I would like to use the SE Lab PC Booking System frequently.
2. I found the system unnecessarily complex.
3. I thought the system was easy to use.
4. I would need technical support to use it.
5. I found the system functions well integrated.
6. I thought there was too much inconsistency.
7. Most university users would learn it quickly.
8. I found the system cumbersome.
9. I felt confident using it.
10. I needed to learn many things before using it.

For odd items subtract 1; for even items subtract the response from 5. Sum and
multiply by 2.5. Report 0–100 scores, median, range, and individual scores. SUS
is a usability instrument, not an acceptance model.

### 12.2 Technology Acceptance Model (TAM) questionnaire

TAM is the only acceptance model. Use 1 = Strongly disagree to 7 = Strongly
agree.

**Perceived usefulness (PU)**

1. The system would improve my ability to reserve an SE Lab PC.
2. It would help me understand PC availability before visiting the lab.
3. It would help me track approval status.
4. It would reduce booking conflicts and uncertainty.

**Perceived ease of use (PEOU)**

5. Learning the system would be easy.
6. Finding a PC and time would be easy.
7. Submitting and tracking a request would be easy.
8. I would find the system easy to use.

**Behavioural intention (BI)**

9. I intend to use the system for SE Lab bookings.
10. I would recommend it to other SE Lab users.

Calculate participant PU, PEOU, and BI means, then sample median/range.

- PU median ≥ 5.0/7.
- PEOU median ≥ 5.0/7.
- BI median ≥ 5.0/7.

## 13. Supporting Templates

### 13.1 Session cover sheet

```text
SE Lab PC Booking System UAT Session
Participant ID: P__
Date:
Moderator:
Mode: in person / remote
Role used: Student / Technician / Advisor / Dean
Device and browser:
Prior SE Lab booking experience: none / low / moderate / high
Consent obtained: yes / no
Recording consent: yes / no / not recorded
Accessibility or language needs:
Environment issues:
```

### 13.2 Task measurement sheet

```text
Participant ID: P__
Task ID:
Condition: BEFORE / AFTER
Start time:
End time:
Time in seconds:
Outcome: independent / assisted / failed
Critical error: yes / no
Other errors and omissions:
Moderator interventions:
Confidence (1–5):
Participant comment:
```

### 13.3 Observation and issue log

```text
Observation ID:
Participant ID:
Task ID:
Timestamp:
Observed behaviour or quote:
Classification: usability / functional / data / performance / accessibility
Severity: critical / high / medium / low
Reproducible: yes / no / unknown
Related backlog or test case:
Immediate action:
Follow-up owner:
```

- **Critical:** Privacy breach, data loss, wrong-account access, duplicate
  active booking, or blocked core workflow.
- **High:** Core task requires intervention or gives a materially wrong result.
- **Medium:** Recoverable defect or substantial confusion.
- **Low:** Cosmetic, wording, or minor interaction issue.

### 13.4 SUS response sheet

```text
Participant ID: P__
Use 1–5
Item 1: __  Item 2: __  Item 3: __  Item 4: __  Item 5: __
Item 6: __  Item 7: __  Item 8: __  Item 9: __  Item 10: __
Adjusted total:
SUS score:
```

### 13.5 TAM response sheet

```text
Participant ID: P__
Use 1–7
PU1: __  PU2: __  PU3: __  PU4: __
PEOU1: __  PEOU2: __  PEOU3: __  PEOU4: __
BI1: __  BI2: __
PU mean:
PEOU mean:
BI mean:
Comments explaining low scores:
```

### 13.6 Exit interview prompts

1. Which task was easiest and why?
2. Which task was hardest or least clear?
3. Was availability easy to understand?
4. Was selecting an Advisor clear?
5. Could you understand the approval stage?
6. Did you trust the privacy of booking details?
7. What should change before real use?
8. Was information missing or misleading?

## 14. Test Schedule

| Week | Activity | Deliverable |
|---|---|---|
| 1 | Confirm scope; prepare local/staging Supabase, fixtures, and consent | Environment checklist and fixtures |
| 1 | Run frontend checks, reset, pgTAP, and schema lint | Baseline verification record |
| 2 | Execute auth, profile, Advisor, booking, review, cancellation, and admin tests | Integration results and defects |
| 2 | Run browser regression for roles, calendar, responsive UI, languages, errors | System-test results |
| 3 | Fix/triage blockers and rerun failed critical cases | Retest report |
| 3 | Pilot one UAT session without changing thresholds | Pilot notes and protocol |
| 4 | Conduct P01–P05 with measurements, SUS, TAM | Five session packets |
| 5 | Conduct P06–P10 with the same protocol | Five session packets |
| 6 | Analyse results, run final regression/staging smoke, recommend acceptance | Final report |

No participant data is collected before environment, consent, and fixtures are
approved.

## 15. Entry and Exit Criteria

### 15.1 Entry criteria

- Branch and commit identify the test build.
- Frontend dependencies are installed.
- Local/staging Supabase is available and resettable.
- Required environment and OAuth test configuration exist.
- Synthetic accounts, Advisors, PCs, and bookings are validated.
- UAT protocol, consent, questionnaires, and participants are ready.

### 15.2 Exit criteria

- All critical functional and authorization cases pass.
- Frontend tests, lint, and build pass.
- Clean reset, canonical pgTAP, and schema lint pass.
- Failures are fixed, accepted, deferred with owner, or blocked with reason.
- At least ten valid UAT sessions are complete.
- Before/after measures, SUS, and TAM are recorded.
- No unresolved critical privacy, integrity, or data-loss defect remains.
- Final report documents results, limits, risks, and acceptance decision.

## 16. Defect Management and Reporting

Each defect includes unique ID, environment/build/migration, actor role and
account state, relevant PC/Bangkok time/status/Advisor, reproduction steps,
expected/actual result, severity/evidence, backlog/test link, privacy impact,
owner, status, and retest result.

The final report separates automated frontend, database/integration,
browser/end-to-end, migration/hosted smoke, ten-session UAT, SUS, TAM, and
deferred-feature results.

## 17. Traceability Matrix

| Requirement/backlog | Verification coverage |
|---|---|
| B1, B10 | AUTH-01 to AUTH-06; anonymous/protected-route checks |
| B2, B5 | CAL-01 to CAL-05; UAT-01/UAT-04 |
| B3, B4 | BOOK-01 to BOOK-09; UAT-02 |
| B6, B11, B15 | HIST-01/HIST-02; FLOW cases; UAT-03 |
| B7, B8, B34 | FLOW-01 to FLOW-10 |
| B9 | BOOK-12/BOOK-13 and concurrent overlap test |
| B12 | Decision-event assertions and history inspection |
| B13 | CAN-01 to CAN-05; UAT-05 |
| B16 | PC-01 to PC-04 |
| B20, B21, B35 | BOOK-14 to BOOK-16; FLOW-06 to FLOW-08 |
| B22, B36 | ADV-01 to ADV-07; BOOK-01; FLOW-03 to FLOW-05 |
| B23 | ADMIN-01 to ADMIN-03 |
| B37 | ACCT-01 to ACCT-04 |
| B14, B17–B19, B24–B33, B38 | Deferred/deployment/policy review |
| Non-functional quality | Section 9 and browser-system evidence |
| User acceptance | UAT-01 to UAT-05, SUS, TAM |

## 18. Final Acceptance Record

```text
Build/commit:
Migration baseline:
Test period:
Frontend tests/lint/build:
Database reset/pgTAP/lint:
Browser/end-to-end result:
Hosted OAuth/migration smoke result:
Valid real-user sessions: __ / 10 minimum
Core-task completion result:
Before/after measurement result:
Median SUS:
Median TAM PU:
Median TAM PEOU:
Median TAM BI:
Open critical defects:
Known limitations confirmed:
Acceptance decision: ACCEPT / ACCEPT WITH CONDITIONS / NOT ACCEPTED
Conditions and owners:
Test lead:
Product owner:
Date:
```
