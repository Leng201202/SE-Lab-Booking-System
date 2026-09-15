# AGENT.md — Development Instructions for SE Lab PC Booking System

## 1. Purpose

This file defines how an AI coding agent should work on the **SE Lab PC Booking System**.

The project is a React + Supabase web application with three main roles:

- Student
- Advisor
- Dean

Core workflow:

```text
Student Request
→ Advisor Approval
→ Dean Approval
→ Confirmed PC Booking
```

The agent must preserve this business flow unless the user explicitly changes the requirements.

---

## 2. Primary Technology Stack

Use the following stack unless instructed otherwise:

```text
React
Vite
React Router
Tailwind CSS
Supabase
Supabase Auth
Supabase PostgreSQL
Supabase Row Level Security
TanStack Query
React Hook Form
Zod
date-fns
Lucide React
```

Do not introduce additional frameworks or backend services without a clear need.

Examples of technologies that should NOT be added automatically:

- Next.js
- Express
- NestJS
- Firebase
- Redux
- MongoDB
- Prisma

If a new dependency is suggested, explain why it is necessary first.

---

## 3. Architecture Rules

Use feature-based architecture.

Preferred structure:

```text
src/
├── app/
├── components/
│   ├── ui/
│   └── layout/
├── features/
│   ├── auth/
│   ├── bookings/
│   ├── approvals/
│   ├── pcs/
│   ├── calendar/
│   └── dashboard/
├── hooks/
├── lib/
├── routes/
├── utils/
├── styles/
└── main.jsx
```

Do not create a large flat `components/`, `pages/`, or `services/` folder when a file belongs to a specific feature.

Feature-specific files stay inside the feature.

Example:

```text
features/bookings/
├── components/
├── hooks/
├── pages/
└── services/
```

Shared components belong in `src/components`.

---

## 4. Supabase Rules

The Supabase client belongs in:

```text
src/lib/supabase.js
```

Never hard-code Supabase credentials.

Use environment variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

The anon key may exist in the frontend as intended by Supabase, but access control must rely on RLS.

Never place a Supabase service-role key in frontend code.

---

## 5. Authentication Rules

Use Supabase Auth.

Application profile data must come from the `profiles` table.

Expected role values:

```text
student
advisor
dean
```

Frontend route guards are for user experience only.

They are NOT considered security boundaries.

All sensitive data access and role actions must also be protected using Supabase RLS and/or safe database functions.

---

## 6. Role Permissions

### Student

Student may:

- View own profile.
- View PC availability.
- Create own booking request.
- View own bookings.
- Cancel allowed own bookings.

Student must never:

- Approve requests.
- Reject requests as an approver.
- Update approval records.
- Change their role.
- Change a booking directly to `approved`.
- Read another student's private booking history unless explicitly allowed.

### Advisor

Advisor may:

- View assigned students' booking requests.
- Approve at Advisor stage.
- Reject at Advisor stage.
- Add review comments.

Advisor must never:

- Perform Dean approval.
- Approve unrelated student requests unless the product rules are changed.

### Dean

Dean may:

- View requests in the Dean review stage.
- Approve final requests.
- Reject final requests.
- View administrative booking information required for review.

---

## 7. Booking Workflow Rules

Use the following statuses unless requirements change:

```text
draft
pending_advisor
pending_dean
approved
rejected
cancelled
completed
```

Valid primary transitions:

```text
draft
→ pending_advisor

pending_advisor
→ pending_dean
→ rejected

pending_dean
→ approved
→ rejected

approved
→ cancelled (only if cancellation rules allow)
→ completed
```

Do not allow arbitrary status changes from the client.

Prefer encapsulating important transitions in database RPC functions if direct table updates would make authorization fragile.

---

## 8. Booking Conflict Rules

Never rely solely on UI validation for booking availability.

A booking request must satisfy:

```text
start_time < end_time
```

A PC cannot have overlapping active booking periods.

Treat these statuses as blocking unless requirements state otherwise:

```text
pending_advisor
pending_dean
approved
```

Overlap rule:

```text
new_start < existing_end
AND
new_end > existing_start
```

If both are true for the same PC/date, the request conflicts.

The final conflict check must happen at database level or inside a transaction-safe Supabase/PostgreSQL function.

