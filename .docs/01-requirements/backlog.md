# Product Backlog — SE Lab Booking

Status reflects the actual code in this repo as of this draft:
`src/components/LabCalendar.tsx`, `src/components/AuthPanel.tsx`,
`src/routes/index.tsx`, and the schema in `supabase/migrations/`.

Legend: **Done** = shipped and working · **Planned** = agreed, not built ·
**Proposed** = candidate, needs a real user pain to justify it (see
[user-research.md](user-research.md)).

| ID | User story | Priority | Status | Traced pain (user-research # / summary) |
|---|---|---|---|---|
| B1 | As a student or teacher, I can create an account and sign in (email/password or Google) so my bookings are tied to my identity. | Must | Done | TODO |
| B2 | As a signed-in user, I see a live timetable of all 10 computers for a chosen day (9:00–20:00) so I know what's free before walking to the lab. | Must | Done | TODO |
| B3 | As a signed-in user, I can book an open computer for a specific hour range so I have a guaranteed seat. | Must | Done | TODO |
| B4 | As a signed-in user, I must mark each booking **onsite** or **remote** so others can see a slot is in remote use, not actually empty. | Must | Done | TODO — this is the core pain from the project brief |
| B5 | As any user (including signed-out visitors), I can view whose booking is on a computer (name + role) and its onsite/remote mode, without needing to ask around. | Must | Done | TODO |
| B6 | As the owner of a booking, I can cancel it so the slot becomes available again for others. | Must | Done | TODO |
| B7 | As a user, the system rejects a booking that overlaps an existing one on the same computer/day, so double-booking is impossible even under a race. | Must | Done (DB trigger `prevent_booking_overlap`) | TODO |
| B8 | As a user, I can navigate to previous/next/today so I can check or book a different day. | Should | Done | TODO |
| B9 | As a signed-out visitor, I only see a sign-in screen, not the live calendar, so booking data isn't exposed before authenticating. | Must | Done | TODO |
| B10 | As the owner of a booking, I can change its hours or computer ("rebook") without deleting and recreating it, so plan changes don't cost me the slot in between. | Should | Planned | TODO |
| B11 | As a user, I get notified (in-app or email) when a computer I wanted frees up. | Could | Proposed | TODO |
| B12 | As a teacher, I can end/override another user's booking (e.g. a no-show during class), so lab time isn't wasted. | Could | Proposed | TODO |
| B13 | As a user, I can set a recurring weekly booking for the same slot. | Won't (this cycle) | Proposed | TODO |
| B14 | As a user, I get a short confirmation (toast/email) after booking or cancelling, so I trust the action went through. | Should | Done (toast only) | TODO |

## Notes

- B10 ("rebook") is explicitly called out in the project brief but isn't
  built yet — cancel + rebook is the current workaround. Decide this
  cycle whether it's worth a dedicated "edit booking" action or whether
  cancel+recreate is good enough once B4/B5 (mode visibility) ship.
- Every `Traced pain` cell must point at a real row in
  [user-research.md](user-research.md) before this gate can pass — an
  empty "TODO" here means the story hasn't been validated yet.
