# Spec — Lab PC availability and booking (core workflow)

Written by the `requirement-writer` agent process on 4 October 2026. Traces to
[user-research.md](../user-research.md), [backlog.md](../backlog.md), and
[rule.md](../../03-compliance/rule.md) rather than duplicating them — this spec adds
IDs and priority on top of facts that already exist in those files.

## 1. Problem & Users

Three real pains, drawn only from the five recorded interview findings in
[user-research.md](../user-research.md) (do not add more without a recorded interview):

- **P1** — *Remote use is physically invisible.* "Someone may close a computer while it is
  being used remotely" (finding #1, Student 1). Affects: **Student**.
- **P2** — *Occupancy mode is unclear.* "It is difficult to know whether a computer is being
  used remotely" (finding #2, Student 2). Affects: **Student**.
- **P3** — *No reliable reservation.* "Someone may take the computer they planned to use"
  (findings #3 and #4, Students 3 and 4 — the same pain, independently reported twice).
  Affects: **Student**.

Finding #5 (Student 5: "no major incident, but they still need to check whether a computer is
free") is not a distinct pain — it corroborates the general need for a trusted availability
view underlying P1–P3, so it is not given its own P-number.

Per user-research.md's own findings summary: these five records validate the availability,
access-mode, booking, and overlap requirements below. They do **not** independently validate
the Technician/Advisor/Dean approval chain, trusted-role administration, or the legal/privacy
rules — those come from institutional workflow and compliance requirements instead, cited
directly from rule.md in §4.

## 2. Functional

| ID | Story | Priority | Backlog trace |
|---|---|---|---|
| F1 | As a Student, I want to view real-time availability across all managed PCs, so that I know which are free before going to the lab. | Must | → B2 |
| F2 | As a Student, I want to see whether an occupied PC is in onsite or remote use, so that I don't assume a remotely-used PC is free. | Must | → B2, B4, B5 |
| F3 | As a Student, I want to submit a booking request for a future time range on an available PC, so that I reserve it before someone else does. | Must | → B3, B4 |
| F4 | As a user, I want any booking that overlaps an existing active booking on the same PC rejected — even under concurrent submission — so that a reservation is actually reliable. | Must | → B9 |
| F5 | As a Student, I want my request reviewed by a Technician, then my assigned Advisor, then the Dean in order, so that institutional approval is enforced before a reservation is final. | Must | → B3, B7, B8, B34 |
| F6 | As any role, I want to cancel my own active future booking with a required reason, so that I can release a PC I no longer need. | Should | → B13 |

## 3. Non-functional

Each item is measurable — a time bound, a count, or a percentage — not a vague adjective.

| ID | Requirement | Source |
|---|---|---|
| NFR1 | One-day lab bookings are only creatable within 08:00–18:00, at 15-minute granularity, with zero tolerance for off-grid times. | rule.md, Booking and workflow rules |
| NFR2 | Overlap rejection holds for 100% of concurrent submission attempts against the same PC, enforced by a single PostgreSQL GiST exclusion constraint rather than application-level locking. | rule.md, "same PC cannot have overlapping active intervals" |
| NFR3 | The calendar read path (`get_booking_calendar`) returns zero unrelated-Student identity, purpose, course, or rejection fields to non-privileged roles. | rule.md, Privacy and data rules |
| NFR4 | An anonymous (signed-out) request against `profiles`, `bookings`, or PC inventory returns zero rows, enforced by RLS and table grants, not UI gating alone. | rule.md, "Anonymous users cannot read application tables" |

## 4. Legal

Every row below is copied verbatim (status included) from
[rule.md](../../03-compliance/rule.md) — scoped to the rules this spec's workflow actually
touches. See rule.md directly for the full compliance register (role administration, MFA,
PC management, infrastructure rules, etc. are out of scope for this spec).

| ID | Rule | Status |
|---|---|---|
| LR1 | Anonymous users cannot read application tables or calendar occupancy. | Enforced |
| LR2 | Calendar output exposes occupancy without unrelated Student identity, university ID, purpose, course, or rejection details. | Enforced |
| LR3 | The same PC cannot have overlapping active intervals, even under concurrent submission. | Enforced |
| LR4 | PDPA — the system processes identifiers and booking records and therefore requires a university-approved assessment of controller/processor roles, purpose, lawful basis, notice, security, rights handling, disclosure, and retention. | **Policy pending** |
| LR5 | Computer-Related Crime Act — whether the university/operator is an in-scope service provider and whether retention obligations apply must be determined by qualified review; this project does not infer that booking history satisfies any statutory obligation. | **Policy pending** |
| LR6 | Electronic Transactions Act — the application produces electronic booking records but does not present an approval as an electronic signature; institutional reliance requires separate legal review. | **Policy pending** |

LR4–LR6 are **not** resolved by this spec — they remain open university/legal decisions, exactly
as rule.md states. Do not treat them as satisfied because they are listed here.

## 5. Scope

**In scope:** real-time PC availability with access-mode visibility (F1–F2), future-dated
booking requests (F3), server-enforced overlap prevention (F4), the Technician → Advisor →
Dean approval chain for Student requests (F5), and self-service cancellation (F6).

**Explicitly out of scope** (already tracked as their own backlog rows — not re-specified here):
notifications (B17), recurring bookings (B19), rebook/edit (B14), privileged-operation MFA
(B25), domain-restricted signup (B24), duration/rate limits (B26).

**The one core workflow:** *A Student checks availability, submits a future booking on a free
PC, the request is reviewed in order (Technician → Advisor → Dean), and an approved booking
blocks that interval for everyone — visibly, regardless of whether it's used onsite or
remotely.*
