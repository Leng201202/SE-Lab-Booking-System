# Presentation Script: SE Lab PC Booking System (10 minutes)

This version is audited against the active `dev` branch source code as of 16 November 2026. It is designed for five speakers at roughly 125–130 words per minute, with extra time for the live demo. Text in block quotes is spoken; italic text is a delivery or demo note.

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
- The frontend passes **11 of 11 tests**; ESLint and the production build pass. The build has a non-blocking large-bundle warning.
- The canonical SQL files define **147 pgTAP assertions**, but they were not rerun during this review because the local Supabase platform binary is missing. An obsolete duplicate test file remains in the repository.
- Booking, approval, rejection, cancellation, PC management, user-role management, deactivation, and reactivation use database RPCs. The browser does not directly set ownership, role, or workflow status.
- The running application contains no AI feature. It also contains no implemented notification service, automatic booking completion, institutional-domain gate, privileged-action MFA check, booking quota, or permanent account-cleanup job.
- Across all current Git refs, **7 of 85 unique commits** contain a Claude co-author trailer. Use the same `--all` scope for slides 9 and 10.

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

## Slide 5: Verification status (0:50) · QA — Su Yee Mon Thein

> Today, the 16th of November, all **11 Node tests pass**. They cover active overlap detection, safe database-to-UI mapping, Bangkok date boundaries, future slots, cancellation eligibility, and Advisor parameters. ESLint passes, and the production build succeeds with one non-blocking bundle-size warning.
>
> The SQL test files define **147 canonical pgTAP assertions** for authorization and workflow behavior. I cannot report a fresh pass rate because the local Supabase platform binary is missing. The suite and schema lint still need a clean run, and an obsolete duplicate test file must be removed safely.
>
> Before release, we must restore that environment, rebuild from every migration, and pass every critical database assertion. Sai will show what the implemented controls change for users.

*Do not restore the old “103 of 108” claim unless a dated test report proves that exact run. Replace this paragraph after the 147-assertion suite is executed successfully.*

## Slide 6: Before versus after (0:40) · Tech Lead — Sai Shang Hlang

> The implementation uses two layers. React gives immediate feedback: disabled maintenance PCs, future Bangkok slots, Advisor selection, role-specific routes, and clear status progress. PostgreSQL repeats the critical rules: trusted roles, valid stages, future starts, 15-minute lab times, available PCs, owner-only cancellation, and non-overlapping active ranges. After each booking workflow mutation, the app reloads authoritative bookings, PCs, and calendar data. Bypassing a route or button therefore does not bypass the rule. Su will cover the remaining risks.

## Slide 7: Defects and security (0:45) · QA — Su Yee Mon Thein

> The code also makes the unfinished controls visible. It does not enforce a university Google domain, require MFA for privileged RPCs, limit booking duration or active requests, or verify manually entered non-Lamduan Student IDs against a university source.
>
> Account deletion is also only soft deactivation. The React workspace blocks a deactivated profile and offers recovery for 90 days, but existing sessions are not denied by every RLS policy and RPC. No job permanently deletes or pseudonymizes an expired account, although some interface copy suggests deletion. Finally, the repository contains duplicate migration and test files. These are release blockers, not optional polish. Nay will explain how AI-assisted development was governed.

## Slide 8: Where we used AI (0:35) · AI Lead — Nay Win Aung

> AI assisted development; it is **not** part of the running booking system. We used an early Lovable prototype for interface exploration and Claude to help draft React code, SQL, tests, diagrams, and documentation. Several changes carry Claude co-author trailers.
>
> We also created reusable instructions and checkers. Some currently live on documentation branches, so we must merge them or label them accurately. Our rules are simple: never fabricate research, keep security in PostgreSQL, protect secrets and personal data, and require human review.

## Slide 9: How we checked and measured AI work (0:45) · AI Lead — Nay Win Aung

> We checked AI output four ways. **Traceability:** requirements point to backlog items and research. **Independent verification:** assisted code receives the same frontend and database checks. **Human accountability:** a named contributor reviews each change. **Honest gaps:** our documents say when research, deployment, or testing is incomplete.
>
> Across all current Git refs, **7 of 85 unique commits** contain a Claude co-author trailer. That measures disclosed history—not all AI use or productivity. We did not run a controlled comparison, so we claim no hours saved. Zaw will summarize team ownership using the same Git scope.

## Slide 10: Team roles and ownership (0:30) · Product Owner — Zaw Phyo Aung

> Our work had clear owners: I led scope, interviews, and backlog decisions; Sai led architecture and migrations; Nay led AI guidance; Su led verification and security review; and Chan led design, journeys, and diagrams.
>
> The counts use all Git refs: Zaw 5, Sai 64, Nay 3, Su 7, and Chan 6. Sai’s total combines two author names with the same email. Counts show repository activity, not contribution quality.

## Slide 11: Lessons learned (0:45) · Designer — Chan Nyein Moe

> We learned five things from the implementation. **First**, repeat critical validation in PostgreSQL. **Second**, refresh authoritative data after every workflow change. **Third**, expose only the calendar fields a user needs. **Fourth**, keep migrations and tests unique and reproducible. **Fifth**, name incomplete behavior honestly: the current account action is recoverable deactivation, not permanent deletion. These lessons make both the interface and the evidence more trustworthy. Nay will close our AI disclosure.

## Slide 12: AI disclosure (0:25) · AI Lead — Nay Win Aung

> This slide lists each AI tool, what it assisted with, and the accountable human owner. The running application sends no user data to an AI model, and our rules prohibit sharing secrets or personal data. Interviews, institutional decisions, security acceptance, and final approval remain human responsibilities. AI produced drafts; the team owns the result.

## Slide 13: Next steps and questions (0:15) · Product Owner — Zaw Phyo Aung

> Next, we will restore the database test environment, remove duplicate files, verify hosted migrations, add domain, MFA, quota, suspension, and retention controls, and validate the workflow with institutional stakeholders. Thank you. We welcome your questions.

---

**Target total: about 10:00.** If time is short, compress slides 6 and 10; do not cut the research limitation, test limitation, or security risks.

## Final rehearsal checklist

- Update the deck numbers to match this script before rehearsing.
- Use the same Git scope on slides 9 and 10. The current baseline is `git log --all`: 85 unique commits and 7 Claude-trailer commits.
- Merge or explicitly label AI artifacts that exist only on documentation branches.
- Recheck all four demo accounts, the Student ID, selected Advisor, available PC, and future Bangkok time.
- Prepare the same free interval in two tabs before submitting either one; use the stale second tab to demonstrate database overlap rejection.
- Do not use seeded PC-04 or PC-08 for the successful booking because both are under maintenance.
- After a successful clean database run, replace the limitation on slide 5 with the dated result; never predict a pass.
- Prepare short answers for why only Students were interviewed, why high-priority security work remains, why commit count is not a productivity measure, and why the database suite was not rerun in the current environment.
