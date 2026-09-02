# Legal & Compliance Rules for AI Coding Agents

**Product:** SE Lab Resource Booking System

**Description:** A centralized web system that lets Software Engineering students browse and reserve shared SE Lab resources: High-Performance PCs, iMacs, Standard PCs, and Meeting Rooms. Administrators may manage verified resource information, maintenance status, and approved booking operations.

**Applies to:** Any AI coding agent (for example, Codex, Claude, Copilot, or Cursor) generating, modifying, reviewing, or documenting this product.

**Group:** FLUX

**Written by:**

| Name | Student ID |
|---|---|
| Sai Shang Hlang | 6631503129 |
| Nay Win Aung | 6631503080 |
| Chan Nyein Moe | 6631503054 |
| Su Yee Mon Thein | 6631503086 |
| Zaw Phyo Aung | 6631503130 |

> **Document status:** DISCOVER-stage draft — legal applicability and university policy still require human review. These rules guide future implementation but do not authorize production coding before the User Validation Gate passes. This document is not legal advice.

---

## 1. PDPA — Personal Data Protection Act B.E. 2562 (2019)

**What it is:** Thailand's PDPA regulates the collection, use, and disclosure of personal data. Relevant topics for this system include having an applicable lawful basis, informing users, collecting only necessary data, protecting it, supporting applicable data-subject rights, controlling disclosure and cross-border transfer, retaining data only as justified, and responding to personal-data breaches.

