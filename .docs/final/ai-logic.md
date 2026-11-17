# AI logic: Where, How, Prove, Measure

**Product:** SE Lab PC Booking System · **Live URL:** <https://se-lab-booking-system.vercel.app/>
**Owner:** Nay Win Aung (AI Lead) · **Evidence cutoff:** 17 November 2026, `main` at `8a51bb1`

> **The running system has no AI feature.** There is no AI library, model, or API call in `app/` or `supabase/`. No booking, approval, or user-management decision is made by AI, and no user data is sent to an AI service. AI was used only to help **build** the system. So there is no in-product model, training data set, accuracy score or bias check to report. This document covers AI-assisted development.

See also: [AI_DISCLOSURE.md](../../AI_DISCLOSURE.md).

---

## 1. Where AI was used

| Area | What AI helped with | Example evidence |
|---|---|---|
| Frontend (`app/`) | React components, form validation, translations, layout fixes | `704f750` — Student ID auto-fill from Lamduan email and booking gate |
| Database (`supabase/`) | Drafting migrations, RLS policies, RPC functions, pgTAP tests | Reviewed under `agent.md` rules |
| Requirements & design (`.docs/`) | Spec, proposal update, draw.io diagrams | `b4614f4` (spec, agents, skill), `d1d5f54` (proposal), `a2a46c6` and `abea331` (diagrams) |
| Presentation | Slide-by-slide script | `e8284fb`, `73ba375` |
| Early exploration | A Lovable prototype to explore UI ideas (not shipped) | Presentation script, slide 8 |

**Where AI was not used:** user interviews and findings, role/security/legal decisions, final approval, and any decision inside the running product.

## 2. How AI was used

**Tools:** Claude (Anthropic) for drafting and revising code, SQL and documents; Lovable for early UI exploration.

**Controls the team built:**

| Control | What it does | Where |
|---|---|---|
| `CLAUDE.md` | Rules for any AI agent: `rule.md` is binding; the database is the security boundary; never invent research; ask instead of guessing; don't duplicate docs | branch `docs/discover-package` |
| `agent.md` | Architecture and safety rules for contributors and agents (RLS, `security definer` with `set search_path = ''`, new migration per change) | `main` |
| Agent `requirement-writer` | Turns pain notes into a spec; every item must cite a real finding (#1–#5) or backlog ID | `.github/agents/`, branch `docs/discover-package` |
| Agent `diagram-checker` | Read-only: reports mismatches between spec, journeys and diagrams; has no edit tool | `.github/agents/`, branch `docs/discover-package` |
| Skill `audit-backlog` | Checks traceability between spec, backlog, research and `rule.md`; reports gaps, never invents links | `.claude/skills/`, branch `docs/discover-package` |
| Skill `supabase-postgres-best-practices` | External Supabase/PostgreSQL guidance for the coding agent | [skills-lock.json](../../skills-lock.json) |

**Workflow:**

```text
Human writes the task  →  AI drafts (inside CLAUDE.md / agent.md rules)
→ human reads every line  →  lint + unit tests + build (+ pgTAP when available)
→ security-sensitive changes checked against agent.md and .docs/03-compliance/
→ human commits; AI-heavy commits carry a "Co-Authored-By: Claude" trailer
```

**Data rule:** no secrets, `.env` files, production user data or interview notes are pasted into AI tools.

## 3. Prove

AI-assisted code is held to the same tests as human code. The proof has three parts.

### Test set

| Test set | Size | What it covers | File |
|---|---|---|---|
| Frontend unit tests | 11 tests | Safe data mapping, Bangkok date limits, next free slot, cancellation eligibility, Advisor request parameters | `app/src/features/bookings/bookingService.test.js` |
| Database pgTAP suite | 147 assertions (106 + 14 + 27) | RLS, role boundaries, workflow stages, overlap rejection, Student ID security, Advisor selection, future start, account recovery | `supabase/tests/database/001–003` |
| Lint + build | — | Code style and a working production bundle | `npm run lint`, `npm run build` |

### Baseline

The browser-only demo at commit `516bb12` (15 Sep 2026), before the Supabase backend: mock users, `localStorage`, 6 Node tests, 0 database assertions, 0 RPC calls.

### Eval script and logs

| File | What it shows |
|---|---|
| [evidence/measure.sh](evidence/measure.sh) | Script that recomputes every number in this file and in the comparison table from git |
| [evidence/measure-log.txt](evidence/measure-log.txt) | Output of that script on 17 Nov 2026 |
| [evidence/frontend-tests-current.log](evidence/frontend-tests-current.log) | Current `main`: **11 / 11 pass**, lint clean |
| [evidence/frontend-tests-baseline-516bb12.log](evidence/frontend-tests-baseline-516bb12.log) | Baseline: **6 / 6 pass** |

**Limitation:** the pgTAP suite was **not** rerun for this report. The local Supabase stack could not start because its Docker images could not be downloaded in the test environment. The 147 assertions are *defined*, not *proven passing*. Replace this note with a dated `npm run supabase:test --prefix app` log once it runs.

### Specific proofs

- `704f750` (AI-assisted Student ID feature) is covered by the Student ID security assertions in `001_booking_security.test.sql` and by the frontend booking gate.
- The `diagram-checker` agent is read-only by design (tools: `read`, `search`), so it can report but not change diagrams.
- All 5 research findings in `user-research.md` are real interviews. The AI rules forbid adding to them.

## 4. Measure

Reproduce with `bash .docs/final/evidence/measure.sh`.

| Metric | Value (17 Nov 2026) | How measured |
|---|---|---|
| Commits with a `Co-Authored-By: Claude` trailer | **7 of 65** unique commits across all refs (≈ 11%) | `git log --all -i --grep='Co-Authored-By: Claude'`; `git rev-list --all --count` |
| Reusable AI workflows built | **3** (2 agents + 1 skill) | Files on `docs/discover-package` |
| AI-assisted diagrams | **2** | `a2a46c6`, `abea331` |
| Frontend tests passing on code that includes AI-assisted changes | **11 / 11** (baseline 6 / 6) | `npm test --prefix app` logs |
| pgTAP assertions defined | **147** (baseline 0); pass rate not yet measured | `select plan(...)` in the three canonical test files |
| AI features in the running product | **0** | No AI library or API call in `app/` or `supabase/` |

**What these numbers do not show.** The trailer count is a lower bound: AI help without a trailer is not counted, and it measures disclosure, not code share or quality. We ran no controlled comparison of time with and without AI, so **we claim no time or productivity savings**.

> Note: the presentation script used a 16 Nov cutoff of "7 of 90" commits. A fresh clone on 17 Nov counts 65 unique commits across all remote branches (some branches may have been removed or the earlier count included local refs). The table above uses the reproducible 17 Nov figure.
