# Presentation Script: SE Lab PC Booking System (10 minutes)

This version is designed for five speakers at roughly 125–130 words per minute, with extra time for the live demo. Each speaker owns the claims closest to their project role. Text in block quotes is spoken; italic text is a delivery or demo note.

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

## Evidence baseline for the speakers

- The backlog contains **30 MUST stories**: 18 Done, 2 requiring deployment configuration, 1 implemented but release-blocked, and 9 Planned.
- The frontend currently passes **11 of 11 tests**; ESLint and the production build also pass. The build reports a non-blocking large-bundle warning.
- The canonical database suite defines **147 pgTAP assertions**. It was not rerun during this script review because the local Supabase platform binary is missing. An obsolete duplicate test file is tracked as BUG-09.
- The bug log contains **9 bugs**: 4 Fixed and 5 Open.
- The security review records **no confirmed critical issue in its reviewed scope** and **6 high-priority risks**, H1–H6.
- Across all current Git refs, there are **85 unique commits**, of which **7** contain a Claude co-author trailer. Use `--all` for both the AI and team-contribution slides so the totals share one basis.
- The custom agents, `CLAUDE.md`, AI disclosure, and AI-drafted draw.io artifacts exist in repository history or documentation branches but are not all present on the active `dev` branch. Merge them before presenting them as current-branch files, or label them accurately as branch artifacts.

---

## Slide 1: Title (0:30) · Product Owner — Zaw Phyo Aung

> Good morning. We are presenting the **SE Lab PC Booking System**, a shared, privacy-preserving calendar for the SE lab computers. Users can see occupancy, request an available time, and follow the approval path for their role. PostgreSQL is the final authority for access and booking conflicts. We will show the problem, the user journey, a live workflow, our evidence, our use of AI, and the work still required before rollout.

## Slide 2: Problem and research boundary (0:55) · Product Owner — Zaw Phyo Aung

> We interviewed five Students on the 7th and 8th of September. Four reported either a booking conflict or difficulty seeing remote PC use. The fifth still checked manually whether a PC was free.
>
> The evidence supports two needs: make remote use visible, and reliably protect the selected PC and time.
>
> It does **not** validate the approval process. We interviewed only Students; the Technician, Advisor, and Dean chain is an institutional requirement. Those stakeholders still need separate research. Chan will now show how we turned the supported needs and institutional rules into one journey.

## Slide 3: Users and journey (0:50) · Designer — Chan Nyein Moe

> The journey begins with one question: **which PC is genuinely available?** A Student checks the calendar, chooses a one-day lab session or multi-day remote booking, selects an Advisor, submits, and follows the status. They can cancel their own active booking before it begins.
>
> Each reviewer has a focused task. A Technician first reviews Student requests and manages PC inventory. The selected Advisor reviews next. The Dean makes the final decision and manages trusted roles.
>
> Staff follow shorter routes: Technician requests start with the Advisor, Advisor requests start with the Dean, and a Dean’s valid request is approved immediately. Sai will demonstrate the Student path and conflict protection.

## Slide 4: Live demo (2:10) · Tech Lead — Sai Shang Hlang

> I have separate profiles ready for all four roles.
>
> **[1]** A new Google user becomes a Student by default; the browser cannot grant a privileged role.
>
> **[2]** The calendar shows occupancy and access mode without exposing another Student’s identity or purpose.
>
> **[3]** As a Student, I select an Advisor and request a lab slot. Elapsed times are blocked, and multi-day remote requests must begin on a future date.
>
> **[4]** I submit the same PC and interval again. The database rejects the overlap, including concurrent attempts.
>
> **[5]** I switch to the Technician, selected Advisor, and Dean. Each acts only at the correct stage, and every decision is audited.
>
> **[6]** After sign-out, anonymous requests to protected data are denied.
>
> Eighteen of 30 MUST stories are Done. The rest cover deployment, security, and account lifecycle. Su will separate what is verified from what still needs verification.

