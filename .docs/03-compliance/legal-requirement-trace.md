# Legal requirement trace (from W2)

> **W2 basis restored (9 Sep 2026).** The project's Week-2 legal analysis
> (Thai legislation, official MDES/ETDA sources) is recovered from the
> repository history and reproduced in [rule.md](rule.md). Applicability to
> this system and supervisor review are still **pending** — see "Gaps". This
> table maps each W2 legal topic to how the system addresses it.

**Phasing note:** this "project" now ships a working SE Lab booking app, so
the mapping below reflects **current** enforcement plus **agreed/planned**
changes (student ID, authenticated-only visibility). Legal reviewer/approval
is still required before BUILD.

## Trace table

| W2 legal topic (from rule.md) | Obligation relevant to this system | How the system addresses it | Evidence (file / policy / code) | Status |
|---|---|---|---|---|
| PDPA B.E. 2562 (2019) — data minimization | Collect only necessary personal data | Agreed: store only **student ID (8-digit) + role**, not full name | `profiles` (student_id, role) — **planned**; sign-up `src/components/AuthPanel.tsx` | Policy — schema still stores `full_name`; change pending |
| PDPA — lawful basis, transparency | Identify an approved basis and inform users at collection | Custom sign-up with explicit role selection; notice text pending university review | `src/components/AuthPanel.tsx` | Partial — notice text pending |
| PDPA — least privilege / access control | Only authorized access to personal data | Signed-in users only see booking holder (student ID + role); writes scoped to owner; `anon` must not read | RLS in `supabase/migrations/*_1a6b8b72*.sql`, `*_292b4570*.sql` | **Gap** — RLS still grants `anon` SELECT; needs revoke |
| PDPA — data-subject rights (access/delete) | Support access, delete own data | `ON DELETE CASCADE` + owner-only delete of own bookings | FK `ON DELETE CASCADE`; RLS `Users can delete own bookings` | Enforced — retention policy pending |
| PDPA — retention | Don't retain indefinitely; approved schedule | No retention schedule defined yet | TODO | **Gap** — define approved retention |
| Computer-Related Crime Act B.E. 2550/2560 §26 — traffic/user-data retention | If in-scope service provider: retain traffic data ≥90 days, support lawful preservation | **Not yet assessed** whether this web app / operator is an in-scope provider under the applicable Ministerial notification | TODO | **Gap** — applicability pending legal/security review |
| Electronic Transactions Act B.E. 2544 — records/signatures | A booking confirmation is not a legally-binding signature | Booking confirmation shown as a toast/UI notice, not a signature | `src/components/LabCalendar.tsx` (toast) | Not triggered in current scope |

## Gaps found

> TODO (team/owner): close each before BUILD.

1. **RLS reversal** — migrations still `GRANT SELECT ... TO anon` and create
   `"viewable by everyone"` policies on `bookings`/`profiles`; must be
   restricted to `authenticated` to match the agreed least-privilege posture.
2. **Data minimization** — `profiles.full_name` is still stored/rendered;
   switch to `student_id` + `role` and drop `full_name`.
3. **Retention schedule** — define how long bookings/profiles are kept.
4. **Computer-Related Crime Act §26 applicability** — document whether this
   system/operator is an in-scope service provider and which notification
   applies.
5. **W2 source + reviewer** — confirm the law citations with the supervisor
   and record the reviewer + approval date (rule.md "Source and Review Record").
6. **Booking-hours rule** — implement the agreed 24h booking with onsite-only
   during lab hours (current DB/UI locks 09:00–20:00 for all modes).
