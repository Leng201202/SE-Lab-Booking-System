# Diagram 4 — Sequence diagram: booking a computer

```mermaid
sequenceDiagram
    actor S as Student
    participant W as Vite React app
    participant LS as Browser localStorage
    participant A as Advisor
    participant D as Dean

    S->>W: Select PC, date range, time, purpose and course
    W->>LS: Read current bookings
    LS-->>W: Return seeded or saved bookings
    W->>W: Validate PC, dates, hours and overlap
    alt invalid or overlapping request
        W-->>S: Show validation error; keep form open
    else valid request
        W->>LS: Save booking with pending_advisor status
        LS-->>W: Return saved booking
        W->>W: Refresh booking state
        W-->>S: Show submission toast
        A->>W: Open pending_advisor request
        alt Advisor approves
            A->>W: Approve request
            W->>LS: Save pending_dean decision
            W->>W: Refresh booking state
            D->>W: Open pending_dean request
            alt Dean approves
                D->>W: Approve request
                W->>LS: Save approved decision
                W->>W: Refresh booking state
                W-->>S: Show approved status
            else Dean rejects
                D->>W: Reject with required reason
                W->>LS: Save rejected status and reason
                W->>W: Refresh booking state
                W-->>S: Show rejection reason
            end
        else Advisor rejects
            A->>W: Reject with required reason
            W->>LS: Save rejected status and reason
            W->>W: Refresh booking state
            W-->>S: Show rejection reason
        end
    end
```

This sequence describes the current demo. Its conflict check is local to the
browser, so it is not concurrency-safe across different users or devices.
The planned Supabase phase must move the overlap rule and role authorization
to the server/database.