*Demo rule: use prepared future dates and an available seeded PC. If a step fails, state the expected result, show the recorded evidence if available, and move on. Stop the demo by 2:20.*

## Slide 5: Verification status (0:55) · QA — Su Yee Mon Thein

> Today, the 16th of November, all **11 frontend tests pass**. ESLint passes, and the production build succeeds with one non-blocking bundle-size warning.
>
> The database suite defines **147 canonical pgTAP assertions**. I cannot report a fresh pass rate today because the local Supabase platform binary is missing. The expanded suite and schema lint still need a clean run. An obsolete duplicate test is tracked as BUG-09.
>
> Before release, we must restore the environment, remove the duplicate safely, rebuild from migrations, and pass every critical database assertion. Sai will show what those controls change for users.

*Do not restore the old “103 of 108” claim unless a dated test report proves that exact run. Replace this paragraph after the 147-assertion suite is executed successfully.*

## Slide 6: Before versus after (0:40) · Tech Lead — Sai Shang Hlang

> Before, remote use looked like an available PC, approval was hard to follow, and two people could plan for the same machine. Now the calendar shows safe occupancy while hiding private details. A PostgreSQL constraint prevents overlapping active bookings, including concurrent requests. Database functions enforce each review stage and audit its decision. Past starts are rejected in both the interface and database. Bypassing a button does not bypass the rule. Su will cover the remaining risks.

## Slide 7: Defects and security (0:45) · QA — Su Yee Mon Thein

> Our bug log has **nine issues**: four fixed and five open. The open work covers hosted migrations, production verification, incomplete authorization after deactivation, missing permanent cleanup, and duplicate migration and test files.
>
> The review found **no confirmed critical issue** in scope, but that does not mean the system is fully secure. Six high-priority risks block rollout: domain enforcement, privileged-action MFA, booking limits, verification of manual IDs, complete suspension and session denial, and an approved retention and cleanup process. They map to B24 through B28 and B38. Nay will explain how we governed AI-assisted work.

## Slide 8: Where we used AI (0:40) · AI Lead — Nay Win Aung

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

> We learned five things. **First**, put critical rules in the database. **Second**, show each role its status and next action without exposing private data. **Third**, keep migrations, tests, and documentation synchronized; duplicate legacy files show how evidence drifts. **Fourth**, research proves only what and whom we studied, so other roles still need interviews. **Fifth**, label claims as implemented, verified, deployment-dependent, or planned. That makes the product and presentation more trustworthy. Nay will close our AI disclosure.

## Slide 12: AI disclosure (0:25) · AI Lead — Nay Win Aung

> This slide lists each AI tool, what it assisted with, and the accountable human owner. The running application sends no user data to an AI model, and our rules prohibit sharing secrets or personal data. Interviews, institutional decisions, security acceptance, and final approval remain human responsibilities. AI produced drafts; the team owns the result.

## Slide 13: Next steps and questions (0:15) · Product Owner — Zaw Phyo Aung

> Next, we will run all 147 database assertions, remove the duplicate files, verify hosted migrations, complete B24 through B28 and B38, and validate the workflow with institutional stakeholders. Thank you. We welcome your questions.

---

**Target total: about 10:00.** If time is short, compress slides 6 and 10; do not cut the research limitation, test limitation, or security risks.

## Final rehearsal checklist

- Update the deck numbers to match this script before rehearsing.
- Use the same Git scope on slides 9 and 10. The current baseline is `git log --all`: 85 unique commits and 7 Claude-trailer commits.
- Merge or explicitly label AI artifacts that exist only on documentation branches.
- Recheck the demo accounts, selected Advisor, available PC, and future Bangkok date.
- After a successful clean database run, replace the limitation on slide 5 with the dated result; never predict a pass.
- Prepare short answers for why only Students were interviewed, why high-priority security work remains, why commit count is not a productivity measure, and why the database suite was not rerun in the current environment.
