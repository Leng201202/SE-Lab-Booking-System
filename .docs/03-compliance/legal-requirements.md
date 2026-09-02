# Legal and Institutional Requirements Register

## Important Limitation

A previous project's compliance-rule example was supplied on 2 September 2026. The cited Acts were checked against official MDES and ETDA materials and adapted in [rule.md](rule.md), but jurisdictional facts, the responsible university data owner, institutional policies, and system-specific applicability are still unconfirmed. This register therefore keeps the requirements **To Be Validated** until an authorized human reviewer approves them.

Do not treat the existence of an Act as proof that every section applies to this system. Record the relevant provision, system-specific applicability reasoning, reviewer, and approval date.

## Context to Confirm Before Research

| Question | Current value |
|---|---|
| Institution and responsible organization | Pending Week 2 research |
| Applicable jurisdiction(s) | Thailand assumed from supplied Week 2 example; confirm with university |
| System/data owner | Pending stakeholder confirmation |
| Hosting and data location | Pending design decision |
| Identity provider | Pending stakeholder confirmation |
| Categories of users/data subjects | To Be Validated |
| Whether research/interview data enters the product | Not proposed; confirm |

## Candidate Legal/Policy Topics

These IDs are placeholders for research. A topic is not an obligation until its row contains a verified source and approval.

| Legal ID | Topic to investigate | Authoritative source/citation | Applicability analysis | Candidate system requirements | Status |
|---|---|---|---|---|---|
| LR-01 | Transparency, purpose, and lawful basis for account/booking data | [PDPA B.E. 2562 — official MDES publication](https://www.mdes.go.th/content/download-detail/4240) | Relevant if the system processes identifiable student/staff data; university role and lawful basis pending | REQ-019 | To Be Validated |
| LR-02 | Data minimization and access authorization | [PDPA B.E. 2562 — official MDES publication](https://www.mdes.go.th/content/download-detail/4240) | Likely relevant; exact fields, roles, and approved purposes pending | REQ-016, REQ-019, REQ-020 | To Be Validated |
| LR-03 | Visibility of booking identity, purpose, and schedule | [PDPA B.E. 2562 — official MDES publication](https://www.mdes.go.th/content/download-detail/4240) | Public disclosure is not proposed; institutional operational access pending | REQ-006, REQ-009, REQ-010, REQ-020 | To Be Validated |
| LR-04 | Retention, deletion, and data-subject request process | [PDPA B.E. 2562 — official MDES publication](https://www.mdes.go.th/content/download-detail/4240) | Retention schedule and request owner pending | REQ-020 | To Be Validated |
| LR-05 | Security and personal-data breach response | [PDPA B.E. 2562 — official MDES publication](https://www.mdes.go.th/content/download-detail/4240) | Institutional security and incident procedures pending | REQ-016, REQ-020 | To Be Validated |
| LR-06 | Accessibility requirements or institutional standards | Pending Week 2 research | Pending | REQ-003, REQ-006, REQ-009 | To Be Validated |
| LR-07 | Computer traffic/user-data retention | [Computer-Related Crime Act B.E. 2550, amended B.E. 2560 — official MDES publication](https://www.mdes.go.th/law/detail/3618-) | Whether the operator is an in-scope service provider and which notification applies are pending | REQ-001, REQ-016, REQ-020 | To Be Validated |
| LR-08 | Electronic records/signatures | [Electronic Transactions Act B.E. 2544, amended — official ETDA publication](https://www.etda.or.th/getattachment/f2c20e25-bcd4-4920-a7b0-b6c350833c43/Electronic-Transactions-Act-B-E-2544-%28Amendment%29.aspx) | Current booking confirmation is not a signature; reassess only if scope changes | No current requirement | Not triggered by current scope |

## Verified Requirement Template

Copy this section for each obligation only after research.

```markdown
### LR-XX — <Verified requirement title>

- Jurisdiction/policy owner: Pending Week 2 research
- Authoritative source title: Pending Week 2 research
- Issuing body: Pending Week 2 research
- Exact provision/section: Pending Week 2 research
- Official URL or controlled document reference: Pending Week 2 research
- Accessed/effective date: Pending Week 2 research
- Applicability to this system: Pending review
- Required behavior or constraint: Pending review
- Related system requirements: REQ-XXX
- Related backlog/features/design: BL-XXX / FT-XX / DS-XX
- Evidence reviewer and date: Pending
- Status: To Be Validated
```

Avoid copying long legal text. Cite the authoritative source, paraphrase the requirement carefully, and preserve only the minimum excerpt needed for review.

## Research and Approval Workflow

1. Confirm the institution, data owner, jurisdiction, hosting context, and applicable policy set.
2. Use current official legislation, regulator guidance, and university policy sources.
3. Record exact citations and effective/access dates.
4. Explain why each source applies or does not apply to this university project.
5. Translate each confirmed obligation into one or more testable system requirements.
6. Add the links to [traceability.md](../01-requirements/traceability.md#legal-to-system-traceability).
7. Obtain review by the lecturer, supervisor, data owner, or other authorized institutional contact as appropriate.
8. Revise backlog, features, prototype, and diagrams when the requirement changes design.

## Interim Design Safeguards — Not Legal Conclusions

Until the review is complete, the prototype should avoid unnecessary personal data; hide other users' identities from public availability; use role checks for administrative views; keep hardware and room data sourced from approved inventory; and avoid defining retention, consent, or audit behavior without evidence. These are cautious design hypotheses and remain subject to Week 2 findings.

## Completion Checklist

- [ ] Applicable jurisdiction and institution policies confirmed
- [ ] Each legal ID has an authoritative, current source
- [ ] Applicability reasoning reviewed
- [ ] Each confirmed obligation maps to testable system requirement(s)
- [ ] Requirements map onward to backlog, feature, and design IDs
- [ ] Privacy/security/accessibility decisions reflected in prototype and diagrams
- [ ] Reviewer and review date recorded

Current legal-trace status: **INCOMPLETE — production readiness gate cannot pass.**
