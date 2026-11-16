# Presentation Script: SE Lab PC Booking System (10 minutes)

The timing is based on speaking at about 130 words per minute, with extra time for the live demo.
Each slide has a suggested speaker based on the roles in the deck. Swap speakers however you like.

---

## Slide 1: Title (0:30) · Product Owner

> Good morning, everyone. We're presenting the **SE Lab PC Booking System**. It's one shared, live calendar for the SE lab computers. Students request a PC, and the request goes through Technician, Advisor and Dean review. The database guarantees that two bookings can never overlap. We are a team of five: Product Owner, Tech Lead, AI Lead, QA, and Designer. We'll show you the problem, a live demo, our test results, how we used AI, and what we learned.

## Slide 2: Problem (1:00) · Product Owner

> We started by interviewing five students on the 7th and 8th of September. Three pains came up again and again.
>
> First: *"Someone may close a computer while it is being used remotely."*
> Second: *"It is difficult to know whether a computer is being used remotely."*
> Third, from two different students: *"Someone may take the computer they planned to use."*
>
> **Four out of five** students reported a conflict or a remote-visibility problem. The fifth still checks by hand whether a PC is free.
>
> So today's manual process has three gaps. Remote use is invisible, approval status is hard to follow, and nothing stops two people from requesting the same PC at the same time.

## Slide 3: Users (0:50) · Product Owner

> The system has four roles sharing one calendar. **Students** view availability, request PCs, and can cancel their own future bookings. **Technicians** do the first review and manage PC inventory. **Advisors** review their own students. The **Dean** gives the final decision and manages users and roles.
>
> The approval path depends on who is booking, and it's enforced in PostgreSQL, not the UI. A Student's request goes through all three reviewers. A Dean's booking is approved immediately if the PC is free.
>
> To be honest, the interviews support availability, access mode and overlap prevention. The three-stage approval chain is an **institutional** requirement. The interviews did not validate it.

## Slide 4: Live demo (2:15) · Tech Lead

> Now let's see it live. I have four browser profiles signed in, one per role.
>
> **[1]** I sign in with Google as a new user, and I become a Student by default.
> **[2]** This is the calendar. You can see week and day occupancy and whether each booking is onsite or remote. No names or private details are shown.
> **[3]** As a Student, I book a one-day lab slot. I can also book a multi-day remote range. If I try to pick a time in the past, it's blocked.
> **[4]** Now I request the same PC at the same time again, and **the database rejects it**.
> **[5]** I switch to the Technician and approve, then the Advisor, then the Dean. The status updates at each step, and every decision is written to the audit log.
> **[6]** Finally, I sign out. Profiles, PCs and the calendar now return nothing.
>
> Overall, **18 of our 28 MUST stories are Done**. Two more work in code but still need hosted configuration. The remaining eight are planned security items.

*(If the demo fails, describe the steps out loud and move on. Don't spend more than 2:30 here.)*

## Slide 5: Test results (0:50) · QA

> We re-ran every automated check today, the 16th of November. The frontend unit tests pass **8 out of 8**. ESLint and schema lint show zero errors, and the dependency audit found no known vulnerabilities across 238 dependencies.
>
> The database tests pass **103 out of 108**. We traced all five failures to **one root cause**. Those tests book PC-04, but our seed data now marks PC-04 as under maintenance. So the database is *correctly refusing* the booking. This is test data that drifted, not a product defect. The fix is to point the test at an available PC.

## Slide 6: Before vs after (0:40) · QA

> Here is the before and after. **Double booking:** before, nothing could reliably stop it. Now a PostgreSQL exclusion constraint blocks it, even under concurrent requests. **Remote use:** now visible on the calendar. **Approval status:** tracked states plus an audit event for every decision. **Booking in the past:** blocked in the form *and* by a database trigger. **Privacy:** other users can't see name, email, ID or purpose. **Anonymous access:** production returns HTTP 401. Every row cites a source file in our repository.

## Slide 7: Defects and security (0:40) · QA

> We logged **6 bugs**. Four are fixed, each with a commit hash, and two are still open, both about hosted migration history. Our security review found **zero critical issues**: no account takeover, no SQL injection, no XSS, no role escalation. It did find **five high-severity design risks**, shown here: no university email domain enforcement yet, no MFA for privileged actions, no booking quotas, self-declared IDs for non-Lamduan accounts, and no way to suspend users. All five are in the backlog as B24 to B28 and must be done before broad rollout.

## Slide 8: Where we used AI (0:40) · AI Lead

> We used AI in every SDLC phase. Lovable gave us the starting frontend template, which we then cleaned up. A requirement-writer agent turned our pain notes into a traced spec. Claude Code drafted our draw.io diagrams. A read-only diagram-checker and an audit-backlog skill check that the spec, diagrams and backlog agree. Claude also co-authored the Student-ID auto-fill.
>
> But **before** we gave AI any tasks, we wrote rules. CLAUDE.md has six binding rules. Never fabricate research. The database is the security boundary. Compliance conflicts must be flagged. Ask instead of guessing. And agents get only the tools they need, so the checker has no edit tool on purpose.

## Slide 9: Proving and measuring (0:45) · AI Lead

> We checked AI output instead of trusting it, in four ways. **Traceability:** every spec item cites a backlog ID, and every pain cites a real interview. **Independent tests:** AI-written SQL must pass the same 108 assertions as everything else. **Human merge:** a named team member reviews and commits every AI change. **Honest gaps:** the AI-written spec itself says the approval chain wasn't validated.
>
> Here are the measurements. **5 of 40 commits** carry a Claude co-author trailer. We built **3** reusable AI workers and **2** AI-drafted diagrams, and we have **zero** fabricated findings. We didn't time tasks with and without AI, so we don't claim any hours saved.

## Slide 10: Roles (0:25) · Product Owner

> Here's who did what. Zaw Phyo Aung handled scope, interviews and the backlog. Sai Shang Hlang built the architecture, migrations and overlap constraint. Nay Win Aung led the AI rules and agents. Su Yee Mon Thein owned tests, the bug log and the security review. Chan Nyein Moe did the design system, journeys and diagrams. The commit counts at the bottom come straight from git.

## Slide 11: Lessons learned (0:40) · Designer

> Five lessons for the next team. **One:** put rules in the database. A check in the UI alone can be bypassed through the API. **Two:** keep test data in sync with the seed, as today's five failures showed. **Three:** docs drift faster than code. Our known-issues file still says cancellation is missing, but it's done. **Four:** research only proves what you asked. We interviewed only Students, so the other roles still need interviews. **Five:** give AI rules and limited tools *before* you give it tasks.

## Slide 12: AI disclosure (0:25) · AI Lead

> For full transparency, this table lists every AI tool we used, what it produced, and who was responsible for it. That includes this deck: Claude compiled it from our repository files, and the team checked every number. The interview findings, the workflow decisions and the approval policy were **not** generated by AI.

## Slide 13: Questions (0:15) · Product Owner

> Our next steps: fix the PC-04 test fixture, repair the hosted migration history, then finish security items B24 to B28. Thank you. We're happy to take questions.

---

**Total: about 10:00.** If you run long, shorten slides 6 and 10 first, since the audience can read them.

**Likely question to prepare for:** slide 9 says "5 / 40 commits," but the numbers on slide 10 add up to 52.
They probably count different things: slide 10 uses `git shortlog --all`, so it includes every branch. Be ready to
explain the difference, or make the two numbers match before you present.
