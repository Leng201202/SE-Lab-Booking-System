# Copilot instructions

This file mirrors [CLAUDE.md](../CLAUDE.md) at the repo root. Keep the two in sync — if you
update one, update the other in the same change.

## What this project is

**SE Lab PC Booking System** — a role-based booking system for the School of Applied Digital
Technology's SE lab computers at Mae Fah Luang University. Students, Technicians, Advisors, and
the Dean share one live, privacy-preserving calendar; a Student request moves through
Technician → Advisor → Dean review before it is approved, with overlap-safe scheduling enforced
in the database.

## Folder layout

- `app/` — the real, working frontend (React + Vite). This is the prototype; there is no
  separate mockup. See [.docs/02-design/prototype.md](../.docs/02-design/prototype.md).
- `supabase/` — database migrations (`supabase/migrations/`), local config, seed data, and
  pgTAP database tests (`supabase/tests/database/`). Schema and policy changes are only ever
  made by adding a new migration file — never by editing an applied one.
- `.docs/` — the project's documentation package:
  - `01-requirements/` — proposal, user research, backlog, and (`01-spec/`) formal specs.
  - `02-design/` — feature list, user journey, design system, diagrams, prototype notes.
  - `03-compliance/` — [rule.md](../.docs/03-compliance/rule.md) (the compliance register),
    legal requirement trace, security review.
  - `04-user-guide/`, `05-testing/` — user manual, known issues.
- `.github/agents/` — custom agents for this repo (requirement-writer, diagram-checker).
- `.claude/skills/` — Claude Code skills for this repo (audit-backlog).

## Rules to always follow

1. **Treat [.docs/03-compliance/rule.md](../.docs/03-compliance/rule.md) as binding.** Every
   `Enforced`/`Must` rule in it — PDPA data-minimization, the Computer-Related Crime Act
   retention questions, Electronic Transactions Act record-status caveats, RLS/grant
   boundaries — reflects a real decision already made for this project. Do not propose or
   implement anything that contradicts it without flagging the conflict first.
2. **The database is the security boundary, not the frontend.** Route guards and disabled
   buttons in `app/` are usability features only; authorization lives in PostgreSQL grants,
   RLS policies, and `security definer` functions with `set search_path = ''`.
3. **Never fabricate research, quotes, or findings.** [user-research.md](../.docs/01-requirements/user-research.md)
   is explicit: only the five recorded interview entries are real. Cite them by number: do not
   invent additional participants or pains.
4. **Use a skill or agent when a task matches one.** Check `.github/agents/` (or
   `.claude/skills/` for Claude Code) before freehanding a task one of them already covers.
5. **Ask instead of guessing.** When a requirement, legal rule, or design decision is
   ambiguous or unconfirmed, stop and ask — offering concrete options — rather than assuming.
6. **Don't duplicate existing docs.** Before adding new requirements/design documentation,
   check `.docs/` for an existing file covering the same ground and extend or cross-reference
   it instead of creating a parallel, drifting copy.
