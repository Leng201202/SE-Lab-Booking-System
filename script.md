# Final Project Presentation Script: SE Lab PC Booking System (10 minutes)

This version is audited against the active `dev` branch source code as of 16 November 2026. It is designed for five speakers at roughly 125–130 words per minute, with extra time for the live demo. Text in block quotes is spoken; italic text is a delivery or demo note.

## Presentation-day requirements

- **Date and venue:** Wednesday, 18 November 2026, SE Lab.
- **Arrival:** every member arrives at least 15 minutes before the team’s assigned slot, with the live system already running on the team laptop.
- **Format:** 10-minute presentation with a hard stop, 3-minute Q&A, and 2-minute changeover.
- **Participation:** every member speaks about work they actually built, designed, governed, or tested.
- **Demo rule:** show working MUST tasks live; do not replace the demo with screenshots.

## Rubric coverage

| Required evidence | Slides |
|---|---:|
| Problem and users | 1–3 |
| Live demo of implemented MUST tasks | 4 |
| Test results, sourced comparison, and before versus after | 5–7 |
| AI logic: Where, How, Prove, and Measure | 8–9 |
| Roles, lessons learned, and AI disclosure | 10–12 |
| Next steps and questions | 13 |

---

## Role analysis and delivery focus

| Role | Speaker | Slides | Purpose in the story | Delivery guidance |
|---|---|---:|---|---|
| Product Owner | Zaw Phyo Aung | 1, 2, 10, 13 | Establish the problem, research boundary, scope, ownership, and next steps | Speak in outcomes and evidence. Do not turn the opening into a feature list. |
| Tech Lead | Sai Shang Hlang | 4, 6 | Prove the system works and explain why the database—not the interface—is authoritative | Keep the demo moving. Explain the consequence of each action, not every click. |
| AI Lead | Nay Win Aung | 8, 9, 12 | Explain where AI assisted, how its output was controlled, and what the team can actually measure | Distinguish AI-assisted development from the running product, which has no AI feature. |
| QA | Su Yee Mon Thein | 5, 7 | Report reproducible verification, defects, and release risks without overstating assurance | Use “verified,” “recorded,” and “not yet rerun” precisely. Avoid saying “secure” when the review only found no confirmed critical issue. |
| Designer | Chan Nyein Moe | 3, 11 | Turn requirements into a coherent user journey and explain the usability lessons | Describe what each user needs to understand and do; avoid backend implementation detail. |

The speaking load is intentionally balanced around expertise. The Tech Lead has the longest block because the live demo takes about two minutes; the Designer now introduces the user journey instead of appearing only near the end.

## Source-code evidence map

| Presentation claim | Implementation evidence |
|---|---|
| Google sign-in, restored sessions, default authenticated workspace, and role routes | `app/src/features/auth/authService.js`, `app/src/app/AppContext.jsx`, `app/src/app/router.jsx` |
| Student ID and Advisor requirements; one-day and multi-day validation | `app/src/features/bookings/BookingFormPage.jsx`, `supabase/migrations/20261021000100_select_advisor_per_booking.sql` |
| Role-dependent request stages and database overlap rejection | `public.create_booking`, the GiST exclusion constraint, and `public.approve_booking` in the migrations |
| Privacy-preserving week and timeline calendar | `app/src/features/calendar/CalendarPage.jsx`, `public.get_booking_calendar` |
| Owner-only future cancellation with a required reason | `app/src/utils/booking.js`, `public.cancel_booking` |
| Dean role management and Technician/Dean PC management | `app/src/features/users/`, `app/src/features/pcs/`, `public.set_user_role`, `public.create_pc`, and `public.update_pc` |
| Soft deactivation and 90-day recovery | `app/src/features/auth/`, `public.request_account_deletion`, and `public.reactivate_my_account` |
| Frontend verification | `app/src/features/bookings/bookingService.test.js` and the scripts in `app/package.json` |

