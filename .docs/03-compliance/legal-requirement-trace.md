# Legal requirement trace (from W2)

> TODO (team): paste/link your actual W2 legal requirement spec, then fill
> the table below so every legal requirement traces to where it's enforced
> in this system. Delete the placeholder rows once real ones replace them.

**W2 spec source:** TODO (file path or link to the W2 deliverable)

| Legal requirement (from W2) | How it's addressed here | Evidence (file / policy / code) | Status |
|---|---|---|---|
| TODO — e.g. data minimization | e.g. only `full_name` + `role` stored beyond Supabase Auth's own fields | `supabase/migrations/...` (`profiles` table) | TODO |
| TODO — e.g. right to access/delete own data | e.g. `ON DELETE CASCADE` from `auth.users`; user can cancel/delete own bookings | RLS `Users can delete own bookings`, FK `ON DELETE CASCADE` | TODO |
| TODO — e.g. consent for account creation | e.g. explicit sign-up form, no silent data collection | `src/components/AuthPanel.tsx` | TODO |
| TODO — e.g. access control / least privilege | e.g. RLS scopes writes to the record owner; `anon` role is read-only | `supabase/migrations/*_1a6b8b72*.sql`, `*_292b4570*.sql` | TODO |
| TODO | TODO | TODO | TODO |
| TODO | TODO | TODO | TODO |

## Gaps found

> TODO (team): list any W2 requirement that this system does **not** yet
> satisfy, with a plan/owner to close it before BUILD starts.