Frontend availability checking is still useful for user feedback, but it is not enough to guarantee correctness.

---

## 9. Database Rules

Preferred tables:

```text
profiles
pcs
bookings
approvals
```

### profiles

Expected fields:

```text
id
full_name
email
university_id
role
advisor_id
created_at
updated_at
```

`profiles.id` should reference `auth.users.id`.

### pcs

Expected fields:

```text
id
pc_number
room
status
specification
notes
created_at
updated_at
```

### bookings

Expected fields:

```text
id
student_id
pc_id
booking_date
start_time
end_time
purpose
course_or_project
status
rejection_reason
submitted_at
approved_at
cancelled_at
created_at
updated_at
```

### approvals

Expected fields:

```text
id
booking_id
approver_id
approver_role
decision
comment
decided_at
```

Use proper foreign keys, indexes, constraints, and timestamps.

Do not duplicate profile names or PC metadata inside bookings unless a historical snapshot is intentionally required.

---

## 10. Service Layer Rules

Do not put Supabase queries directly inside large React pages when avoidable.

Use feature services.

Examples:

```text
features/auth/services/authService.js
features/bookings/services/bookingService.js
features/approvals/services/approvalService.js
features/pcs/services/pcService.js
```

Pages should mostly:

1. Obtain data through hooks/services.
2. Render state.
3. Handle user interaction.
4. Call mutations/actions.

Business logic should not be duplicated in multiple pages.

---

## 11. Query and State Management

Use TanStack Query for server state when available.

Examples:

```text
useMyBookings
useBooking
useAvailablePcs
useAdvisorRequests
useDeanRequests
```

After mutations, invalidate or update the relevant query cache.

Do not fetch the same data repeatedly using unrelated `useEffect` calls if TanStack Query already owns that server state.

Use local React state for UI-only state such as:

- Dialog open/closed.
- Selected filter.
- Temporary UI tab state.

---

## 12. Forms and Validation

Use React Hook Form + Zod.

Validation should exist on both frontend and database where appropriate.

Example booking validation:

- PC required.
- Date required.
- Start time required.
- End time required.
- Start must be before end.
- Purpose required.
- Purpose length should have reasonable bounds.
- Past booking dates should not be accepted unless explicitly required.

Never assume frontend validation protects the database.

---

## 13. Routing Rules

Use React Router.

Suggested routes:

```text
/login
/dashboard
/calendar
/profile
/pcs
/bookings
/bookings/new
/bookings/:id
/advisor/requests
/advisor/requests/:id
/dean/requests
/dean/requests/:id
```

Use:

```text
ProtectedRoute
RoleRoute
```

Do not duplicate separate authentication logic in every page.

---

## 14. UI/UX Guidelines

Design should be:

- Clean.
- Simple.
- University/professional.
- Responsive.
- Easy to scan.

Use consistent status labels.

Example:

```text
Pending Advisor
Pending Dean
Approved
Rejected
Cancelled
Completed
```

Always provide:

- Loading states.
- Error states.
- Empty states.
- Success feedback.

Require confirmation for destructive or consequential actions such as:

- Reject request.
- Cancel booking.

Rejection should require a reason.

---

## 15. Error Handling

Never silently ignore Supabase errors.

A service should return data or throw/return an actionable error.

Example:

```js
const { data, error } = await supabase
  .from('bookings')
  .select('*')

if (error) throw error

return data
```

Present a user-friendly message in the UI while preserving useful console/debug details during development.

---

## 16. Security Rules

Treat authorization as a database responsibility.

Required security practices:

- Enable RLS on application tables.
- Do not expose service-role credentials.
- Do not trust `role` values sent from the client.
- Do not trust user-provided student IDs for ownership.
- Derive authenticated identity from `auth.uid()`.
- Use foreign keys.
- Validate allowed status transitions.
- Verify Advisor ownership/assignment when approving.
- Verify Dean role for final approval.
- Validate booking conflicts in database logic.

If security and convenience conflict, choose security.

---

## 17. Code Quality Rules

The agent should:

- Prefer small focused components.
- Avoid files that grow unnecessarily large.
- Reuse shared components.
- Avoid repeated query logic.
- Use descriptive variable/function names.
- Remove dead code.
- Avoid premature abstraction.
- Keep the project understandable for university students.