### Code-derived baseline

- The seed creates **10 PCs**: 8 available and 2 under maintenance, PC-04 and PC-08.
- The 15 September browser-demo baseline at commit `516bb12` passes **6 of 6 Node tests**. The current system passes **11 of 11**; ESLint and the production build also pass. The current build has a non-blocking large-bundle warning.
- The canonical SQL files define **147 pgTAP assertions**, but they were not rerun during this review because the local Supabase platform binary is missing. An obsolete duplicate test file remains in the repository.
- The browser-demo baseline had **0 database assertions**, **0 database overlap constraints**, and **0 Supabase RPC calls**. The current system defines 147 canonical assertions, 1 active-overlap exclusion constraint, and 12 distinct RPC calls from the client.
- Booking, approval, rejection, cancellation, PC management, user-role management, deactivation, and reactivation use database RPCs. The browser does not directly set ownership, role, or workflow status.
- The running application contains no AI feature. It also contains no implemented notification service, automatic booking completion, institutional-domain gate, privileged-action MFA check, booking quota, or permanent account-cleanup job.
- At the 16 November measurement cutoff, **7 of 90 unique commits across all Git refs** contain a Claude co-author trailer. Use the same cutoff and `--all` scope for slides 9 and 10.

---

## Slide 1: Title (0:30) · Product Owner — Zaw Phyo Aung

> Good morning. We are presenting the **SE Lab PC Booking System**, a React application backed by Supabase Auth and PostgreSQL. Users can see PC occupancy, request an available time, and follow the approval path for their role. The browser provides the experience, but PostgreSQL is the authority for identity, permissions, workflow, and booking conflicts. We will show the problem, the implemented user journey, a live workflow, verification evidence, and the work still required before rollout.

## Slide 2: Problem and research boundary (0:50) · Product Owner — Zaw Phyo Aung

> We interviewed five Students on the 7th and 8th of September. Four reported either a booking conflict or difficulty seeing remote PC use. The fifth still checked manually whether a PC was free.
>
> The evidence supports two needs: make remote use visible, and reliably protect the selected PC and time.
>
> It does **not** validate the approval process. We interviewed only Students; the Technician, Advisor, and Dean chain is an institutional requirement. Those stakeholders still need separate research. Chan will now show how we turned the supported needs and institutional rules into one journey.

## Slide 3: Users and journey (0:50) · Designer — Chan Nyein Moe

> The implemented journey begins with one question: **which PC is genuinely available?** A Student uses the week or timeline calendar, chooses a one-day lab session or multi-day remote booking, selects an active Advisor, enters a purpose, and follows the approval progress. They can cancel their own active future booking with a reason.
>
> Each reviewer has a focused workspace. A Technician first reviews Student requests and can manage PCs. The Advisor selected on that booking reviews next. The Dean makes the final decision and manages both roles and PCs.
>
> Every role can also request and cancel its own booking. Staff use shorter approval routes, and the interface is available in English and Thai. Sai will demonstrate the Student path and conflict protection.

## Slide 4: Live demo (2:20) · Tech Lead — Sai Shang Hlang

**Live MUST coverage:** B1 authentication; B2 and B5 availability/privacy; B3 and B22 booking creation; B6 status; B7, B8, and B34 staged review; B9 overlap prevention; and B10 anonymous denial. Keep every step live—no screenshots. B4 multi-day remote booking and B12 durable approval events remain source-backed claims unless they are also shown live.

