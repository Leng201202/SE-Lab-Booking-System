# User Interview Plan and Evidence Register

## Purpose

This document is the evidence source for validating or rejecting problem hypotheses and candidate requirements. **No interview responses have been supplied.** Empty records and prompts below are templates, not invented research.

## Validation Targets

| Target | Required | Documented now | Status |
|---|---:|---:|---|
| Real users interviewed during current DISCOVER stage | 5 minimum | 0 | Not met |
| Real users interviewed during September 2026 | 15 minimum | 0 | In progress |
| Validated requirements with pain evidence | 100% | N/A | No requirements validated yet |

Production coding is blocked until the User Validation Gate in the [proposal](../00-proposal/proposal.md#8-success-and-gate-criteria) is passed.

## Participant Plan

Recruit a diverse set of real participants. The proposed distribution is a planning guide, **To Be Validated**, not a completed sample.

| Proposed segment | Suggested minimum within 15 | Why include them |
|---|---:|---|
| Students using Standard PCs/iMacs | 4 | General development and coursework workflows |
| Students doing AI/ML or GPU-intensive work | 3 | High-performance resource selection and long-running work |
| Student project-team members | 4 | Meeting-room and group coordination workflows |
| SE Lab administrators or responsible staff | 2 | Availability, maintenance, policy, and oversight workflows |
| Lecturers/staff or other relevant users | 2 | Resource governance and missing stakeholder needs |

One participant may belong to more than one segment. Do not collect sensitive personal data that is unnecessary for this study.

## Interview Protocol

### Opening script

> We are studying how people currently find and use SE Lab computers and meeting rooms. We are testing our assumptions, not testing you. With your permission, we will take notes and use anonymized findings for our university project. You may skip a question or stop at any time.

Record consent according to the university-approved process. Do not record audio, names, student IDs, contact details, or other personal data unless the approved research process specifically permits it.

### Core questions

Ask neutral follow-ups based on the participant's answers.

1. Tell us about the most recent time you needed an SE Lab computer or meeting room.
2. How did you decide which resource to use?
3. How did you find out whether it was free?
4. What, if anything, made the process difficult or slow?
5. Have you encountered someone else using or planning to use the same resource? What happened?
6. Which computer details or room details mattered in that situation?
7. How did you coordinate a time with other people, if relevant?
8. What do you do when the preferred resource or time is unavailable?
9. How often does this situation occur, and what is its impact?
10. What current workaround do you use? What works well about it?
11. How would you expect cancellations, changes, maintenance, or no-shows to be handled?
12. Is there anything important about using SE Lab resources that we have not discussed?

Only after current behavior is understood, show the concept or prototype and ask:

13. What would you expect to happen on this screen?
14. Which information is missing, unnecessary, or unclear?
15. In what situations would you use or avoid this proposed system?

Avoid leading questions such as “Would a booking calendar solve your problem?”

## Interview Record Template

Copy this section once per real participant. Use anonymous participant IDs such as `P01`. A completed record must link to evidence stored in an approved project location.

```markdown
### Interview PXX

- Date/time: Pending User Interview
- Interviewer(s): Pending User Interview
- Participant segment: Pending User Interview
- Relevant resource experience: Pending User Interview
- Consent recorded: Pending User Interview
- Evidence location/reference: Pending User Interview

#### Recent behavior and context

Pending User Interview

#### Observed or stated pains

| Pain ID | Evidence summary (paraphrase) | Frequency | Impact | Confidence |
|---|---|---|---|---|
| UP-XX | Pending User Interview | Unknown | Unknown | Unvalidated |

#### Current workarounds

Pending User Interview

#### Reactions to proposed concept

Pending User Interview

#### Candidate requirements affected

Pending analysis after interview.

#### Contradictions, surprises, and follow-up questions

Pending analysis after interview.
```

## Interview Register

Do not change a row to `Completed` unless a real interview record and its evidence reference exist.

| Participant ID | Proposed segment | Date | Evidence reference | Status |
|---|---|---|---|---|
| P01 | Pending recruitment | — | — | Pending User Interview |
| P02 | Pending recruitment | — | — | Pending User Interview |
| P03 | Pending recruitment | — | — | Pending User Interview |
| P04 | Pending recruitment | — | — | Pending User Interview |
| P05 | Pending recruitment | — | — | Pending User Interview |
| P06 | Pending recruitment | — | — | Pending User Interview |
| P07 | Pending recruitment | — | — | Pending User Interview |
| P08 | Pending recruitment | — | — | Pending User Interview |
| P09 | Pending recruitment | — | — | Pending User Interview |
| P10 | Pending recruitment | — | — | Pending User Interview |
| P11 | Pending recruitment | — | — | Pending User Interview |
| P12 | Pending recruitment | — | — | Pending User Interview |
| P13 | Pending recruitment | — | — | Pending User Interview |
| P14 | Pending recruitment | — | — | Pending User Interview |
| P15 | Pending recruitment | — | — | Pending User Interview |

## Candidate Pain Register

These are hypotheses derived from the project brief. They are deliberately not presented as research findings.

| Pain ID | Candidate pain hypothesis | Evidence | Status |
|---|---|---|---|
| UP-01 | A student may not know which resources are available now or later. | Pending User Interview | To Be Validated |
| UP-02 | A student may arrive to find a resource in use or planned by someone else. | Pending User Interview | To Be Validated |
| UP-03 | A student may struggle to identify a computer with suitable hardware, OS, or software. | Pending User Interview | To Be Validated |
| UP-04 | A project team may struggle to find a meeting room with suitable capacity/equipment. | Pending User Interview | To Be Validated |
| UP-05 | Users may need a reliable way to change or cancel an intended use. | Pending User Interview | To Be Validated |
| UP-06 | Administrators may lack a consistent way to communicate maintenance/unavailability. | Pending User Interview | To Be Validated |
| UP-07 | Administrators may need oversight of resource records and bookings. | Pending User Interview | To Be Validated |
| UP-08 | Users may be uncertain whether a booking succeeded or what its details are. | Pending User Interview | To Be Validated |

## Synthesis and Validation Rules

After each interview:

1. Add a factual, anonymized interview record and evidence reference.
2. Create or update pain IDs without turning assumptions into participant quotes.
3. Note supporting and contradicting evidence.
4. Link candidate requirements to pain IDs in [traceability.md](traceability.md).
5. Change a requirement to `Validated` only when the team records its validation decision and supporting real-user evidence.
6. Record rejected assumptions as `Invalidated` and revise dependent backlog/features/designs.

Suggested decision fields for every later validation decision:

| Field | Required content |
|---|---|
| Decision | Validated / Invalidated / Needs more evidence |
| Evidence | Participant IDs and approved evidence references |
| Reasoning | Pattern, severity, frequency, contradictions, and limitations |
| Date and reviewer | Actual project details |
