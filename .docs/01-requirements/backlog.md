# Product Backlog — SE Lab Booking

Status reflects the actual code in this repo as of this draft:
`src/components/LabCalendar.tsx`, `src/components/AuthPanel.tsx`,
`src/routes/index.tsx`, and the schema in `supabase/migrations/`.

Legend: **Done** = shipped and working · **Planned** = agreed, not built ·
**Proposed** = candidate, needs a real user pain to justify it (see
[user-research.md](user-research.md)).

| ID | User story | Priority | Status | Traced pain (user-research # / summary) |
|---|---|---|---|---|
| B1 | As a student or teacher, I can create an account and sign in (email/password or Google) so my bookings are tied to my identity. | Must | Done | #3, #4 — students need a way to reserve a computer for a defined time |
| B2 | As a signed-in user, I see a live timetable of all 10 computers for a chosen day (9:00–20:00) so I know what's free before walking to the lab. | Must | Done | #5 — needs to check whether a computer is free; #1, #2 — see remote-use status |
| B3 | As a signed-in user, I can book an open computer for a specific hour range so I have a guaranteed seat. | Must | Done | #3, #4 — reserve the computer they planned to use |
| B4 | As a signed-in user, I must mark each booking **onsite** or **remote** so others can see a slot is in remote use, not actually empty. | Must | Done | #1, #2 — remote computer use is not visible / unclear (core pain) |
| B5 | As a signed-in user, I can see whose booking is on a computer — the holder's **student ID + role** and its onsite/remote mode — without needing to ask around; signed-out visitors see nothing. | Must | Planned (agreed: student ID + signed-in-only; app currently shows name and allows anon read) | #1, #2 — need to know what/who is in use |
| B6 | As the owner of a booking, I can cancel it so the slot becomes available again for others. | Must | Done | #3, #4 — resolve usage conflicts by freeing a slot |
| B7 | As a user, the system rejects a booking that overlaps an existing one on the same computer/day, so double-booking is impossible even under a race. | Must | Done (DB trigger `prevent_booking_overlap`) | #3, #4 — prevent conflict over the same computer; #5 — reliable availability |
| B8 | As a user, I can navigate to previous/next/today so I can check or book a different day. | Should | Done | #2, #5 — checking availability across times |
| B9 | As a signed-out visitor, I only see a sign-in screen, not the live calendar, so booking data isn't exposed before authenticating. | Must | Done | #5 — availability is checked by signed-in users; protects booking data |
| B10 | As the owner of a booking, I can change its hours or computer ("rebook") without deleting and recreating it, so plan changes don't cost me the slot in between. | Should | Planned | #3, #4 — plans/conflicts change; needs a reliable way to shift a reservation |
| B11 | As a user, I get notified (in-app or email) when a computer I wanted frees up. | Could | Proposed | Not yet confirmed by interviews — needs real-user support to validate |
| B12 | As a teacher, I can end/override another user's booking (e.g. a no-show during class), so lab time isn't wasted. | Could | Proposed | Not yet confirmed by interviews — needs real-user support to validate |
| B13 | As a user, I can set a recurring weekly booking for the same slot. | Won't (this cycle) | Proposed | Not yet confirmed by interviews — needs real-user support to validate |
| B14 | As a user, I get a short confirmation (toast/email) after booking or cancelling, so I trust the action went through. | Should | Done (toast only) | #3, #4 — trust the reservation succeeded; #5 — confidence in outcome |

## Notes

- B10 ("rebook") is explicitly called out in the project brief but isn't
  built yet — cancel + rebook is the current workaround. Decide this
  cycle whether it's worth a dedicated "edit booking" action or whether
  cancel+recreate is good enough once B4/B5 (mode visibility) ship.
- Every `Traced pain` cell must point at a real row in
  [user-research.md](user-research.md) before this gate can pass — an
  empty "TODO" here means the story hasn't been validated yet.
