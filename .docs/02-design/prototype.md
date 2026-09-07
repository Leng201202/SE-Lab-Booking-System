# Prototype — SE Lab Booking

This project's prototype **is the working app**, not a separate mockup —
it's built on Lovable/TanStack Start + Supabase and is live.

- **Live app:** https://se-lab-slots.lovable.app
- **Run locally:** `npm i && npm run dev` (see repo root `README.md`)
- **Key screens:**
  - Sign-in / sign-up — `src/components/AuthPanel.tsx`
  - Timetable + booking dialog — `src/components/LabCalendar.tsx`
  - Route/page shell (auth gate) — `src/routes/index.tsx`

## Screenshots

> TODO (team): add screenshots here (or a `screenshots/` subfolder) for:
> 1. Sign-in screen (signed-out state)
> 2. Live timetable, a day with a mix of onsite/remote/open tiles
> 3. Booking dialog — creating a booking
> 4. Booking dialog — viewing someone else's booking (mode + role visible)

Identity note: the agreed design shows the holder's **student ID** (not
`full_name`). The app currently renders `full_name`; update screenshots and
labels once the student-ID change ships.

## What's real vs. simulated

Everything in the feature list marked **Done** is real, working
functionality against a live Supabase backend (not a clickable mockup) —
bookings persist, overlap prevention is enforced server-side, and the
calendar is genuinely shared across every signed-in user.
