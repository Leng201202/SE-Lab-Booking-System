# Diagram 4 — Conceptual Domain Model

Status: **To Be Validated** (`DGM-04`). This is a discovery-level domain model, not a finalized database schema. Attribute types, identifiers, optionality, retention, and audit fields remain open.

```mermaid
erDiagram
    USER ||--o{ BOOKING : makes
    RESOURCE ||--o{ BOOKING : receives
    RESOURCE ||--o| COMPUTER : specializes_as
    RESOURCE ||--o| MEETING_ROOM : specializes_as
    COMPUTER }o--|| COMPUTER_CATEGORY : belongs_to

    USER {
        identifier user_id "Actual identity source TBD"
        string role "Authorized values TBD"
    }

    RESOURCE {
        identifier resource_id "Actual format TBD"
        string name
        string status "Definitions TBD"
        string resource_type "Computer or Meeting Room"
    }

    COMPUTER {
        identifier resource_id
        string cpu_or_chip "Verified inventory only"
        string gpu "Verified inventory only"
        string ram "Verified inventory only"
        string storage "Verified inventory only"
        string operating_system "Verified inventory only"
        string installed_software "Modeling approach TBD"
    }

    COMPUTER_CATEGORY {
        string category_code
        string category_name "High-Performance PC, iMac, Standard PC"
    }

    MEETING_ROOM {
        identifier resource_id
        integer capacity "Verified inventory only"
        string equipment "Modeling approach TBD"
    }

    BOOKING {
        identifier booking_id
        datetime start_time
        datetime end_time
        string purpose "Policy and visibility TBD"
        string status "Active-status set TBD"
    }
```

## Model Invariants — Candidates

- Every bookable item is an `RESOURCE` and is exactly one of `COMPUTER` or `MEETING_ROOM`; the exact enforcement method is undecided.
- Each computer belongs to one of three categories: High-Performance PC, iMac, or Standard PC.
- A booking refers to exactly one user and one resource.
- `end_time` must be after `start_time`.
- Active bookings for the same resource must not overlap.
- A booking for one resource does not block another resource.
- Resource details must come from verified SE Lab inventory.

## Open Modeling Questions

- Should software and room equipment be normalized into searchable capability records?
- Which booking states exist, and which participate in conflict checks?
- Are maintenance periods a resource status, a time-bounded unavailability record, or both?
- Which timestamps/audit facts are required by actual policy and Week 2 compliance evidence?
- What user attributes can be stored, for how long, and for what approved purpose?

Relevant requirements: REQ-002, REQ-004–REQ-008, REQ-010–REQ-015, REQ-018–REQ-020.
