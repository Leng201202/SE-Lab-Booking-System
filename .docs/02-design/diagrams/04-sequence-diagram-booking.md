# Diagram 4 — Booking and approval sequence

~~~mermaid
sequenceDiagram
    actor S as Student
    participant W as React app
    participant A as Supabase Auth
    participant R as create_booking RPC
    participant P as PostgreSQL
    actor T as Technician
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
        P->>P: Insert pending_technician booking
        P-->>R: Return booking
        R-->>W: Success
        W-->>S: Refresh and show request detail

        T->>W: Perform technical review
        W->>P: approve_booking or reject_booking
        P->>P: Lock row, validate stage, update booking, append event
        alt Technician approves
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
        else Technician rejects
            P-->>W: Rejected with reason
        end
    end
~~~

The exclusion constraint remains authoritative if two clients submit simultaneously. Approval functions lock the target row and perform the status transition plus audit insertion in one transaction.

Requester cancellation:

~~~mermaid
sequenceDiagram
    actor U as Student, Technician, Advisor, or Dean requester
    participant W as React app
    participant C as cancel_booking RPC
    participant P as PostgreSQL

    U->>W: Open own active future booking
    W-->>U: Show cancellation dialog
    U->>W: Submit required reason
    W->>C: cancel_booking(booking_id, reason)
    C->>P: Lock row and validate role, owner, status, start, reason
    alt Invalid, stale, or unauthorized
        P-->>W: Reject without changing booking
        W-->>U: Show actionable error
    else Valid
        P->>P: Set cancelled status, reason, actor, and time
        P-->>W: Return cancelled booking
        W-->>U: Refresh detail and availability
    end
~~~

Role variations:

~~~mermaid
flowchart LR
    S[Student submits] --> PT[pending_technician]
    PT --> PA[pending_advisor]
    T[Technician submits] --> PA
    PA --> PD[pending_dean]
    A[Advisor submits] --> PD
    PD --> OK[approved]
    PT -->|owner cancels before start| C[cancelled]
    PA -->|owner cancels before start| C
    PD -->|owner cancels before start| C
    OK -->|owner cancels before start| C
    D[Dean submits] --> V{PC and interval valid?}
    V -->|yes| OK
    V -->|no| X[rejected before insert]
~~~
