# Case study: SE Lab PC Booking System

**Live URL:** <https://se-lab-booking-system.vercel.app/> (Vercel production, deployed from `main`)
**Repository:** <https://github.com/Leng201202/SE-Lab-Booking-System>
**Team:** Zaw Phyo Aung (Product Owner) · Sai Shang Hlang (Tech Lead) · Nay Win Aung (AI Lead) · Su Yee Mon Thein (QA) · Chan Nyein Moe (Designer)
**School of Applied Digital Technology, Mae Fah Luang University** · Evidence cutoff: 17 November 2026

---

## 1. Problem

The Software Engineering lab has a shared set of managed PCs. Before this project, booking happened through a paper/manual process ([proposal](../01-requirements/proposal.md)). That process had three problems:

1. **Remote use is invisible.** A PC that a student is using remotely looks free when you stand in front of it, so someone may sit down and close the session.
2. **No reliable reservation.** Nothing stopped two people from planning to use the same PC at the same time.
3. **Approval status is hard to follow.** Lab bookings need Technician, Advisor and Dean approval, and a paper form gives the requester no visible status.

### Evidence

We interviewed **five Students on 7–8 September 2026** ([user-research.md](../01-requirements/user-research.md)):

| # | Pain | Need it supports |
|---|---|---|
| 1 | Someone may close a PC while it is used remotely | Remote reservations must block availability visibly |
| 2 | Hard to know whether a PC is used remotely | Shared occupancy calendar showing access mode |
| 3, 4 | Someone may take the PC they planned to use | Reliable reservation and overlap prevention |
| 5 | No incident, but still has to check manually | Availability view |

4 of 5 interviewees reported a conflict or a remote-visibility problem; the fifth still checks availability by hand.

**Research boundary.** All five interviewees were Students. The Technician → Advisor → Dean approval chain comes from the institution's workflow, not from interviews. Technicians, Advisors, the Dean and the lab operator have not been interviewed, so their needs are not validated by research.

## 2. Process

### Discover

- Interviews (above) became pains, and pains became MoSCoW backlog items B1–B38 ([backlog.md](../01-requirements/backlog.md)). Each item has a `Source` column that names a research finding or an institutional/security requirement.
- Legal and engineering rules (Thai PDPA data minimisation, Computer-Related Crime Act retention, Electronic Transactions Act) are in [rule.md](../03-compliance/rule.md) and [legal-requirement-trace.md](../03-compliance/legal-requirement-trace.md).
- A formal spec and AI working rules (`CLAUDE.md`, two custom agents, one skill) were written on branch `docs/discover-package` (commit `b4614f4`).

### Design

- User journeys for all four roles ([user-journey.md](../02-design/user-journey.md)), a feature list, and four Mermaid diagrams: context, use case, ER, and booking sequence ([diagrams/](../02-design/diagrams/)). Two draw.io diagrams (all-role use case and Student booking flow) are on `docs/discover-package` (`abea331`, `a2a46c6`).
- Key design decision: **the database, not the browser, is the security boundary.** The calendar shows PC, time, access mode and status, but hides other Students' names and purposes.

### Build

The team moved through two stages:

1. **Browser-only demo** (commit `516bb12`, 15 Sep 2026): React UI with mock users and `localStorage`. 6 Node tests, no database.
2. **Production foundation** (current `main`):
   - React/Vite frontend on **Vercel** ([vercel.json](../../vercel.json))
   - **Supabase Auth** with Google OAuth; a Lamduan email fills the 10-digit Student ID automatically
   - **PostgreSQL** with Row Level Security, 16 versioned migrations, and transactional `security definer` RPC functions for booking, approval, rejection, cancellation, PC management, role management, deactivation and reactivation (12 distinct RPCs called from the client)
   - A GiST **exclusion constraint** (`bookings_no_active_overlap`) so two active bookings for the same PC and time can never both succeed, even under concurrency
   - Role-based approval paths:

     ```text
     Student    → Technician → selected Advisor → Dean → Approved
     Technician → Advisor → Dean → Approved
     Advisor    → Dean → Approved
     Dean       → approved immediately after availability check
     ```

   - One-day in-lab bookings (08:00–18:00) and multi-day remote bookings, future-only, in Bangkok time
   - Owner-only cancellation of a future booking with a required reason; immutable approval history
   - English and Thai interface

### Test

- **Frontend:** 11 of 11 Node tests pass; ESLint and the production build pass (one non-blocking bundle-size warning). Log: [evidence/frontend-tests-current.log](evidence/frontend-tests-current.log).
- **Baseline rerun:** the `516bb12` demo still passes 6 of 6. Log: [evidence/frontend-tests-baseline-516bb12.log](evidence/frontend-tests-baseline-516bb12.log).
- **Database:** 147 pgTAP assertions are defined (106 + 14 + 27) covering authorization, workflow, Student ID security, Advisor selection, future-start and account recovery. They were **not rerun** for this report: the local Supabase stack could not be started (Docker images could not be pulled). We do not claim them as passed until there is a dated clean run.
- **Security review** ([security-review.md](../03-compliance/security-review.md)): no confirmed critical issue; required fixes tracked as B24–B38.
- **Issue log** ([known-issues.md](../05-testing/known-issues.md)): BUG-01 to BUG-04 fixed; BUG-05 to BUG-09 open.
- **Real-user sessions:** none have been run yet. No usability timings, SUS or TAM scores exist, and none are reported here.

## 3. Outcome

### What works now (live at <https://se-lab-booking-system.vercel.app/>)

| Need from research | Delivered |
|---|---|
| See if a PC is really free, including remote use (#1, #2, #5) | Week and 15-minute timeline calendar showing status and access mode (B2, B4, B5) |
| Stop someone taking a planned PC (#3, #4) | Database exclusion constraint rejects overlapping active bookings (B9); the live demo shows a stale second tab being rejected |
| Know where my request is (institutional) | Status per stage, rejection reason, and approval history (B6, B12) |
| Privacy | Calendar hides other users' identity and purpose; signed-out visitors cannot read data (B5, B10) |

### Measured change

See [comparison-table.md](comparison-table.md). In short: 0 → 147 database assertions defined, 0 → 1 overlap constraint, 0 → 12 controlled RPCs, and 6/6 → 11/11 frontend tests passing. These are repository measurements. They do not show that users book faster; that has not been measured.

### What is not finished (release blockers)

- Any Google account can sign in; university-domain enforcement is not built (B24).
- No MFA for privileged actions (B25) and no booking quota (B26).
- Account "deletion" is soft deactivation only. A deactivated user's existing session is not blocked by every RLS path (BUG-07), and no job erases data after 90 days (BUG-08, B38).
- Hosted migration history is out of sync (BUG-05, BUG-06); duplicate ` 2` migration/test files remain (BUG-09).
- No notifications, rebooking, or check-in.

### Lessons

1. Repeat every critical rule in PostgreSQL; the UI is not a security control.
2. Refresh authoritative data after every workflow change.
3. Show each user only the calendar fields they need.
4. Keep migrations and tests unique and reproducible.
5. Name incomplete behaviour honestly: the account action is recoverable deactivation, not deletion.

### Next steps

Restore a working database test environment and record a dated pgTAP run; remove duplicate files; repair hosted migrations; add domain, MFA, quota and retention controls; run real-user sessions using the test plan (branch `test/test-plan`); and interview Technicians, Advisors and the Dean.
