# Diagram 4 — Sequence diagram: booking a computer

```mermaid
sequenceDiagram
    actor U as User (student/teacher)
    participant W as Web app (LabCalendar)
    participant DB as Supabase Postgres

    U->>W: Tap an open slot (computer, hour)
    W->>U: Open booking dialog (choose end hour, onsite/remote, purpose)
    U->>W: Confirm booking
    W->>DB: INSERT INTO bookings (...)
    DB->>DB: trigger prevent_booking_overlap()
    alt overlaps an existing booking
        DB-->>W: error "already booked during part of that range"
        W-->>U: toast error, dialog stays open
    else no overlap
        DB-->>W: insert succeeds
        W->>DB: re-fetch bookings for that day
        DB-->>W: updated booking list
        W-->>U: toast "Computer booked", tile now shows holder student ID + mode
    end
```

This is the mechanism that makes the shared calendar trustworthy: even if
two users submit conflicting bookings at nearly the same instant, the
database trigger — not client-side logic — is the single source of truth
that rejects the second one.
