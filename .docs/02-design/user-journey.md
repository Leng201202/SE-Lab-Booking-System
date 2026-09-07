# User journeys — SE Lab Booking

## Journey 1 — Student booking a remote session

1. Opens the site, sees only the sign-in screen (no calendar leaks before auth).
2. Signs in (or creates an account, picking "student").
3. Lands on today's timetable; sees which of the 10 PCs are open right now.
4. Taps an open slot on PC 04, sets 13:00–15:00, selects **Remote**, adds a
   purpose note ("SE project — running training job"), confirms.
5. Leaves the lab. The tile on PC 04 now shows their **student ID** + **Remote**
   to every signed-in user who looks at the calendar for the rest of that window.
6. **Pain this removes:** without step 5's visible tag, a second student
   walking by an apparently-idle PC 04 would have taken it. TODO (team):
   replace with the real quote/interview # once collected.

## Journey 2 — Second student almost takes the same seat

1. Walks into the lab, sees PC 04's monitor asleep/idle.
2. Opens the site on their phone before touching the keyboard.
3. Sees PC 04 marked "Remote · 13:00–15:00" under the first student's ID.
4. Picks a different open PC instead — no confrontation, no lost work for
   either side.

## Journey 3 — Teacher booking a class section

1. Signs in (role: teacher).
2. Navigates to the date of the next class session via "Next day" / date picker.
3. Books PCs 01–10 (or a subset) for the class block, mode **Onsite**.
4. During class, any signed-in student checking the calendar sees the
   teacher's student ID and role on those machines and knows not to book them.

## Journey 4 — Plan changes, booking needs to move (current workaround)

1. A team's booked slot no longer matches their new plan (e.g. needs 2 more
   hours, or a different PC).
2. Opens their booking tile, cancels it.
3. Re-books the new time/computer from scratch.
4. **Gap:** between steps 2 and 3 the slot is open to anyone — this is the
   motivation for backlog item B10 (in-place rebook/edit), not yet built.

> TODO (team): once ≥5 interviews are in, replace/extend these journeys
> with ones that match what real users actually described, and note which
> user-research row each journey is drawn from.