> I have prepared profiles for all four roles and opened the same free slot in two Student tabs.
>
> **[1]** Google sign-in restores the trusted database profile. New users start as Students. A Lamduan email supplies its ten-digit Student ID automatically; other Students must add one before booking.
>
> **[2]** The calendar has week and 15-minute timeline views. It shows status and access mode, but not another Student’s identity or purpose. Maintenance PCs are unavailable.
>
> **[3]** Selecting a free timeline range prefills the form. I choose an Advisor, enter a purpose, and submit. The request begins at Pending Technician.
>
> **[4]** The second tab still contains the stale free slot. When I submit it, PostgreSQL rejects the overlap. This proves the database—not only the refreshed calendar—protects the interval.
>
> **[5]** I switch to the Technician, selected Advisor, and Dean. Each acts only at the correct stage, and every decision creates an approval event.
>
> **[6]** After sign-out, the React workspace is cleared and anonymous database access is denied. Su will now separate what we verified from what still requires work.

*Demo rule: use PC-01, PC-02, or another available PC; PC-04 and PC-08 are seeded as maintenance. Prepare both conflict tabs before the first submission. Use a future Bangkok time and confirm the Student has an ID and an active Advisor exists. If a step fails, state the expected result and move on. Stop by 2:20.*

## Slide 5: Test results and baseline (0:50) · QA — Su Yee Mon Thein

> Our comparison baseline is the browser demo at commit `516bb12`. Rerun today, all **6 of its 6 Node tests pass**. In the current system, all **11 of 11 Node tests pass**. They cover safe data mapping, Bangkok date boundaries, future slots, cancellation eligibility, and Advisor parameters. ESLint and the production build also pass, with one non-blocking bundle-size warning.
>
> The current SQL suite defines **147 canonical pgTAP assertions** for authorization and workflow behavior. I cannot report a fresh database pass rate because the available local CLI cannot execute the test command. The suite and schema lint still need a clean run, and an obsolete duplicate test must be removed safely.
>
> These are reproducible code results, not estimates. Sai will now show the sourced comparison.

*Sources: `git show 516bb12:app/src/features/bookings/bookingService.test.js`, the current test file, the command `npm test --prefix app`, and the three canonical SQL test plans. Replace the database limitation only after a dated clean run.*

## Slide 6: Sourced before versus after (0:40) · Tech Lead — Sai Shang Hlang

**Put this comparison table on the slide:**

| Measured item | Before: browser demo `516bb12` | After: current `dev` | Source |
|---|---:|---:|---|
| Node tests passing | 6 / 6 | 11 / 11 | Baseline and current `bookingService.test.js`; rerun 16 Nov |
| Canonical database assertions defined | 0 | 147 | Baseline Git tree; current SQL plans: 106 + 14 + 27 |
| PostgreSQL active-overlap constraints | 0 | 1 | Baseline had no database; current `bookings_no_active_overlap` |
| Distinct Supabase RPCs called by the client | 0 | 12 | Baseline service used `localStorage`; current `app/src/features/` services |

> Before, six tests covered a browser-only demo using mock users and local storage. There were zero database assertions, zero database overlap constraints, and zero Supabase RPC calls. Now 11 Node tests pass, 147 database assertions are defined, one PostgreSQL exclusion constraint protects active intervals, and the client uses 12 RPCs for controlled operations. The database result is still pending, so we do not present 147 as passed. These are repository measurements, not claims about user speed. Su will cover the remaining risks.

## Slide 7: Defects and security (0:45) · QA — Su Yee Mon Thein

> The code also makes the unfinished controls visible. It does not enforce a university Google domain, require MFA for privileged RPCs, limit booking duration or active requests, or verify manually entered non-Lamduan Student IDs against a university source.
>
> Account deletion is also only soft deactivation. The React workspace blocks a deactivated profile and offers recovery for 90 days, but existing sessions are not denied by every RLS policy and RPC. No job permanently deletes or pseudonymizes an expired account, although some interface copy suggests deletion. Finally, the repository contains duplicate migration and test files. These are release blockers, not optional polish. Nay will explain how AI-assisted development was governed.

## Slide 8: Where we used AI (0:35) · AI Lead — Nay Win Aung

