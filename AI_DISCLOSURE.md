# AI Use Disclosure — SE Lab PC Booking System

This document states how generative AI tools have been used in building the SE Lab PC Booking System, a Software Engineering laboratory PC booking project at Mae Fah Luang University. It covers the repository's code, database migrations, tests, and documentation.

Last reviewed: 16 November 2026

## Summary

- The team used AI coding assistants to help draft code, SQL migrations, tests, and documentation.
- Every AI-assisted change was reviewed, edited where needed, and committed by a named team member, who remains responsible for it.
- The running application has **no AI features**. It does not send booking, profile, or any other user data to an AI service.

## Tools and evidence in this repository

| Tool / artifact | How it was used | Evidence |
|---|---|---|
| Claude (Anthropic), including Claude Sonnet | Drafting and revising code, migrations, and documentation | Commits with a `Co-Authored-By: Claude …` trailer, e.g. `704f750` (Lamduan Student ID auto-fill migration and profile/booking changes) and `d1d5f54` (proposal update) |
| AI coding agents (general) | Following project architecture and safety rules when generating changes | [`agent.md`](agent.md) — the contributor and agent guide |
| Agent skill: `supabase-postgres-best-practices` | Supplying Supabase/PostgreSQL guidance to the coding agent | [`skills-lock.json`](skills-lock.json) (source: `supabase/agent-skills`) |

Team members who used other AI tools (for example ChatGPT or GitHub Copilot) for this project should add them to this table.

## Where AI assistance was used

- **Frontend (`app/`)**: drafting React components, form validation, translations, and layout fixes.
- **Database (`supabase/`)**: drafting migrations, RLS policies, RPC functions, and pgTAP tests.
- **Documentation (`.docs/`, `README.md`, `plan.md`)**: drafting and editing requirements, design, compliance, and user-guide text.

## What AI was not used for

- **User research**: interview records in `.docs/01-requirements/user-research.md` must reflect real participants. AI must not invent interviews, quotes, or findings.
- **Role, security, and legal decisions**: who may hold Technician, Advisor, or Dean roles, and final privacy/legal approval, belong to the team, supervisor, and university data owner.
- **The running system**: no AI model makes booking, approval, or user-management decisions.

## Human oversight

AI output is treated as a draft, not as authoritative. Before merging, contributors are expected to:

1. Read and understand every AI-generated line they commit.
2. Run the project checks listed in the [README](README.md#checks) (lint, unit tests, build, Supabase reset, pgTAP tests, schema lint).
3. Check security-sensitive changes such as RLS policies, `security definer` functions, grants, and authentication flows against the rules in `agent.md` and `.docs/03-compliance/`.
4. Correct or remove any AI output that is wrong, insecure, or does not match the real requirements.

The listed authors of each commit are accountable for its content, whether or not AI helped write it.

## Data handling when using AI tools

Contributors must not paste the following into any AI tool:

- secrets: Google OAuth client secrets, Supabase secret or `service_role` keys, database passwords, or `.env` files
- real user data from production: names, emails, university IDs, or booking records
- interview notes or consent records that are kept outside this public repository

## How to disclose future AI-assisted work

- Add a `Co-Authored-By:` trailer naming the AI tool to commits where AI generated a substantial part of the change, for example:

  ```text
  Co-Authored-By: Claude <noreply@anthropic.com>
  ```

- Mention significant AI assistance in the pull request description.
- Update this file when a new AI tool, agent skill, or AI workflow is introduced.

## Academic integrity

This project follows the AI-use rules of the course and Mae Fah Luang University. Where those rules require more detail than this file gives (for example, prompt logs or per-feature statements), the team will provide it on request.
