# Diagram 3 — Entity-relationship diagram

Matches the live schema in `supabase/migrations/`.

```mermaid
erDiagram
    PROFILES ||--o{ BOOKINGS : "makes"
    PROFILES {
        uuid id PK "references auth.users"
        text full_name
        enum role "teacher | student"
        timestamptz created_at
    }
    BOOKINGS {
        uuid id PK
        uuid user_id FK "references auth.users"
        int computer_id "1-10"
        date booking_date
        int start_hour "9-19"
        int end_hour "10-20"
        enum mode "onsite | remote"
        text purpose
        timestamptz created_at
    }
```

Notes:
- `UNIQUE`/overlap enforcement isn't a simple unique constraint — a
  `BEFORE INSERT OR UPDATE` trigger (`prevent_booking_overlap`) rejects any
  new/edited booking whose `[start_hour, end_hour)` overlaps an existing
  booking on the same `computer_id` + `booking_date`.
- Row-Level Security: `bookings` and `profiles` are readable by everyone
  (`anon` + `authenticated`) so the calendar is genuinely public/live, but
  only the owning `user_id` can insert/update/delete their own booking.
