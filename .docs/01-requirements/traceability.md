# Discovery Traceability Matrix

## Purpose

This matrix maintains the required path:

```text
User Pain → Requirement → Backlog → Feature → Design
```

The links below describe candidate coverage, not validation. Every pain and requirement remains **To Be Validated** because no completed real-user interviews have been supplied.

## Candidate End-to-End Traceability

| Pain hypothesis | Requirement | Backlog | Feature | Design evidence | Validation status |
|---|---|---|---|---|---|
| UP-01 availability uncertainty | REQ-002, REQ-006, REQ-018 | BL-002, BL-006, BL-018 | FT-02, FT-06, FT-18 | DS-01, DS-02, DS-03, DGM-02, DGM-03 | To Be Validated |
| UP-02 overlapping/planned use uncertainty | REQ-007, REQ-008, REQ-009, REQ-017 | BL-007, BL-008, BL-009, BL-017 | FT-07, FT-08, FT-09, FT-17 | DS-03, DS-04, DS-05, DGM-03, DGM-04 | To Be Validated |
| UP-03 difficulty matching computer capabilities | REQ-003, REQ-004 | BL-003, BL-004 | FT-03, FT-04 | DS-01, DS-02, DGM-02, DGM-04 | To Be Validated |
| UP-04 difficulty matching meeting-room needs | REQ-003, REQ-005 | BL-003, BL-005 | FT-03, FT-05 | DS-01, DS-02, DGM-02, DGM-04 | To Be Validated |
| UP-05 changing or cancelling intended use | REQ-010, REQ-011, REQ-012 | BL-010, BL-011, BL-012 | FT-10, FT-11, FT-12 | DS-06, DGM-02, DGM-04 | To Be Validated |
| UP-06 communicating maintenance/unavailability | REQ-013, REQ-018 | BL-013, BL-018 | FT-13, FT-18 | DS-01, DS-07, DGM-01, DGM-02 | To Be Validated |
| UP-07 operational oversight | REQ-014, REQ-015, REQ-016 | BL-014, BL-015, BL-016 | FT-14, FT-15, FT-16 | DS-07, DGM-01, DGM-02, DGM-04 | To Be Validated |
| UP-08 booking-result uncertainty | REQ-009, REQ-010 | BL-009, BL-010 | FT-09, FT-10 | DS-05, DS-06, DGM-03 | To Be Validated |
| Cross-cutting access hypothesis | REQ-001, REQ-016 | BL-001, BL-016 | FT-01, FT-16 | DS-00, DS-07, DGM-01, DGM-02 | To Be Validated |

Pain IDs are defined in [user-interviews.md](user-interviews.md#candidate-pain-register). Backlog and requirement IDs are defined in [backlog.md](backlog.md). Feature and screen IDs are defined in [feature-list.md](../02-design/feature-list.md) and [prototype.md](../02-design/prototype.md).

## Requirement Coverage Index

| Requirement | Covered by backlog | Covered by feature | Design reference | Status |
|---|---|---|---|---|
| REQ-001 | BL-001 | FT-01 | DS-00; DGM-01, DGM-02 | To Be Validated |
| REQ-002 | BL-002 | FT-02 | DS-01; DGM-02, DGM-04 | To Be Validated |
| REQ-003 | BL-003 | FT-03 | DS-01 | To Be Validated |
| REQ-004 | BL-004 | FT-04 | DS-02; DGM-04 | To Be Validated |
| REQ-005 | BL-005 | FT-05 | DS-02; DGM-04 | To Be Validated |
| REQ-006 | BL-006 | FT-06 | DS-02, DS-03; DGM-03 | To Be Validated |
| REQ-007 | BL-007 | FT-07 | DS-03; DGM-03 | To Be Validated |
| REQ-008 | BL-008 | FT-08 | DS-03, DS-04; DGM-03, DGM-04 | To Be Validated |
| REQ-009 | BL-009 | FT-09 | DS-04, DS-05; DGM-03 | To Be Validated |
| REQ-010 | BL-010 | FT-10 | DS-06; DGM-02, DGM-04 | To Be Validated |
| REQ-011 | BL-011 | FT-11 | DS-06; DGM-02 | To Be Validated |
| REQ-012 | BL-012 | FT-12 | DS-03, DS-06; DGM-02, DGM-03 | To Be Validated |
| REQ-013 | BL-013 | FT-13 | DS-01, DS-07; DGM-01, DGM-02 | To Be Validated |
| REQ-014 | BL-014 | FT-14 | DS-07; DGM-02, DGM-04 | To Be Validated |
| REQ-015 | BL-015 | FT-15 | DS-07; DGM-02, DGM-04 | To Be Validated |
| REQ-016 | BL-016 | FT-16 | DS-00, DS-07; DGM-01, DGM-02 | To Be Validated |
| REQ-017 | BL-017 | FT-17 | DS-03, DS-04; DGM-03 | To Be Validated |
| REQ-018 | BL-018 | FT-18 | DS-01, DS-02, DS-07; DGM-04 | To Be Validated |
| REQ-019 | BL-019 | FT-19 | All screens; DGM-01, DGM-04 | Awaiting user and Week 2 legal validation |
| REQ-020 | BL-020 | FT-20 | DS-00, DS-06, DS-07; DGM-01, DGM-04 | Awaiting user and Week 2 legal validation |

## Legal-to-System Traceability

The supplied Week 2-style example identified three Thai Acts. Official MDES/ETDA texts are now linked in [legal-requirements.md](../03-compliance/legal-requirements.md), but no obligation is marked validated until system-specific applicability and university approval are recorded.

| Legal ID | Confirmed source | Candidate system requirements | Current status |
|---|---|---|---|
| LR-01 | Official PDPA source recorded | REQ-019 | Applicability/owner approval pending |
| LR-02 | Official PDPA source recorded | REQ-016, REQ-019, REQ-020 | Applicability/owner approval pending |
| LR-03 | Official PDPA source recorded | REQ-006, REQ-009, REQ-010, REQ-020 | Applicability/owner approval pending |
| LR-04 | Official PDPA source recorded | REQ-020 | Retention/request process pending |
| LR-05 | Official PDPA source recorded | REQ-016, REQ-020 | Security/incident process pending |
| LR-06 | Pending Week 2 research | REQ-003, REQ-006, REQ-009 | To Be Validated — no citation supplied |
| LR-07 | Official Computer-Related Crime Act source recorded | REQ-001, REQ-016, REQ-020 | Service-provider/notification applicability pending |
| LR-08 | Official Electronic Transactions Act source recorded | No current requirement | Not triggered by current scope |

## Change-Control Rule

When evidence changes a pain or requirement, update all downstream cells in the same change. A requirement may be marked `Validated` only if its row includes participant/evidence references or an approved legal/policy source. If the evidence conflicts, retain the contradiction and set the item to `Needs more evidence` rather than selecting a preferred answer without justification.
