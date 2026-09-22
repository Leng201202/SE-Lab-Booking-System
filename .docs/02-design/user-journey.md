# User journeys — SE Lab PC Booking System

## Journey 1 — First Google sign-in

1. User opens the application and chooses Continue with Google.
2. Supabase completes OAuth and creates a trusted profile.
3. A new user receives the Student role unless their verified email is allowlisted.
4. The app restores the session and loads only records allowed by RLS.
5. A Student without an assigned Advisor can inspect the system but receives an actionable error if they try to submit a request.

## Journey 2 — Student requests a PC

1. Student reviews PC inventory or the availability calendar.
2. Student chooses an available one-day lab interval or a multi-day date range.
3. The form collects PC, dates/times, purpose, and optional course/project.
4. The database validates identity, Advisor assignment, PC state, interval, purpose, and overlap.
5. A valid request is created as pending Advisor.
6. Student sees the request detail and approval progress.

## Journey 3 — Advisor reviews

1. Advisor signs in with an allowlisted Google account.
2. Advisor opens requests for assigned Students.
3. Advisor inspects Student, PC, dates, purpose, and course.
4. Approval moves the request to pending Dean and writes an audit event.
5. Rejection requires a reason, closes the request, and writes an audit event.

## Journey 4 — Dean gives the final decision

1. Dean signs in with an allowlisted Google account.
2. Dean sees only requests that passed Advisor review.
3. Dean approves the booking or rejects it with a reason.
4. The transaction updates the booking and writes the Dean audit event.
5. Student sees the final state on the next authoritative refresh.

## Journey 5 — Another user checks availability

1. Authenticated user opens the week or day calendar.
2. Occupied periods show PC, access mode, and status.
3. Unrelated Student identity, university ID, purpose, course, and rejection data remain hidden.
4. If a Student submits against a newly occupied interval, the database rejects the race safely.

Cancellation, rebooking, notifications, and administrative management screens are not part of the current journeys.
