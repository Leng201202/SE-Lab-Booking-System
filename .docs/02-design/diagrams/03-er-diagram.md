# Diagram 3 — Entity-relationship diagram

~~~mermaid
erDiagram
    AUTH_USERS ||--|| PROFILES : "creates"
    PROFILES ||--o{ PROFILES : "advises"
    PROFILES ||--o{ BOOKINGS : "requester submits"
    PROFILES ||--o{ BOOKINGS : "advisor owns queue"
    PROFILES ||--o{ BOOKINGS : "requester cancels"
    PCS ||--o{ BOOKINGS : "reserved by"
    BOOKINGS ||--o{ APPROVAL_EVENTS : "has"
    PROFILES ||--o{ APPROVAL_EVENTS : "reviews"

    AUTH_USERS {
        uuid id PK
        text email
        jsonb provider_metadata
    }
    PROFILES {
        uuid id PK,FK
        text email UK
        text display_name
        text university_id UK
        app_role role
        uuid advisor_id FK
        timestamptz created_at
        timestamptz updated_at
    }
    PCS {
        uuid id PK
        text code UK
        text room
        text specification
        pc_status status
        text notes
    }
    BOOKINGS {
        uuid id PK
        text request_number UK
        uuid requester_id FK
        app_role requester_role
        uuid advisor_id FK nullable
        uuid pc_id FK
        date start_date
        date end_date
        time start_time
        time end_time
        timestamptz starts_at
        timestamptz ends_at
        access_mode access_mode
        text purpose
        text course
        booking_status status
        advisor_decision advisor_decision
        dean_decision dean_decision
        text rejection_reason
        text cancellation_reason
        timestamptz cancelled_at
        uuid cancelled_by FK
    }
    APPROVAL_EVENTS {
        uuid id PK
        uuid booking_id FK
        uuid reviewer_id FK
        app_role reviewer_role
        review_decision decision
        text reason
        timestamptz decided_at
    }
~~~

The private role_allowlist table maps normalized verified Google emails to Advisor or Dean roles and is intentionally outside the exposed API schema.

Important integrity rules:

- Profile IDs reference auth.users and cascade on user deletion.
- Only Student profiles may have an Advisor, and the referenced profile must have the Advisor role.
- Booking requester role is snapshotted so later role changes do not rewrite historical workflow.
- Student bookings require an Advisor; Advisor and Dean bookings have no booking-level Advisor assignment.
- Active booking ranges use half-open [start, end) semantics.
- A PostgreSQL exclusion constraint prevents overlapping active ranges for the same PC.
- A cancelled booking must retain a 5–2000 character reason, cancellation time, and its requester as the cancelling actor; non-cancelled rows cannot carry cancellation metadata.
- Approval events are append-only through application permissions.
