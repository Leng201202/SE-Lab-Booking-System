# User journeys — SE Lab PC Booking System

## Journey 1 — First Google sign-in

1. User opens the application and chooses Continue with Google.
2. Supabase completes OAuth and creates a trusted profile.
3. Every new user receives the Student role.
4. The app restores the session and loads only records allowed by RLS.
5. A Student without an assigned Advisor can inspect the system but receives an actionable error if they try to submit a request.

## Journey 2 — Student requests a PC

1. Student reviews PC inventory or the availability calendar.
2. Student chooses an available one-day lab interval beginning at the next valid Bangkok slot, or a multi-day range beginning on a future date.
3. The form collects PC, dates/times, purpose, and optional course/project.
4. The database validates identity, Advisor assignment, PC state, future start instant, interval, purpose, and overlap.
5. A valid request is created as pending Advisor.
6. Student sees the request detail and approval progress.

## Journey 3 — Technician reviews

1. The future Technician signs in with Google and initially receives the Student role.
2. A Dean promotes the profile to Technician through protected user management.
3. Technician opens Student requests awaiting technical review.
4. Approval advances the request to its assigned Advisor and writes an audit event.
5. Rejection requires a reason, closes the request, and writes an audit event.
6. Technician can add PCs and maintain room, specification, operational status, and maintenance notes.

## Journey 4 — Advisor reviews

1. The future Advisor signs in with Google and initially receives the Student role.
2. An administrator adds the existing profile's email to the protected allowlist, promoting it to Advisor.
3. Advisor opens requests for assigned Students.
4. Advisor inspects Student, PC, dates, purpose, and course.
5. Approval moves the request to pending Dean and writes an audit event.
6. Rejection requires a reason, closes the request, and writes an audit event.

## Journey 5 — Dean gives the final decision

1. The future Dean signs in with Google and initially receives the Student role.
2. An administrator adds the existing profile's email to the protected allowlist, promoting it to Dean.
3. Dean sees requests that passed all required earlier stages.
4. Dean approves the booking or rejects it with a reason.
5. The transaction updates the booking and writes the Dean audit event.
6. The requester sees the final state on the next authoritative refresh.

## Journey 6 — Another user checks availability

1. Authenticated user opens the week or day calendar.
2. Occupied periods show PC, access mode, and status.
3. Past dates and elapsed slots on the current Bangkok date are read-only; the page refreshes the earliest selectable slot while it remains open.
4. Unrelated Student identity, university ID, purpose, course, and rejection data remain hidden.
5. If a user submits an expired or newly occupied interval, the database rejects the race safely.

## Journey 7 — Technician books a PC

1. Technician selects an available PC and valid interval.
2. The request skips technical review and begins at pending Advisor.
3. An Advisor and then the Dean approve or reject the request with audited decisions.

## Journey 8 — Advisor books a PC

1. Advisor selects an available PC and valid interval.
2. The database creates the request as pending Dean and marks Advisor review not required.
3. Dean approves or rejects the request with an audited decision.

## Journey 9 — Dean books a PC

1. Dean selects an available PC and valid interval.
2. The database validates PC state, booking rules, and overlap.
3. A valid request is approved immediately and recorded in the audit trail.

## Journey 10 — Manage users and PCs

1. Advisor may claim an unassigned Student or release an existing advisee.
2. Advisor cannot take a Student assigned to another Advisor.
3. Dean views all profiles, changes trusted roles, and assigns Students to eligible Advisors.
4. Technician or Dean adds or edits PCs, including specifications, notes, and maintenance/inactive state.

## Journey 11 — A requester cancels a booking

1. The requester opens their own pending or approved booking before its start instant.
2. The detail page presents Cancel booking only to the Student, Technician, Advisor, or Dean who owns the eligible record.
3. The requester supplies a 5–2000 character cancellation reason and confirms.
4. The database locks the booking and revalidates actor, role, ownership, status, start time, and reason.
5. A successful transaction records the reason, requester, and cancellation time, changes the status to cancelled, and releases the interval for availability.
6. The detail page shows the retained cancellation information; an invalid or stale request returns an actionable error without changing the booking.

Rebooking and notifications are not part of the current journeys.
