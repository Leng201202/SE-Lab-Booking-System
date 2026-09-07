# Feature list — SE Lab Booking

| Feature | Description | Status |
|---|---|---|
| Auth (email/password + Google) | Sign up / sign in, session persisted; drives which UI a visitor sees | Done |
| Signed-out gate | Signed-out visitors see only the sign-in screen — the live calendar is not shown until authenticated | Done |
| Role profile (student/teacher) | Every account has a role, shown next to their name on every booking tile | Done |
| Live shared timetable | Grid of 10 computers × 11 hourly slots (9:00–20:00) for a chosen day, visible to every signed-in user | Done |
| Day navigation | Previous day / next day / today, plus a direct date picker | Done |
| Book a slot | Pick a start/end hour on an open computer, choose onsite or remote, optional purpose note | Done |
| Onsite / remote mode on booking | Every booking tile shows whether it's onsite or remote — the direct fix for "remote use looks empty" | Done |
| Booking detail view | Click any tile to see who booked it, their role, time range, mode, and purpose | Done |
| Cancel own booking | Booking owner can cancel from the same detail dialog | Done |
| Overlap prevention | Server-side trigger rejects any booking that overlaps an existing one on the same computer/day — holds even under concurrent requests | Done |
| Live stats | Header shows hours free / bookings made for the selected day | Done |
| Rebook (edit an existing booking's time/computer) | See backlog B10 | Planned |
| Free-slot notifications | See backlog B11 | Proposed |
| Teacher override/cancel | See backlog B12 | Proposed |
