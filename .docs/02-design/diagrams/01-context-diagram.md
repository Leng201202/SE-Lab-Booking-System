# Diagram 1 — System context

```mermaid
flowchart LR
    Student([Student])
    Advisor([Advisor])
    Dean([Dean])
    Visitor([Visitor])

    subgraph System["SE Lab Booking (this app)"]
        Web[SE Lab PC Booking\nVite + React demo]
    end

    Store[(Browser localStorage\nmock users, PCs, bookings)]

    Visitor -->|opens role-selection screen| Web
    Student -->|select role, submit/cancel requests| Web
    Advisor -->|approve/reject requests| Web
    Dean -->|give final approval/rejection| Web
    Web <--> Store

    Student -.->|pending_advisor| Advisor
    Advisor -.->|pending_dean| Dean
```

This repository currently delivers a frontend-only demo. The login screen
selects one of three seeded roles; it is a demo role selector, not real authentication. Booking
data is persisted in the browser with `localStorage`, and the planned
Supabase Auth/Postgres implementation is described in `agent.md`.
