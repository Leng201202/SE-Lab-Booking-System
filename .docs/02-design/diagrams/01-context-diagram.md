# Diagram 1 — System context

~~~mermaid
flowchart LR
    Student([Student])
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

The browser contains only the Supabase project URL and publishable key. Google provider secrets and privileged database credentials remain outside the frontend. React route guards tailor the interface; PostgreSQL grants, RLS, functions, and constraints enforce authorization and booking integrity.
