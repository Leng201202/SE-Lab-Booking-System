# Prototype and implementation guide

The working prototype is the React/Vite application under app/, backed by the repository-root Supabase configuration. It is not the retired Lovable/TanStack prototype and no hosted URL is claimed until deployment is revalidated.

## Run locally

Requirements: Node.js, npm, Docker, and Google OAuth credentials for a real sign-in.

~~~bash
cd app
npm install
cp .env.example .env.local
cd ..
export SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID="your-google-client-id"
export SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET="your-google-client-secret"
npm run supabase:start --prefix app
npm run dev --prefix app
~~~

Use the local Supabase project URL and publishable key in app/.env.local. See [../../supabase/README.md](../../supabase/README.md) for callback configuration and trusted-role setup.

## Key implementation areas

- Sign-in and callback: app/src/features/auth/
- Session and shared workspace state: app/src/app/AppContext.jsx
- Booking request and detail: app/src/features/bookings/
- Advisor/Dean queues: app/src/features/approvals/
- Advisor/Dean user management: app/src/features/users/
- Dean PC management: app/src/features/pcs/PcManagementPage.jsx
- Availability calendar: app/src/features/calendar/
- Shared Bangkok date/time and next-slot calculation: app/src/utils/booking.js
- Browser client: app/src/lib/supabase.js
- Database migration: supabase/migrations/
- Database tests: supabase/tests/database/

## Suggested screenshots

1. Google sign-in page
2. Student dashboard
3. Week availability
4. Day timeline with an occupied and selected interval
5. Booking request form
6. Student request detail and approval progress
7. Student/Advisor cancellation dialog and retained cancellation reason
8. Advisor pending queue
9. Dean final review
10. Profile showing trusted role and Advisor assignment
11. Advisor advisee management
12. Dean user management
13. Dean PC maintenance editor

Screenshots must come from the current app and must not contain real personal data or secrets.

## Verified versus external

Locally verified:

- migration and seed rebuild
- the database suite defines 71 pgTAP assertions, including cancellation authorization and state changes; the latest migrations still require database execution
- frontend lint, eight unit tests, and production build
- schema lint and dependency audit

External verification still required:

- hosted Supabase migration
- real Google OAuth redirect
- production Vercel environment
- post-first-login role promotions and Advisor assignments
- visual regression on supported browsers and devices
