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

> Good morning. We are presenting the **SE Lab PC Booking System**, a shared, privacy-preserving calendar for the SE lab computers. Users can see when a PC is occupied, request an available time, and follow the correct approval path for their role. PostgreSQL is the final authority for access and booking conflicts. Our five-person team will show the problem, the user journey, a live workflow, our verification evidence, how we used AI, and the work still required before a broad rollout.

## Slide 2: Problem and research boundary (0:55) · Product Owner — Zaw Phyo Aung

> We began with five Student interviews on the 7th and 8th of September. Four of the five Students reported either a booking conflict or difficulty seeing remote PC use. The fifth still had to check manually whether a PC was free.
>
> Two needs are clear from that evidence: remote use must be visible, and a reservation must reliably protect the selected PC and time. The current process makes both uncertain.
>
> We should also be precise about what the research does **not** prove. We interviewed only Students. The Technician, Advisor, and Dean approval chain is an institutional workflow requirement, not a finding from those interviews. Those stakeholders still need separate validation. Chan will now show how we turned the supported needs and institutional rules into one user journey.

## Slide 3: Users and journey (0:50) · Designer — Chan Nyein Moe

> The journey begins with one question: **which PC is genuinely available?** A Student checks the calendar, chooses either a one-day lab session or a multi-day remote booking, selects an eligible Advisor, submits the request, and then follows its status. The Student can cancel their own active booking before it begins.
>
> The same system gives each reviewer a focused task. A Technician performs the first review for Student requests and manages PC inventory. The Advisor selected on that booking performs the next review. The Dean makes the final decision and manages trusted roles.
>
> The route changes for staff requests: Technician requests start with Advisor review, Advisor requests go directly to Dean review, and a Dean’s own valid request is approved immediately. Sai will demonstrate the Student path and the conflict protection.

## Slide 4: Live demo (2:10) · Tech Lead — Sai Shang Hlang

> I have separate browser profiles ready for the four application roles.
>
> **[1]** First, a new user signs in with Google and receives the Student role by default. The browser cannot assign a privileged role.
>
> **[2]** The calendar shows week and day occupancy plus onsite or remote access. It does not expose another Student’s name, email, university ID, or purpose.
>
> **[3]** As the Student, I select an Advisor and request an available one-day lab slot. The form blocks elapsed times; a remote multi-day request must begin on a future date.
>
> **[4]** I submit the same PC and interval again. The database rejects the overlap, so two concurrent requests cannot reserve the same active interval.
>
> **[5]** I switch to the Technician, the selected Advisor, and then the Dean. Each person can act only at the correct stage, and each decision creates an approval event.
>
> **[6]** Finally, I sign out. Anonymous requests to protected application data are denied.
>
> At the backlog level, 18 of 30 MUST stories are Done. The remaining items are deployment, security, and account-lifecycle work—not hidden demo features. Su will now separate what we verified from what still needs verification.

*Demo rule: use prepared future dates and an available seeded PC. If a step fails, state the expected result, show the recorded evidence if available, and move on. Stop the demo by 2:20.*

## Slide 5: Verification status (0:55) · QA — Su Yee Mon Thein

> We reran the checks available in this environment today, the 16th of November. All **11 frontend tests pass**. ESLint passes, and the production build succeeds with one non-blocking warning about the main bundle size.
>
> The maintained database suite now defines **147 canonical pgTAP assertions** across booking security, account recovery, and per-booking Advisor selection. I cannot honestly report a fresh database pass rate today: the local Supabase platform binary is missing, so the expanded suite and schema lint still require a clean database run. We also have one obsolete duplicate account-deletion test, recorded as BUG-09.
>
> Our quality gate is therefore clear: restore the test environment, remove the duplicate safely, rebuild from the migrations, and pass all critical database assertions before release. Sai will show what those database controls change for users.

*Do not restore the old “103 of 108” claim unless a dated test report proves that exact run. Replace this paragraph after the 147-assertion suite is executed successfully.*

## Slide 6: Before versus after (0:40) · Tech Lead — Sai Shang Hlang

> Before this system, a remote session could look like an unused PC, approval progress was difficult to follow, and two people could plan to use the same machine. Now the calendar exposes safe occupancy and access mode, while private requester details remain hidden. A PostgreSQL exclusion constraint prevents overlapping active intervals, even under concurrent requests. Workflow functions enforce the correct review stage and write an approval event in the same transaction. Past starts are rejected by both the interface and the database. The important design choice is that bypassing a button or route does not bypass the rule. Su will now cover the defects and release risks that remain.

## Slide 7: Defects and security (0:45) · QA — Su Yee Mon Thein