Do not rewrite working architecture just to use a different style.

If existing code already solves the problem cleanly, improve it rather than replacing it.

---

## 18. Naming Conventions

### Components

PascalCase:

```text
BookingForm.jsx
BookingCard.jsx
ApprovalActions.jsx
```

### Hooks

Start with `use`:

```text
useAuth.js
useBookings.js
useRole.js
```

### Services

camelCase functions:

```text
createBooking
getMyBookings
approveAsAdvisor
approveAsDean
```

### Constants

Use uppercase constant objects when appropriate:

```js
export const USER_ROLES = {
  STUDENT: 'student',
  ADVISOR: 'advisor',
  DEAN: 'dean',
}
```

---

## 19. Database Migration Rules

Schema changes should be reproducible.

Store SQL migrations under:

```text
supabase/migrations/
```

Do not rely only on manually editing tables in the Supabase dashboard.

For meaningful schema changes, create a migration.

Seed/demo data should go in:

```text
supabase/seed.sql
```

Never put production passwords or private credentials in seed files.

---

## 20. Development Workflow for the Agent

Before changing code:

1. Understand the requested feature.
2. Inspect the existing project structure.
3. Inspect related files.
4. Determine whether existing code can be reused.
5. Check database implications.
6. Check RLS/security implications.
7. Make the smallest coherent change.
8. Test or explain how to test it.

When implementing a feature, consider all layers:

```text
UI
→ validation
→ service/hook
→ Supabase query/function
→ database constraints/RLS
```

Do not implement only the UI when the feature requires backend enforcement.

---

## 21. Feature Completion Checklist

Before declaring a feature complete, verify:

- Correct role can access it.
- Incorrect roles cannot access it.
- Loading state works.
- Empty state works.
- Success path works.
- Error path works.
- Form validation works.
- Supabase errors are handled.
- RLS permits valid operations.
- RLS blocks invalid operations.
- Queries refresh correctly after mutations.
- No overlapping booking vulnerability was introduced.
- UI is usable on normal laptop width.
- Code follows project architecture.

---

## 22. Testing Priorities

Highest-priority scenarios:

### Authentication

- Student login.
- Advisor login.
- Dean login.
- Logged-out protected route access.

### Student Booking

- Valid booking.
- Invalid time range.
- PC under maintenance.
- Overlapping booking.
- Own booking list.

### Advisor

- Advisor sees assigned student request.
- Advisor does not see unauthorized request.
- Approve moves request to `pending_dean`.
- Reject moves request to `rejected`.
- Rejection reason is stored.

### Dean

- Dean sees Advisor-approved request.
- Approve moves request to `approved`.
- Reject moves request to `rejected`.

### Security

- Student cannot manually approve through Supabase client.
- Student cannot read another student's private booking.
- Advisor cannot execute Dean action.
- Unauthenticated user cannot access protected tables.

### Race Condition

- Two users attempt to reserve the same PC/time.
- Database must accept at most one conflicting active reservation according to the chosen policy.

---

## 23. MVP Boundary

Do not distract from the core project by implementing future features unless requested.

MVP focus:

```text
Authentication
Roles
PC availability
Student booking
Advisor approval
Dean approval
Conflict prevention
Status tracking
History
RLS security
```

Features such as QR codes, notifications, analytics, admin panels, or university SSO are Phase 2 unless explicitly requested.

---

## 24. Communication Rules for the Coding Agent

When responding to implementation requests:

- State what files will change.
- Explain important architecture/security decisions briefly.
- Provide complete code for new files when practical.
- Avoid unexplained placeholders.
- Do not pretend code was tested if it was not.
- Call out required Supabase SQL/RLS changes explicitly.
- If requirements are ambiguous and materially affect data/security, ask before committing to a risky design.

When debugging:

- Identify the root cause first.
- Prefer fixing the underlying problem instead of hiding the symptom.
- Do not rewrite unrelated files.

---

## 25. Product Principle

The system should always make the current approval state obvious.

At any moment, the user should be able to answer:

```text
Who requested this booking?
Which PC is requested?
When is it requested?
Why is it needed?
Who needs to approve it next?
Has anyone rejected it?
Is the PC actually reserved?
```

If the UI or data model makes these questions difficult to answer, improve the design before adding more features.

