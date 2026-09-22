# Diagram 4 — Sequence diagram: booking a computer

```mermaid
sequenceDiagram
    actor S as Student
    participant W as Vite React app
    participant LS as Browser localStorage
    participant A as Advisor
    participant D as Dean

    S->>W: Select PC, date, time, purpose, and course
    W->>LS: Read current bookings
    LS-->>W: Return bookings
    W->>W: Validate PC, dates, hours, and overlap
    alt Invalid or overlapping request
        W-->>S: Show validation error and keep form open
    else Valid request
        W->>LS: Save booking as pending_advisor
        LS-->>W: Confirm saved booking
        W-->>S: Show submission toast
        A->>W: Review pending_advisor request
        A->>W: Approve or reject with reason
        W->>LS: Save advisor decision
        alt Advisor approves
            D->>W: Review pending_dean request
            D->>W: Approve or reject final request
            W->>LS: Save dean decision
            W-->>S: Show final status
        else Advisor rejects
            W-->>S: Show rejection reason
        end
    end
```

This sequence describes the current demo. Its conflict check is local to the
browser, so it is not concurrency-safe across different users or devices.
The planned Supabase phase must move the overlap rule and role authorization
to the server/database.
