# Diagram 1 — System context

```mermaid
flowchart LR
    Student([Student])
    Teacher([Teacher])
    Visitor([Signed-out visitor])

    subgraph System["SE Lab Booking (this app)"]
        Web[Web app\nTanStack Start + React]
    end

    Auth[(Supabase Auth\nemail/password + Google)]
    DB[(Supabase Postgres\nprofiles, bookings)]

    Visitor -->|sees sign-in only| Web
    Student -->|sign in, view calendar, book/cancel| Web
    Teacher -->|sign in, view calendar, book/cancel| Web
    Web <--> Auth
    Web <--> DB
```

Signed-out visitors reach only the sign-in screen; the live calendar and
booking actions require an authenticated session (`src/routes/index.tsx`).
Booking holder identity (**student ID + role**, agreed 9 Sep 2026) is shown
to signed-in users only and not to signed-out visitors.
