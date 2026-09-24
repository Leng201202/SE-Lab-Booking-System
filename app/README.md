# SE Lab PC Booking frontend

React 19 and Vite frontend for the Supabase-backed SE Lab PC Booking System.

## Configure and run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set these values in `.env.local`:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Only the project URL and publishable key belong in the browser. Never add a Google client secret, Supabase secret key, or `service_role` key to a `VITE_` variable.

The app signs users in through Google OAuth. Every new user receives the Student role; an administrator may promote an existing profile through the protected backend role allowlist. See [../supabase/README.md](../supabase/README.md) for backend setup.

All roles can book PCs. Student requests require Advisor then Dean approval, Advisor requests require Dean approval, and Dean requests are immediately approved when available. Students and Advisors can cancel only their own active future bookings and must give a reason. Advisors manage their advisees; Deans manage users, role assignments, and PC inventory.

## Checks

```bash
npm run lint
npm test
npm run build
```

Backend lifecycle commands are also available here and operate on the repository-root `supabase/` directory:

```bash
npm run supabase:start
npm run supabase:reset
npm run supabase:test
npm run supabase:lint
npm run supabase:stop
```