**Official source:** [Ministry of Digital Economy and Society — Personal Data Protection Act, B.E. 2562 (2019)](https://www.mdes.go.th/content/download-detail/4240)

**Agent rules:**

1. If the system collects a student's or administrator's name, student/staff identifier, contact details, university-account identifier, booking purpose, or usage history, the agent must map each field to a documented purpose and candidate requirement before adding it to the data model.
2. The agent must not assume that consent is always the correct lawful basis. The university or authorized data owner must identify and approve the applicable basis for each processing purpose before production implementation.
3. When personal data is collected, the system must present the approved privacy information at or before collection. The notice content, owner/controller identity, purposes, recipients, retention, contact channel, and applicable rights must come from authorized university or legal review.
4. Public or student-facing availability views must not reveal another user's name, student ID, contact information, or booking purpose. They should show only the minimum schedule information needed to communicate that a resource is unavailable.
5. The current scope does not require sensitive personal data. The agent must not add health, disability, biometric, religious, criminal-record, or other sensitive fields without a separately validated purpose, applicable legal basis, explicit access rules, and human compliance approval.
6. The system must enforce least-privilege access. Students may access their own booking details; administrators may access only the personal information required for approved lab operations; unauthorized users must not gain access through the UI, API, export, logs, or error messages.
7. The system design must support an approved process for applicable requests to access, correct, delete, restrict, object to, or export personal data. The agent must not promise automatic deletion where another approved obligation requires retention; such exceptions must be recorded and reviewable.
8. Personal data and booking history must not be retained indefinitely. The agent must implement only a documented retention schedule approved by the data owner and must support deletion, anonymization, or restricted archival when that schedule expires.
9. If data is disclosed to another university unit, service provider, analytics service, or notification provider, the system must disclose only approved fields for an approved purpose and record the disclosure or integration where policy requires it.
10. The agent must not select an overseas hosting region or enable an international transfer of personal data until the data owner has approved the location and any required transfer safeguards.
11. Personal data must be protected in transit and at rest using approved controls. Secrets must not be committed to the repository, personal data must not appear in ordinary debug output, and production data must not be copied into development or test fixtures.
12. The system must support human-led incident assessment and breach handling. Where the approved PDPA process requires notice to the regulator or affected people, logs and incident records must allow the responsible team to meet the applicable deadline, including the statutory “without delay and, where feasible, within 72 hours” standard for regulator notification when the legal conditions are met.

**Related system requirements:** REQ-006, REQ-009, REQ-010, REQ-016, REQ-019, REQ-020.

**Current status:** Applicability is expected but the university data owner, lawful bases, privacy notice, retention schedule, and institutional procedure are **To Be Validated**.

---

## 2. Computer-Related Crime Act B.E. 2550 (2007), as amended by B.E. 2560 (2017), Section 26 — Traffic and User Data Retention

**What it is:** Section 26 requires an in-scope service provider to retain computer traffic data for at least 90 days. For a particular case, a competent official may order retention beyond 90 days for no more than two years. It also addresses retaining user-identification data. The applicable Ministerial notification determines which types of service provider are covered and how the rule applies.

**Official source:** [Ministry of Digital Economy and Society — Computer-Related Crime Act, including the B.E. 2560 amendments](https://www.mdes.go.th/law/detail/3618-)

**Agent rules:**

1. The agent must not assume that every web application is automatically a “service provider” subject to Section 26. The university or authorized legal/security reviewer must document whether this system and its operator are in scope under the Act and applicable Ministerial notification.
2. If the system is confirmed in scope, the agent must implement the approved traffic-data and user-identification fields, event coverage, time source, and retention start point defined by the university's compliance specification.
3. If the 90-day minimum applies, automated rotation or deletion must not remove covered logs before 90 days have elapsed.
4. The retention design must support a lawful, case-specific preservation order beyond the normal period for up to two years without requiring a destructive migration or mixing held records with ordinary deletion jobs.
5. Covered traffic and access logs must be protected from unauthorized alteration. Application administrators must not receive a normal UI or API operation that edits or silently deletes those records.
6. Administrative security-relevant actions—such as changes to roles, resource status, verified specifications, or another user's booking—must be auditable if required by the approved security and compliance specification.
7. Log access must be restricted to approved roles. Since user IDs and source/network data may be personal data, logs must not be shown in public views, normal student functions, routine analytics, or error responses.
8. If a lawful request is approved by the responsible university authority, the system must support a scoped export for the authorized user/date/event range without exposing unrelated records. Integrity evidence for the export must follow the approved procedure.
9. Log retention must balance any confirmed Computer-Related Crime Act minimum or preservation order with PDPA purpose limitation and retention controls. Records must not be kept longer merely because storage is available.
10. The agent must not invent detailed traffic-log fields, collection scope, or legal-hold procedures. Those details must be traced to the applicable notification and the university's approved operational process.

**Related system requirements:** REQ-001, REQ-016, REQ-020.

**Current status:** Act text reviewed; system/service-provider applicability and the applicable Ministerial notification are **To Be Validated**.

---

## 3. Electronic Transactions Act B.E. 2544 (2001), as amended — Electronic Records and Signatures

**What it is:** The Act recognizes electronic data and establishes conditions under which an electronic method can satisfy writing, original-record, or signature requirements. Section 9 addresses identification and approval of an electronic message; Section 26 describes characteristics of a reliable electronic signature; Sections 27–28 address responsibilities connected with signature data and certification services.

**Official source:** [Electronic Transactions Development Agency — Electronic Transactions Act, B.E. 2544, updated version](https://www.etda.or.th/getattachment/f2c20e25-bcd4-4920-a7b0-b6c350833c43/Electronic-Transactions-Act-B-E-2544-%28Amendment%29.aspx)

**Agent rules:**

1. A normal SE Lab booking confirmation is not an electronic signature and must not be described as a legally binding signature unless an authorized requirement explicitly changes its purpose.
2. The agent must not add a signature image, click-to-sign flow, OTP-signing flow, digital certificate, or certificate-authority integration to the current scope without validated stakeholder and legal requirements.
3. If a future workflow requires a legally significant electronic approval or signature, the signer must be authenticated and must perform an explicit action that clearly communicates what record is being approved.
4. The exact content approved must be bound to the signature or approval event, and later changes must be detectable using an approved integrity mechanism.
5. The system must retain the approved record and evidence needed to establish signer identity, intent, time, method, and record integrity for the approved retention period.
6. Signature credentials, private keys, OTPs, or reusable signature assets must never be exposed, logged, committed to source control, or applied by anyone other than the authorized signer.
7. If certificate-based signatures are required, the certification-service design and assurance level must be selected by qualified human reviewers; the agent must not claim a provider or technique is legally sufficient on its own.
8. A signature operation must be atomic: it must finish in a clear completed state or fail without leaving a partially signed or ambiguous record.
9. Any notice claiming that an electronic action has legal effect must use wording approved by the university/legal owner, not agent-generated legal language.
10. Verification and export functions must reveal only the information necessary to verify the approved record and must follow the PDPA access rules above.

**Related system requirements:** None in the current booking scope. Add and trace new requirements before introducing electronic-signature behavior.

**Current status:** **Not triggered by the current candidate features; monitor for scope changes.**

---

## 4. DISCOVER-Stage and Booking Integrity Rules

**What it is:** These are mandatory project controls and candidate booking safeguards. They keep an AI agent from turning unvalidated assumptions into production behavior.

**Agent rules:**

1. The agent must not generate production application code until the User Validation Gate is recorded as passed.
2. The gate requires at least 5 documented real-user interviews during the current DISCOVER stage, with a target of at least 15 during September 2026.
3. The agent must not invent interview responses, validated pain points, hardware specifications, legal citations, or lecturer-specific policies.
4. Every requirement marked `Validated` must trace through `User Pain → Requirement → Backlog → Feature → Design`, or originate from an approved legal/institutional obligation with equivalent traceability.
5. The resource hierarchy must remain `SE Lab Resource → Computer or Meeting Room`, with Computer divided into High-Performance PC, iMac, and Standard PC, unless validated evidence changes it.
6. For active bookings of the same resource, the candidate overlap rule is `existingStart < requestedEnd AND requestedStart < existingEnd`. The agent must apply the same rule to every computer category and meeting room.
7. A booking for one resource must not block a different resource solely because their time intervals overlap.
8. The eventual confirmation operation must check availability atomically so concurrent requests cannot both receive successful overlapping bookings for the same resource.
9. Only authorized administrators may change verified resource details, maintenance/unavailable status, roles, or other users' bookings.
10. Until actual inventory is approved, the agent must use `Replace with actual SE Lab specification` or `Not yet collected` instead of creating hardware, capacity, or equipment values.

**Current User Validation Gate:** **NOT PASSED — 0 completed interview records supplied; production coding remains blocked.**

---

## Enforcement Note for the Agent

When implementing or reviewing any future feature involving personal data, access/traffic logs, electronic approvals, authorization, resource status, or booking conflicts, the agent must:

1. Cite the applicable rule number and related requirement ID in the pull-request description, implementation plan, or review note.
2. Reject or flag any request that would expose another user's personal data, weaken conflict prevention, bypass authorization, or contradict an approved retention rule.
3. Flag to a human reviewer any uncertainty about legal applicability, lawful basis, retention, log scope, electronic-signature assurance, or university policy.
4. Keep unresolved items marked `To Be Validated`; an AI agent must never declare legal compliance or pass the User Validation Gate by itself.

## Source and Review Record

| Source | Issuer | Reviewed on | Applicability status |
|---|---|---|---|
| Personal Data Protection Act B.E. 2562 (2019) | Ministry of Digital Economy and Society / PDPC material | 2 September 2026 | To Be Validated by university data owner |
| Computer-Related Crime Act B.E. 2550, amended B.E. 2560 | Ministry of Digital Economy and Society | 2 September 2026 | Service-provider scope To Be Validated |
| Electronic Transactions Act B.E. 2544, as amended | Electronic Transactions Development Agency | 2 September 2026 | Not triggered by current candidate scope |

Final approval owner and date: **Pending university/supervisor review**.
