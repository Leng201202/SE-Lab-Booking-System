# Legal requirement trace (from W2)

> TODO (team): paste/link your actual W2 legal requirement spec, then fill
> the table below so every legal requirement traces to where it's enforced
> in this system. Delete the placeholder rows once real ones replace them.

**W2 spec source:** TODO (file path or link to the W2 deliverable)

| Legal requirement (from W2) | How it's addressed here | Evidence (file / policy / code) | Status |
|---|---|---|---|
| Data minimization — avoid storing unnecessary personal data | Agreed: store and show only the holder's **8-digit student ID** + role, instead of a full name; no other personal data collected | `profiles` table (id, student_id, role); sign-up in `src/components/AuthPanel.tsx` | Agreed 9 Sep 2026 — confirm against W2 spec |
| Right to access / delete own data | `ON DELETE CASCADE` from `auth.users` deletes the profile and its bookings; user can cancel/delete own bookings | RLS `Users can delete own bookings`, FK `ON DELETE CASCADE` | Enforced — confirm retention policy vs W2 |
| Consent for account creation | Explicit sign-up form (email/password or Google); no silent data collection | `src/components/AuthPanel.tsx` | Enforced — confirm notice text vs W2 |
| Access control / least privilege | Booking identity (student ID + role) visible to signed-in users only; writes scoped to the record owner; `anon` must not read booking/profiles | `supabase/migrations/*_1a6b8b72*.sql`, `*_292b4570*.sql` — **pending RLS change to revoke anon SELECT** | Partly enforced — RLS change needed |
| TODO | TODO | TODO | TODO |
| TODO | TODO | TODO | TODO |

## Gaps found

> TODO (team): list any W2 requirement that this system does **not** yet
> satisfy, with a plan/owner to close it before BUILD starts.

Known gap (9 Sep 2026): student identity is currently rendered/stored as
`full_name`, and RLS still grants `anon` `SELECT` on `bookings`/`profiles`.
Swap to student ID and restrict reads to `authenticated` to match the agreed
data-minimization and least-privilege posture.
