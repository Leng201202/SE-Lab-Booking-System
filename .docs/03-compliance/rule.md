# Rules — SE Lab Booking

Operating rules the system enforces or should enforce. Mark each as
**Enforced** (in code/DB today), **Policy-only** (stated but not enforced
by the system), or **TODO**.

## Lab & booking rules

| Rule | Status | Where |
|---|---|---|
| Lab is open 09:00–20:00 (on-site). **Bookings may span 24h**, but an **onsite** session is allowed only during lab-open hours; outside 09:00–20:00 the booking must be **remote** | Policy (agreed) — *not yet enforced as described*: current DB check `bookings_hours_valid` locks all bookings to 09:00–20:00 and the UI constants `OPEN_HOUR=9`/`CLOSE_HOUR=20` show only 11 hourly slots; needs a mode-aware rule (onsite within lab hours; remote allowed 24h) | `bookings_hours_valid`; `src/components/LabCalendar.tsx` (`OPEN_HOUR`/`CLOSE_HOUR`) |
| A computer can't be double-booked for an overlapping time range | Enforced | DB trigger `prevent_booking_overlap` |
| Only the booking's owner can cancel or modify it | Enforced | RLS policies on `bookings` (`auth.uid() = user_id`) |
| Every booking must declare onsite or remote use | Enforced | `bookings.mode` is `NOT NULL`, UI requires a selection |
| The calendar (who booked what — **student ID + role**, when, onsite/remote) is visible to every **signed-in** user; signed-out visitors are not shown the calendar or any booking data — only the sign-in screen | Enforced (gate) / **needs RLS change** — UI gates on `user` in `src/routes/index.tsx`, but RLS still grants `anon` SELECT | `src/routes/index.tsx`; `supabase/migrations/*_292b4570*.sql` (revoke anon read) |
| Computer IDs are limited to the lab's 10 physical machines (1–10) | Enforced | DB check `bookings_computer_range` |
| TODO (team): max booking length per user/day, if the lab wants one | TODO | — |
| TODO (team): no-show policy (unused onsite booking after N minutes) | TODO | — |

## Data rules

Enforcement table follows; the full W2 legal basis (Thai legislation with
official sources) is reproduced in the [W2 Legal Annex](#w2-legal-annex) below.

| Rule | Status | Where |
|---|---|---|
| Only the holder's **8-digit student ID** and **role** are stored and shown; the full name is **not** collected or displayed (data minimization) | Policy (agreed) — *not yet enforced*: schema still stores `profiles.full_name`; planned change is to store only `student_id` + `role` and drop `full_name` | `profiles` table (`student_id`, `role`), `AuthPanel` sign-up |
| Users can only edit their own profile | Enforced | RLS policy `Users can update own profile` |
| TODO (team): data retention — how long are past bookings kept? | TODO | — |
| TODO (team): who can access the Supabase project/service-role key, and how is it kept out of the client bundle | TODO | `.env` (`VITE_*` keys are public by design; service-role key must never be `VITE_`-prefixed) |

---

## W2 Legal Annex

Recovered from the project history (Week-2 compliance register). Official
sources; **applicability to this system still pending university/supervisor
review** — these are not legal conclusions. See the enforcement trace in
[legal-requirement-trace.md](legal-requirement-trace.md).

### Personal Data Protection Act (PDPA) B.E. 2562 (2019)

Thailand's PDPA regulates collection, use, and disclosure of personal data.
Relevant to this system: lawful basis, informing users, collecting only
necessary data, protecting it, data-subject rights, disclosure control, and
retention.

**Official source:** [MDES — PDPA B.E. 2562](https://www.mdes.go.th/content/download-detail/4240)

Implications for this SE Lab booking app:
- Map each collected field (now **student ID + role**) to a documented purpose.
- Do not assume consent is the only lawful basis — university/data owner must approve it.
- Present approved privacy notice at/before collection.
- Availability views must not expose another user's identity (currently the
  app shows `full_name` and lets `anon` read — a known gap; agreed target is
  signed-in-only + student ID).
- No sensitive personal data in scope.
- Enforce least privilege (owner-only writes; restrict reads to `authenticated`).
- Support applicable access/correct/delete/export requests.
- Retain data only per an approved schedule (none defined yet — gap).
- Handle personal-data breaches per approved process.

### Computer-Related Crime Act B.E. 2550 (2007), as amended B.E. 2560 (2017), §26

Section 26 requires **in-scope service providers** to retain computer traffic
data ≥90 days (up to 2 years on a lawful preservation order) and to retain
user-identification data.

**Official source:** [MDES — Computer-Related Crime Act](https://www.mdes.go.th/law/detail/3618-)

**Open:** whether this web app/operator is an in-scope service provider under
the applicable Ministerial notification is **to be validated** — see trace gap.

### Electronic Transactions Act B.E. 2544 (2001), as amended

Recognizes electronic records and conditions for electronic writing/original
signatures (§9 electronic message approval; §26 reliable electronic signature;
§27–28 signature-data/certification responsibilities).

**Official source:** [ETDA — Electronic Transactions Act](https://www.etda.or.th/getattachment/f2c20e25-bcd4-4920-a7b0-b6c350833c43/Electronic-Transactions-Act-B-E-2544-%28Amendment%29.aspx)

A normal booking confirmation is **not** an electronic signature and must not
be presented as one — consistent with the current toast-based confirmation.

## Source and Review Record

| Source | Issuer | Reviewed on | Applicability status |
|---|---|---|---|
| PDPA B.E. 2562 (2019) | Ministry of Digital Economy and Society | W2 (2 Sep 2026) | To Be Validated by university data owner |
| Computer-Related Crime Act B.E. 2550, as amended B.E. 2560 | Ministry of Digital Economy and Society | W2 (2 Sep 2026) | Service-provider scope To Be Validated |
| Electronic Transactions Act B.E. 2544, as amended | Electronic Transactions Development Agency | W2 (2 Sep 2026) | Not triggered by current scope |

Final approval owner and date: **Pending university/supervisor review**.
