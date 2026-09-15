# SE Lab PC Booking System · Phase 1 Demo

A frontend-only demonstration of the student request → advisor approval → dean approval → confirmed booking workflow.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL and choose Student, Advisor, or Dean. The selected role and booking data persist in `localStorage`. Use **Reset demo data** in the profile menu to restore the seeded requests.

## Checks

```bash
npm run lint
npm test
npm run build
```

## Demo scope

- Fake role-based login and easy role switching
- Student dashboard, PC inventory, lab-hours single-day bookings, 24-hour remote multi-day bookings, booking list, and request detail
- Advisor and dean queues, approval history, approve/reject actions, and required rejection reasons
- Booking conflict detection across every date in a multi-day request
- Date-grouped schedule view
- Mock data covering pending advisor, pending dean, approved, rejected, cancelled, and completed states

This phase intentionally has no Supabase client, database, backend API, migrations, RLS, or real authentication.
