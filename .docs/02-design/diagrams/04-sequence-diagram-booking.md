# Diagram 4 — Booking and approval sequence

~~~mermaid
sequenceDiagram
    actor S as Student
    participant W as React app
    participant A as Supabase Auth
    participant R as create_booking RPC
    participant P as PostgreSQL
    actor V as Advisor
    actor D as Dean

    S->>W: Continue with Google
    W->>A: Start OAuth
    A-->>W: Authenticated session
    W->>P: Load RLS-scoped profile, PCs, and bookings
    P-->>W: Student workspace

    S->>W: Submit PC, dates/time, purpose, course
    W->>R: create_booking(input)
    R->>P: Validate actor, Advisor, PC, rules, and active overlap
    alt Invalid or conflicting
        P-->>R: Reject transaction
        R-->>W: Actionable database error
        W-->>S: Keep form and show error
    else Valid
        P->>P: Insert pending_advisor booking
        P-->>R: Return booking
        R-->>W: Success
        W-->>S: Refresh and show request detail

        V->>W: Review assigned request
        W->>P: approve_booking or reject_booking
        P->>P: Lock row, validate stage, update booking, append event
        alt Advisor approves
            D->>W: Review pending_dean request
            W->>P: approve_booking or reject_booking
            P->>P: Lock row, validate stage, update booking, append event
            P-->>W: Final status
        else Advisor rejects
            P-->>W: Rejected with reason
        end
    end
~~~

The exclusion constraint remains authoritative if two clients submit simultaneously. Approval functions lock the target row and perform the status transition plus audit insertion in one transaction.

Role variations:

~~~mermaid
flowchart LR
    S[Student submits] --> PA[pending_advisor]
    PA --> PD[pending_dean]
    A[Advisor submits] --> PD
    PD --> OK[approved]
    D[Dean submits] --> V{PC and interval valid?}
    V -->|yes| OK
    V -->|no| X[rejected before insert]
~~~
