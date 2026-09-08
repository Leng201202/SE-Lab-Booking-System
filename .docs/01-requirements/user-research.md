# User research — interview guide & findings

Backs the gate's pass criterion: **≥ 5 real users interviewed so far
(final target for the month: ≥ 15)**. These must be real students/teachers
who actually use — or would use — the SE lab. Do not fabricate entries;
an empty row is honest, a made-up one isn't.

## Discussion guide (use for every interview)

1. Walk me through the last time you needed a lab computer. What did you do?
2. Has a computer you were using (or had reserved) gotten taken by someone
   else? What happened?
3. Do you ever use a lab computer remotely (SSH, remote desktop, leaving a
   job running) without sitting at it? How do you make sure no one takes it?
4. How do you currently know whether a computer is free before walking over?
5. If you could see a live map of "who's using what, onsite or remote,"
   would you check it before booking? Before walking to the lab?
6. What would make you *not* trust a booking system enough to rely on it?
7. Anything about booking/scheduling a lab computer that's still annoying
   even with a tool like this?

## Findings log

Fill one row per interview. `Pain confirmed?` should map to a specific
backlog item in [backlog.md](backlog.md) so every requirement traces back
to a real user pain.

| # | Date | Name / role (student or teacher) | Key pain described | Pain confirmed? (which problem from the proposal) | Traces to backlog item |
|---|---|---|---|---|---|
| 1 | 7 Sep 2026 | Student 1 | Someone may close the computer while it is being used remotely | Yes — remote computer use is not visible | Show remote-use status |
| 2 | 8 Sep 2026 | Student 2 | Cannot easily know if someone is using the computer remotely | Yes — remote usage is unclear | Show remote-use status |
| 3 | 8 Sep 2026 | Student 3 | Someone may take the computer they planned to use | Yes — conflict over computer usage | Computer reservation |
| 4 | 8 Sep 2026 | Student 4 | Someone may take the computer they planned to use | Yes — conflict over computer usage | Computer reservation |
| 5 | 8 Sep 2026 | Student 5 | No major issue yet, but still needs to check if a computer is free | Partly — computer availability is still important | Show computer availability |
| 6 | | | | | |
| 7 | | | | | |
| 8 | | | | | |
| 9 | | | | | |
| 10 | | | | | |
| 11 | | | | | |
| 12 | | | | | |
| 13 | | | | | |
| 14 | | | | | |
| 15 | | | | | |
## Summary

> 5 interviews to date. Core pattern: **remote computer use is invisible**
> (rows 1–2) — a machine in remote use looks free, so it can be taken/closed
> by someone else. A second recurring pain is **conflict over reserved
> computers** (rows 3–4). Row 5 confirms availability-checking matters. These
> map to backlog B4/B5 (onsite/remote + who's using it), B3/B6/B7
> (reserve/conflict), and B2/B8 (availability). Proposed stories B11–B13 have
> **no interview support yet**.
>
> TODO (team): extend this summary with a concrete quote once a participant
> gives one, e.g. "we lost 40 minutes of a deadline because our remote
> session got taken", and confirm the source row.