> **Where:** AI assisted the frontend, SQL migrations, tests, diagrams, and documentation; it is not part of the running system. **How:** we used an early Lovable prototype for exploration and Claude for drafting and revision, then applied the same architecture and security rules used for human work.
>
> We created two custom checking agents and one reusable audit skill. Some artifacts remain on documentation branches, so the slide must label their branch instead of implying they are merged. Our rules prohibit fabricated research, exposed secrets, and unreviewed AI output.

## Slide 9: How we checked and measured AI work (0:45) · AI Lead — Nay Win Aung

> **Proof:** assisted code receives the same tests and review as other code. Requirements trace to backlog and research, while named humans own the commits. Commit `704f750` proves AI-assisted Student-ID work; `b4614f4` contains the reusable agent package; and `a2a46c6` and `abea331` contain the two AI-assisted diagrams.
>
> **Measure:** at our 16 November cutoff, 7 of 90 unique commits across all Git refs contain a Claude trailer. We produced 3 reusable AI workflows—2 agents and 1 skill—and 2 diagrams. These numbers measure disclosed artifacts, not productivity. We ran no controlled time comparison, so we claim no hours saved. Zaw will summarize ownership using the same cutoff.

## Slide 10: Team roles and ownership (0:30) · Product Owner — Zaw Phyo Aung

> Our work had clear owners: I led scope, interviews, and backlog decisions; Sai led architecture and migrations; Nay led AI guidance; Su led verification and security review; and Chan led design, journeys, and diagrams.
>
> At the same 16 November cutoff, the counts are Zaw 5, Sai 69, Nay 3, Su 7, and Chan 6. Sai’s total combines two author names with the same university email. Counts show repository activity, not contribution quality.

## Slide 11: Lessons learned (0:45) · Designer — Chan Nyein Moe

> We learned five things from the implementation. **First**, repeat critical validation in PostgreSQL. **Second**, refresh authoritative data after every workflow change. **Third**, expose only the calendar fields a user needs. **Fourth**, keep migrations and tests unique and reproducible. **Fifth**, name incomplete behavior honestly: the current account action is recoverable deactivation, not permanent deletion. These lessons make both the interface and the evidence more trustworthy. Nay will close our AI disclosure.

## Slide 12: AI disclosure (0:25) · AI Lead — Nay Win Aung

> This slide lists each AI tool, what it assisted with, and the accountable human owner. The running application sends no user data to an AI model, and our rules prohibit sharing secrets or personal data. Interviews, institutional decisions, security acceptance, and final approval remain human responsibilities. AI produced drafts; the team owns the result.

## Slide 13: Next steps and questions (0:15) · Product Owner — Zaw Phyo Aung

> Next, we will restore the database test environment, remove duplicate files, verify hosted migrations, add domain, MFA, quota, suspension, and retention controls, and validate the workflow with institutional stakeholders. Thank you. We welcome your questions.

---

**Target total: about 10:00.** If time is short, compress slides 6 and 10; do not cut the research limitation, test limitation, or security risks.

## Final rehearsal checklist

- Record the team’s assigned time and have every member in the SE Lab at least 15 minutes early.
- Start the application, authenticate all four prepared profiles, connect power, and confirm network access before the slot begins.
- Rehearse with a visible timer and stop at 10:00 even if a demo step is incomplete.
- Update the deck numbers to match this script before rehearsing.
- Use the same 16 November cutoff and Git scope on slides 9 and 10: 90 unique commits and 7 Claude-trailer commits. If the team chooses a later cutoff, rerun and update both slides together.
- Merge or explicitly label AI artifacts that exist only on documentation branches.
- Recheck all four demo accounts, the Student ID, selected Advisor, available PC, and future Bangkok time.
- Prepare the same free interval in two tabs before submitting either one; use the stale second tab to demonstrate database overlap rejection.
- Do not use seeded PC-04 or PC-08 for the successful booking because both are under maintenance.
- After a successful clean database run, replace the limitation on slide 5 with the dated result; never predict a pass.
- Prepare short answers for why only Students were interviewed, why high-priority security work remains, why commit count is not a productivity measure, and why the database suite was not rerun in the current environment.

