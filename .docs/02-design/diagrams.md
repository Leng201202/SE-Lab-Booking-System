# Diagrams — SE Lab PC Booking System

D1 and D2 are ported verbatim from the existing per-diagram files — same actor names, same
content, just consolidated here per the DISCOVER package convention. Edit the originals
([01-context-diagram.md](diagrams/01-context-diagram.md),
[02-use-case-diagram.md](diagrams/02-use-case-diagram.md)) and re-sync this file, rather than
letting the two drift apart. D3 and D4 are new.

## D1 — System context

~~~mermaid
flowchart LR
    Student([Student])
    Technician([Technician])
    Advisor([Advisor])
    Dean([Dean])
    Operator([University operator])
    Google[Google OAuth]

    subgraph System["SE Lab PC Booking System"]
        Web[React + Vite web application]
        Auth[Supabase Auth]
        API[Supabase Data API and RPC]
        DB[(PostgreSQL\nRLS, constraints, audit)]
    end

    Student -->|availability and requests| Web
    Technician -->|technical reviews, requests, PCs| Web
    Advisor -->|requests, reviews, advisees| Web
    Dean -->|requests, final reviews, users, PCs| Web
    Operator -->|bootstrap and deployment configuration| DB

    Web -->|OAuth redirect| Auth
    Auth <--> Google
    Web -->|authenticated queries| API
    API --> DB
    DB -->|role-scoped results| API
    API --> Web
~~~

The browser contains only the Supabase project URL and publishable key. Google provider secrets
and privileged database credentials remain outside the frontend.

## D2 — Use case

~~~mermaid
flowchart LR
    Visitor([Visitor])
    Student([Student])
    Technician([Technician])
    Advisor([Advisor])
    Dean([Dean])
    Operator([University operator])

    SignIn((Sign in with Google))
    Availability((View sanitized availability))
    Inventory((View PC inventory))
    Submit((Submit booking request))
    OwnRecords((View own requests))
    Cancel((Cancel own active future booking))
    TechnicianReview((Perform technical review))
    AdvisorReview((Review assigned Student request))
    DeanReview((Give final decision))
    Advisees((Manage own advisees))
    Users((Manage users and roles))
    PCs((Manage PC inventory))
    Audit((Record approval event))
    Validate((Validate role, PC, interval, and conflict))
    Configure((Configure roles, assignments, and PCs))

    Visitor --> SignIn
    Student --> Availability
    Student --> Inventory
    Student --> Submit
    Student --> OwnRecords
    Student --> Cancel
    Technician --> Availability
    Technician --> Inventory
    Technician --> Submit
    Technician --> OwnRecords
    Technician --> Cancel
    Technician --> TechnicianReview
    Technician --> PCs
    Advisor --> Availability
    Advisor --> Submit
    Advisor --> OwnRecords
    Advisor --> Cancel
    Advisor --> AdvisorReview
    Advisor --> Advisees
    Dean --> Availability
    Dean --> Submit
    Dean --> OwnRecords
    Dean --> Cancel
    Dean --> DeanReview
    Dean --> Users
    Dean --> PCs
    Operator --> Configure

    Submit -. includes .-> Validate
    Cancel -. includes .-> Validate
    TechnicianReview -. includes .-> Audit
    TechnicianReview -. includes .-> Validate
    AdvisorReview -. includes .-> Audit
    DeanReview -. includes .-> Audit
    AdvisorReview -. includes .-> Validate
    DeanReview -. includes .-> Validate
~~~

## D3 — High-level architecture

New. Matches the real stack (React + Vite frontend, Supabase Auth/PostgREST/RPC, PostgreSQL)
and the five tables that actually exist in `supabase/migrations/` — `private.role_allowlist`,
`public.profiles`, `public.pcs`, `public.bookings`, `public.approval_events`. Data flows
one direction per layer: the browser never talks to PostgreSQL directly, and every write goes
through a `security definer` RPC, not a raw table insert.

~~~mermaid
flowchart TB
    subgraph Client["Browser"]
        UI[React + Vite app]
    end

    subgraph Edge["Supabase edge"]
        GoTrue[Supabase Auth / GoTrue]
        PostgREST[PostgREST Data API]
    end

    subgraph DB["PostgreSQL"]
        RLS["RLS policies + grants\n(authorization boundary)"]
        RPC["security definer RPCs:\ncreate_booking, approve_booking,\nreject_booking, cancel_booking,\nassign_student_advisor, create_pc, update_pc"]
        Tables[("profiles · pcs · bookings\napproval_events\nprivate.role_allowlist")]
    end

    UI -->|OAuth redirect| GoTrue
    UI -->|authenticated REST + RPC calls, publishable key only| PostgREST
    PostgREST --> RLS
    RLS --> RPC
    RLS -->|direct SELECT, policy-scoped| Tables
    RPC --> Tables
    RPC -->|every approval/rejection writes a row| Tables
~~~

**Note on audit/consent infrastructure:** `approval_events` is a real, implemented audit trail
— but it only covers Technician/Advisor/Dean decisions, not a general access log. Per
[rule.md](../03-compliance/rule.md), a broader access log, a consent store, and an approved
retention/deletion schedule are **not yet implemented** (Policy pending). This diagram does not
draw boxes for them — doing so would misrepresent the system as more compliant than it
currently is.

## D4 — Activity: Student requests a PC

New. Same steps and order as
[user-journey.md § Journey 2 — Student requests a PC](user-journey.md), with the decision
guards taken directly from `create_booking`'s real validation order in
`supabase/migrations/20260924000300_implement_technician_workflow.sql`.

~~~mermaid
flowchart TD
    Start((start))
    Review[Student reviews PC inventory\nor availability calendar]
    Choose[Student chooses an available interval:\none-day lab, or multi-day remote]
    Fill[Form collects PC, dates/times,\npurpose, optional course]
    Submit[Student submits the request]

    CheckProfile{Has an application\nprofile?}
    CheckAdvisor{Has an assigned,\neligible Advisor?}
    CheckPC{Selected PC exists\nand is available?}
    CheckDate{Start date is today\nor later, times valid,\npurpose ≥ 5 chars?}
    CheckOverlap{Overlaps an existing\nactive booking on\nthat PC?}

    Reject[[Request rejected,\nactionable error shown]]
    Created[Booking row created,\nstatus = pending_technician]
    Detail[Student sees request detail\nand approval progress]
    End((end))

    Start --> Review --> Choose --> Fill --> Submit
    Submit --> CheckProfile
    CheckProfile -- "[no]" --> Reject
    CheckProfile -- "[yes]" --> CheckAdvisor
    CheckAdvisor -- "[no]" --> Reject
    CheckAdvisor -- "[yes]" --> CheckPC
    CheckPC -- "[no / not available]" --> Reject
    CheckPC -- "[yes]" --> CheckDate
    CheckDate -- "[invalid]" --> Reject
    CheckDate -- "[valid]" --> CheckOverlap
    CheckOverlap -- "[yes, conflict]" --> Reject
    CheckOverlap -- "[no conflict]" --> Created
    Created --> Detail --> End
    Reject --> End
~~~