> Our bug log contains **nine issues**: four fixed and five open. The open work covers hosted migration history, verification of the future-start rule in production, incomplete authorization after account deactivation, missing permanent deletion or pseudonymization, and duplicate migration and test files.
>
> Within the reviewed scope, we found **no confirmed critical** takeover, injection, cross-site scripting, anonymous disclosure, or direct role-escalation issue. That is not the same as claiming the system is fully secure. Six high-priority risks still block broad rollout: university-domain enforcement, MFA for privileged actions, booking-abuse limits, verification of manually entered IDs, complete suspension and session denial, and an approved account-retention and cleanup process. These map to B24 through B28 and B38. Nay will explain how AI-assisted work was governed and checked.

## Slide 8: Where we used AI (0:40) · AI Lead — Nay Win Aung

> AI assisted development; it is **not** a feature of the running booking system. We used an early Lovable prototype for interface exploration and used Claude to help draft and revise React code, SQL migrations, tests, diagrams, and documentation. The Student-ID auto-fill work and several documentation changes carry Claude co-author trailers.
>
> We also created reusable instructions and checking workflows so AI work followed the same architecture and compliance rules as human work. Some of those artifacts currently live on documentation branches, so we should merge them before describing them as active-branch files. The essential rules are already clear in our contributor guide: never fabricate research, treat PostgreSQL as the security boundary, protect secrets and personal data, and require human review.

## Slide 9: How we checked and measured AI work (0:45) · AI Lead — Nay Win Aung

> We did not accept AI output on trust. We checked it in four ways. **Traceability:** requirements point to backlog items and recorded research. **Independent verification:** AI-assisted code is subject to the same frontend checks and canonical 147-assertion database suite. **Human accountability:** a named contributor reviews and commits each change. **Honest gaps:** our documents state when research, deployment, or testing is incomplete.
>
> For one reproducible measurement, **7 of 85 unique commits across all current Git refs** contain a Claude co-author trailer. That number measures disclosed commit history, not all AI use and not productivity. We did not run a controlled comparison of work with and without AI, so we make no claim about hours saved. Zaw will now summarize team ownership using the same Git scope.

## Slide 10: Team roles and ownership (0:30) · Product Owner — Zaw Phyo Aung

> Our work had clear owners. I handled product scope, interviews, and backlog decisions. Sai led architecture, migrations, and overlap protection. Nay led AI guidance and disclosure. Su owned verification, the defect log, and security review. Chan owned the design system, user journeys, and diagrams.
>
> The slide’s commit counts use all current Git refs, matching the AI slide: Zaw 5, Sai 64, Nay 3, Su 7, and Chan 6, for 85 unique commits. Sai’s total combines two Git author names with the same university email. These counts show repository activity, not the value or quality of each person’s contribution.

## Slide 11: Lessons learned (0:45) · Designer — Chan Nyein Moe

> We learned five things. **First**, put critical rules in the database because interface checks can be bypassed. **Second**, design status and next actions so every role can tell what is happening without seeing private information. **Third**, keep migrations, seed data, tests, and documentation synchronized; the duplicate legacy files show how easily evidence can drift. **Fourth**, research supports only the people and questions actually studied, so we still need Technician, Advisor, Dean, and lab-operator interviews. **Fifth**, label every claim by its evidence state: implemented, locally verified, deployment-dependent, or planned. That makes both the product and the presentation more trustworthy. Nay will close our AI disclosure.

## Slide 12: AI disclosure (0:25) · AI Lead — Nay Win Aung

> For transparency, this slide lists the AI tools we used, what they assisted with, and the human owner who remains accountable. The running application sends no booking or profile data to an AI model, and the team rules prohibit sharing secrets or real personal data with AI tools. The interview records, institutional workflow decisions, security acceptance decisions, and final approval of every change remain human responsibilities. AI produced drafts; the team owns the result.

## Slide 13: Next steps and questions (0:15) · Product Owner — Zaw Phyo Aung

> Our next steps are to restore the database test environment and run all 147 canonical assertions, clean up the duplicate migration and test files, repair and verify hosted migration history, and complete high-priority items B24 through B28 and B38. Then we will validate the workflow with institutional stakeholders. Thank you. We are happy to take your questions.

---

**Target total: about 10:00.** If time is short, compress slides 6 and 10; do not cut the research limitation, test limitation, or security risks.

## Final rehearsal checklist

- Update the deck numbers to match this script before rehearsing.
- Use the same Git scope on slides 9 and 10. The current baseline is `git log --all`: 85 unique commits and 7 Claude-trailer commits.
- Merge or explicitly label AI artifacts that exist only on documentation branches.
- Recheck the demo accounts, selected Advisor, available PC, and future Bangkok date.
- After a successful clean database run, replace the limitation on slide 5 with the dated result; never predict a pass.
- Prepare short answers for why only Students were interviewed, why high-priority security work remains, why commit count is not a productivity measure, and why the database suite was not rerun in the current environment.