## Three-minute Q&A preparation

Each member should answer their own question in roughly 20–30 seconds.

### Product Owner — Zaw Phyo Aung

**Likely question:** What evidence supports the problem, and what remains unvalidated?

**Answer:** Five Students were interviewed on 7–8 September. Four reported conflict or remote-visibility problems, while the fifth still checked availability manually. This supports the calendar and overlap requirements. It does not validate the institutional approval chain, because Technicians, Advisors, the Dean, and the lab operator were not interviewed.

### Tech Lead — Sai Shang Hlang

**Likely question:** How do you guarantee that two users cannot reserve the same PC and time?

**Answer:** Active bookings use a PostgreSQL GiST exclusion constraint over the PC ID and a half-open timestamp range. Pending Technician, pending Advisor, pending Dean, and approved records all block the interval. The two-tab demo sends a stale second request to the database, which rejects it even though the client originally saw the slot as free.

### AI Lead — Nay Win Aung

**Likely question:** Explain your AI logic using Where, How, Prove, and Measure.

**Answer:** Where: frontend, SQL, tests, diagrams, and documentation. How: AI drafted or revised work under repository rules, followed by human review. Proof: named commits, co-author trailers, two agent files, one skill, and two diagrams. Measure: at the 16 November cutoff, 7 of 90 commits have Claude trailers, with 3 reusable workflows and 2 diagrams. We did not measure time saved, so we make no productivity claim.

### QA — Su Yee Mon Thein

**Likely question:** Which test results are actually verified?

**Answer:** The historical browser baseline was rerun and passed 6 of 6 Node tests. The current frontend passed 11 of 11, plus lint and build. The current SQL files define 147 canonical assertions, but the database suite was not rerun because the available local CLI cannot execute the test command. I would not call those 147 assertions passed until a dated run proves it.

### Designer — Chan Nyein Moe

**Likely question:** How does the design support different roles without exposing private information?

**Answer:** Each role receives only its relevant navigation, queue, status, and next action. The shared calendar shows PC, time, access mode, and workflow status, but it omits unrelated Student identity and purpose. Detailed records open only when the database says the user owns or reviews that booking.

## Number-and-source sheet

Keep this page available during Q&A. Every presentation number should trace to one of these sources.

| Number used | Meaning | Reproducible source |
|---:|---|---|
| 5 interviews; 4 with conflict/visibility pain | Research baseline | `.docs/01-requirements/user-research.md` |
| 10 PCs; 8 available; 2 maintenance | Current deterministic inventory | `supabase/seed.sql` |
| 6 / 6 | Browser-demo baseline tests, rerun from commit `516bb12` | Baseline `bookingService.test.js`; `npm test` against the archived commit |
| 11 / 11 | Current Node tests | `npm test --prefix app` |
| 147 | Canonical SQL assertions defined: 106 + 14 + 27 | `select plan(...)` in the three canonical database test files |
| 0 → 1 | PostgreSQL active-overlap constraint | No Supabase directory at `516bb12`; current `bookings_no_active_overlap` migration |
| 0 → 12 | Distinct client RPC calls | Baseline `localStorage` booking service; current feature services |
| 7 / 90 | Commits with a Claude trailer / unique commits across all refs at the 16 Nov cutoff | `git log --all` and `git rev-list --all --count`, recorded together at the cutoff |
| 3 workflows; 2 diagrams | Two custom agents, one audit skill, and two AI-assisted diagram commits | `b4614f4`, `a2a46c6`, and `abea331` |
| 5, 69, 3, 7, 6 | Zaw, Sai, Nay, Su, and Chan commit activity across all refs | `git shortlog -sne --all`; combine Sai’s two author names sharing one email |
