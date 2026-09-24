# Legal and governance requirement trace

This trace maps the W2 legal topics to current engineering controls and open governance work. It does not make a final legal determination.

| Topic | Project concern | Current implementation/evidence | Status |
|---|---|---|---|
| PDPA — purpose and data minimization | Collect only fields needed for authentication, role assignment, contact/identification, booking, approval, and audit | profiles/bookings schema; sanitized calendar RPC | Technical minimization implemented; field-by-field university approval pending |
| PDPA — lawful basis and transparency | Identify the controller, purpose, basis, recipients, retention, rights, and contact before collection | No approved production privacy notice in repository | Gap |
| PDPA — access control/security | Prevent anonymous, cross-user, wrong-stage Technician/Advisor/Dean review, unauthorized administration, stale booking-start access, and unauthorized cancellation | Explicit grants, RLS, trusted role allowlist, RPC/trigger validation, 91 pgTAP assertions | Core controls implemented; latest migration deployment plus institutional-domain, MFA, suspension, and anti-abuse remediation remain open |
| PDPA — disclosure control | Availability should not disclose unrelated personal booking details | get_booking_calendar omits Student identity, university ID, purpose, course, and rejection reason | Enforced locally |
| PDPA — data quality/correction | Allow appropriate correction without self-promotion, relationship tampering, or unverified identity claims | Role/Advisor protected; university ID is currently self-writable | Gap: make university ID trusted/admin-controlled and define correction process |
| PDPA — data-subject rights | Handle access, correction, export, restriction, objection, and deletion where applicable | Users see their own records; no request-management process | Gap |
| PDPA — retention/deletion | Keep records only for an approved period and dispose safely | Booking/reviewer foreign keys may prevent user deletion; no approved retention, pseudonymization, or automated disposal process | Gap |
| PDPA — incident response | Detect, assess, document, and respond to personal-data incidents | Database authorization and secret separation reduce risk; response process absent | Gap |
| Computer-Related Crime Act §26 | Determine whether operator is an in-scope service provider and any traffic/user-data retention duty | Booking/audit records exist but are not claimed as compliant traffic logs | Applicability pending legal review |
| Electronic Transactions Act | Avoid misrepresenting ordinary booking approval as a legally qualified signature | UI describes booking approval/status only; no signature claim | Current scope avoids signature claim; institutional record policy pending |

## Engineering evidence

- supabase/migrations/20260922000100_initial_production_backend.sql
- supabase/migrations/20260922000400_expand_role_capabilities.sql
- supabase/migrations/20260923000100_enforce_future_booking_start.sql
- supabase/migrations/20260923000200_add_booking_cancellation.sql
- supabase/migrations/20260924000100_allow_dean_booking_cancellation.sql
- supabase/migrations/20260924000200_add_technician_role_values.sql
- supabase/migrations/20260924000300_implement_technician_workflow.sql
- supabase/tests/database/001_booking_security.test.sql
- app/src/lib/supabase.js
- app/src/features/auth/authService.js
- app/src/features/bookings/bookingService.js
- app/src/app/AppContext.jsx
- app/.env.example and supabase/.env.example

## Required owners and decisions before production

1. Name the university data controller/operational owner and contact.
2. Approve the lawful basis and production privacy notice.
3. Approve each personal-data field and its purpose.
4. Define retention periods for auth profiles, bookings, rejection reasons, and approval events.
5. Define data-subject request and account-deletion procedures.
6. Define incident response, breach assessment, and escalation.
7. Assess cross-border/third-party processing for Google, Supabase, and Vercel.
8. Determine Computer-Related Crime Act applicability and logging obligations.
9. Record legal/supervisor reviewer, decision, and date.
10. Approve the institutional-domain, privileged MFA, session/offboarding, and booking anti-abuse policies tracked in B24–B28.

## Official references

- [Royal Gazette — Personal Data Protection Act B.E. 2562](https://ratchakitcha.soc.go.th/documents/17082307.pdf)
- [MDES — Computer-Related Crime Act](https://www.mdes.go.th/law/detail/3618-)
- [ETDA — Electronic Transactions laws and amendments](https://www.etda.or.th/th/Useful-Resource/laws-sharing.aspx)

Final approval remains pending qualified university/legal review.
