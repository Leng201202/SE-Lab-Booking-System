---
name: audit-backlog
description: Checks traceability between spec files (F/NFR/LR items) under .docs/01-requirements/01-spec/, the product backlog (.docs/01-requirements/backlog.md), and real findings (.docs/01-requirements/user-research.md) / compliance rules (.docs/03-compliance/rule.md). Use when requirements, backlog rows, or spec items have changed, or when asked to audit/check traceability. Reports gaps with file and line; never silently merges, edits, or invents a traceability link.
---

# Audit backlog traceability

This project keeps requirements traceability across four files rather than one combined
document:

- `.docs/01-requirements/user-research.md` — real findings (#1–#5 today). The source of truth
  for pains; nothing may claim a pain that isn't recorded here.
- `.docs/01-requirements/backlog.md` — user stories with an ID (`B1`, `B2`, …), a priority, a
  status, and a `Source` column citing a research finding or institutional requirement.
- `.docs/01-requirements/01-spec/*.md` — formal specs with `F` (functional), `NFR`
  (non-functional), and `LR` (legal) items, each citing the backlog ID(s) and/or rule.md row(s)
  it traces to.
- `.docs/03-compliance/rule.md` — the compliance register (Enforced / Planned / Operational /
  Policy pending rules).

## What to check

Run through every spec file under `.docs/01-requirements/01-spec/`:

1. **Every `F`/`NFR`/`LR` item cites something real.**
   - An `F` item's `→ B#` must point to a backlog ID that actually exists in backlog.md.
   - An `LR` item's text and status must match what rule.md actually says for that rule — flag
     any LR item whose quoted status has drifted from rule.md (e.g. spec says "Enforced" but
     rule.md now says "Planned").
   - A `P` (pain) item must map to a real finding number in user-research.md — flag any P item
     that doesn't correspond to a recorded finding.

2. **Every `Must`-priority spec item has backlog coverage.** If an `F` item is marked `Must` but
   its `→ B#` trace is missing or points to a backlog row that doesn't exist, that's a gap.

3. **Backlog rows citing "Research #N" match a real finding.** Cross-check every backlog `Source`
   column value of the form `Research #N` against user-research.md's findings log — flag any `N`
   that doesn't exist there.

## Reporting

For each gap found, report:

- **File and line** (or table row) where the gap is.
- **What's missing or inconsistent** — be specific (e.g. "F7 cites → B99, no such backlog ID"
  rather than "trace is broken").
- **Do not auto-fix.** Report only. A human (or a separate, explicit edit) decides how to
  resolve each gap — this skill never merges, renumbers, or silently backfills a missing trace.

If no gaps are found, say so explicitly rather than staying silent — "0 gaps found across N
spec items" is a valid, useful result.
