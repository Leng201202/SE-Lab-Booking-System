# Diagram 3 — Entity-relationship diagram

Describes the data model used by the current frontend demo.

```mermaid
erDiagram
    USERS ||--o{ BOOKINGS : "submits"
    PCS ||--o{ BOOKINGS : "is reserved in"
    USERS {
        text id PK
        text name
        text student_id
        enum role "student | advisor | dean"
        text advisor_name
        text department
        text email
    }
    BOOKINGS {
        text id PK
        text student_id FK "user id"
        text student_name
        text student_number
        text advisor_name
        text pc_id FK
        text room
        date date "seed data; single-day"
        date start_date "multi-day requests"
        date end_date "multi-day requests"
        text start_time
        text end_time
        enum access_mode "lab | remote"
        text purpose
        text course
        datetime requested_at
        enum status "pending_advisor | pending_dean | approved | rejected | cancelled | completed"
        enum advisor_decision "pending | approved | rejected | waiting"
        enum dean_decision "pending | approved | rejected | waiting | not_required"
        datetime advisor_decision_at
        datetime dean_decision_at
        text rejection_reason
        text rejected_by
    }
    PCS {
        text id PK "PC-01 to PC-10"
        text room
        enum status "Available | Booked | Maintenance | Inactive"
        text specification
    }
```

Notes:

- The demo stores seeded user, PC, and booking objects in browser
  `localStorage`; it has no live database or persistent user table.
- Existing seed bookings use `date`; newly created bookings use
  `startDate`/`endDate`, with the utility layer supporting both shapes.
- New requests start at `pending_advisor`, move to `pending_dean`, and then
  become `approved` or `rejected`.
- Advisor and Dean decisions are stored on the booking object rather than in
  a separate approval-history entity.
- `isBookingConflict` blocks overlapping `pending_advisor`, `pending_dean`,
  and `approved` bookings for the same PC and date range.
- Supabase tables, RLS, and server-side conflict enforcement are planned for
  a later phase.
