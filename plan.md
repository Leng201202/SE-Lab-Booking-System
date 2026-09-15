# SE Lab PC Booking System — Project Plan

## 1. Project Overview

The **SE Lab PC Booking System** is a role-based web application for booking computers in the Software Engineering laboratory.

The system digitizes the existing approval-style process used for university equipment borrowing. A student submits a request with the requested PC, date, time, and purpose. The request must then be reviewed by the student's Advisor and finally approved by the Dean before the booking becomes valid.

### Core Approval Flow

```text
Student submits request
        ↓
Pending Advisor Approval
        ↓
Advisor approves
        ↓
Pending Dean Approval
        ↓
Dean approves
        ↓
Booking Approved
        ↓
Student uses PC during approved period
```

If either the Advisor or Dean rejects the request, the booking becomes rejected and the student can view the rejection reason.

---

## 2. Project Goals

The system should:

- Replace manual booking/approval paperwork with a web-based workflow.
- Allow students to view PC availability before requesting a booking.
- Prevent overlapping PC reservations.
- Allow Advisors and the Dean to approve or reject requests.
- Clearly show booking status to all relevant users.
- Keep a history of booking requests and approval actions.
- Secure data and actions using Supabase Row Level Security.
- Provide a simple, responsive interface suitable for university users.

---

## 3. User Roles

### 3.1 Student

Students can:

- Sign in.
- View available PCs.
- View PC booking schedules.
- Create a booking request.
- Select a PC, date, start time, and end time.
- Enter the purpose of the booking.
- View the status of their requests.
- View Advisor/Dean rejection reasons.
- Cancel eligible requests.
- View past bookings.

### 3.2 Advisor

Advisors can:

- Sign in.
- View requests submitted by students assigned to them.
- Review booking information.
- Approve requests.
- Reject requests with a required comment/reason.
- View approval history.
- View PC schedules when reviewing requests.

### 3.3 Dean

The Dean can:

- Sign in.
- View requests already approved by Advisors.
- Review final booking details.
- Approve requests.
- Reject requests with a required reason.
- View approval and booking history.
- View lab booking schedules.

---

## 4. Booking Status Workflow

Recommended booking statuses:

```text
draft
pending_advisor
pending_dean
approved
rejected
cancelled
completed
```

### Status Rules

#### Draft
- Booking has not been submitted.
- Student can edit/delete it.

#### Pending Advisor
- Student has submitted the request.
- Advisor must approve or reject it.

#### Pending Dean
- Advisor has approved the request.
- Dean must approve or reject it.

#### Approved
- Dean has approved the request.
- The booking is confirmed.

#### Rejected
- Advisor or Dean rejected the request.
- Rejection reason must be stored.

#### Cancelled
- Student cancelled the booking before the allowed cutoff.

#### Completed
- Booking time has passed or booking was marked completed.

---

## 5. Recommended Technology Stack

### Frontend

- React
- Vite
- React Router
- Tailwind CSS
- React Hook Form
- Zod
- TanStack Query
- date-fns
- Lucide React

### Backend / Platform

- Supabase Auth
- Supabase PostgreSQL
- Supabase Row Level Security
- Supabase Realtime (optional for live status updates)
- Supabase Edge Functions only if privileged server-side logic is needed later

### Development Tools

- VS Code
- Git + GitHub
- Postman only when API testing is needed

---

## 6. Suggested Project Folder Structure

```text
se-lab-booking/
├── public/
├── src/
│   ├── app/
│   │   ├── App.jsx
│   │   ├── router.jsx
│   │   └── providers.jsx
│   │
│   ├── components/
│   │   ├── ui/
│   │   └── layout/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── bookings/
│   │   ├── approvals/
│   │   ├── pcs/
│   │   ├── calendar/
│   │   └── dashboard/
│   │
│   ├── hooks/
│   ├── lib/
│   │   └── supabase.js
│   ├── routes/
│   ├── utils/
│   ├── styles/
│   └── main.jsx
│
├── supabase/
│   ├── migrations/
│   └── seed.sql
│
├── .env
├── .env.example
├── package.json
├── vite.config.js
├── plan.md
└── agent.md
```

---

## 7. Database Design

### 7.1 profiles

Stores application-specific user data linked to Supabase Auth.

```text
profiles
- id uuid PK → auth.users.id
- full_name text
- email text
- university_id text
- role enum(student, advisor, dean)
- advisor_id uuid nullable → profiles.id
- created_at timestamptz
- updated_at timestamptz
```

Notes:
- `advisor_id` is mainly used for Student accounts.
- Student rows reference the Advisor responsible for approving them.

---

### 7.2 pcs

```text
pcs
- id uuid PK
- pc_number text UNIQUE
- room text
- status enum(available, maintenance, inactive)
- specification text nullable
- notes text nullable
- created_at timestamptz
- updated_at timestamptz
```

---

### 7.3 bookings

```text
bookings
- id uuid PK
- student_id uuid → profiles.id
- pc_id uuid → pcs.id
- booking_date date
- start_time time
- end_time time
- purpose text
- course_or_project text nullable
- status enum
- rejection_reason text nullable
- created_at timestamptz
- updated_at timestamptz
```

Recommended additional fields:

```text
- submitted_at timestamptz nullable
- approved_at timestamptz nullable
- cancelled_at timestamptz nullable
```

---

### 7.4 approvals

```text
approvals
- id uuid PK
- booking_id uuid → bookings.id
- approver_id uuid → profiles.id
- approver_role enum(advisor, dean)
- decision enum(approved, rejected)
- comment text nullable
- decided_at timestamptz
```

This table preserves an approval audit trail instead of storing only the latest state.

---

## 8. Important Database Constraints

### Booking Time Validation

Must ensure:

```text
start_time < end_time
```

### PC Availability

A PC must not have overlapping active bookings.

Conflicting statuses should normally include:

```text
pending_advisor
pending_dean
approved
```

Example conflict:

```text
Existing booking: 10:00–12:00
New booking:      11:00–13:00
Result: conflict
```

Use a database-side function/constraint or transaction-safe booking function where possible instead of depending only on frontend validation.

### PC Status

Students must not book PCs marked:

```text
maintenance
inactive
```

---

## 9. Supabase Authentication

Use Supabase Auth for login.

Recommended MVP:

- University email + password.
- User account created by administrator or pre-seeded for demo.

After authentication, retrieve the matching row from `profiles`.

The frontend should use the user's profile role to determine navigation and available pages.

Do not treat frontend role checks as security. Authorization must also be enforced with RLS.

---

## 10. Row Level Security Strategy

### Student

Can:

- Read their own profile.
- Read active PC information.
- Read their own bookings.
- Create their own booking requests.
- Update their own drafts.
- Cancel their own eligible bookings.

Cannot:

- Approve requests.
- Modify other students' bookings.
- Change booking status directly to approved.

### Advisor

Can:

- Read own profile.
- Read students assigned to them.
- Read booking requests belonging to assigned students.
- Perform Advisor approval/rejection.

Cannot:

- Perform Dean approval.
- Review unrelated students unless explicitly allowed.

### Dean

Can:

- Read requests that reached `pending_dean`.
- Approve/reject final requests.
- View approved booking information required for administration.

---

## 11. Frontend Routes

### Public

```text
/login
```

### Shared Protected Routes

```text
/dashboard
/calendar
/profile
```

### Student

```text
/bookings
/bookings/new
/bookings/:id
/pcs
```

### Advisor

```text
/advisor/requests
/advisor/requests/:id
```

### Dean

```text
/dean/requests
/dean/requests/:id
```

---

## 12. Main Pages

### Login Page

- University branding.
- Email.
- Password.
- Sign in button.
- Error handling.

### Student Dashboard

Show:

- Upcoming booking.
- Pending requests.
- Approved bookings.
- Rejected requests.
- Quick button to request a PC.
- Recent requests.

### PC Availability Page

Show:

- PC number.
- Current status.
- Availability.
- Optional specification.
- Book button.

### Create Booking Page

Fields:

- PC.
- Date.
- Start time.
- End time.
- Purpose.
- Course/project (optional).

Before submission:

- Check the PC is active.
- Check start/end time.
- Check overlapping bookings.
- Show request summary.

### My Bookings Page

Show:

- Booking ID.
- PC.
- Date/time.
- Purpose.
- Current status.
- Approval stage.
- Rejection reason if applicable.

### Advisor Request Page

Show:

- Student information.
- Requested PC.
- Date/time.
- Purpose.
- Current schedule/conflicts.
- Approve button.
- Reject button.
- Rejection comment input.

### Dean Request Page

Same concept as Advisor review but only for requests already approved by the Advisor.

### Calendar Page

Show:

- Daily/weekly bookings.
- PC schedule.
- Pending vs approved state.
- Optional filters by PC/date/status.

---

## 13. UI Components

Shared UI components:

```text
Button
Input
Select
Textarea
Modal
Dialog
Badge
Table
Card
LoadingSpinner
EmptyState
ErrorMessage
ConfirmDialog
```

Domain-specific components:

```text
BookingForm
BookingCard
BookingTable
BookingStatusBadge
ApprovalActions
PcCard
PcAvailability
BookingCalendar
DashboardStats
```

---

## 14. Service Layer

Supabase queries should not be scattered throughout pages.

Use feature services such as:

```text
features/auth/services/authService.js
features/bookings/services/bookingService.js
features/approvals/services/approvalService.js
features/pcs/services/pcService.js
```

Example responsibilities:

### bookingService.js

- createBooking
- getMyBookings
- getBookingById
- cancelBooking
- checkPcAvailability

### approvalService.js

- getAdvisorRequests
- getDeanRequests
- approveAsAdvisor
- rejectAsAdvisor
- approveAsDean
- rejectAsDean

### pcService.js

- getPcs
- getAvailablePcs
- getPcSchedule

---

## 15. Recommended State/Data Strategy

Use:

- Supabase Auth session for authentication.
- TanStack Query for server data.
- React Hook Form for forms.
- Zod for validation.

Avoid adding Redux unless the application becomes complex enough to truly need it.

---

## 16. Development Phases

### Phase 1 — Project Setup

- Create React + Vite project.
- Install dependencies.
- Configure Tailwind.
- Configure Supabase client.
- Configure environment variables.
- Configure React Router.
- Create basic layouts.

### Phase 2 — Database

- Create enums.
- Create profiles table.
- Create pcs table.
- Create bookings table.
- Create approvals table.
- Add indexes and foreign keys.
- Add validation constraints.
- Seed sample users and PCs.

### Phase 3 — Authentication

- Implement login.
- Restore auth session.
- Fetch current profile.
- Implement ProtectedRoute.
- Implement RoleRoute.
- Redirect users based on role.

### Phase 4 — Student Booking

- PC list.
- Availability view.
- Booking form.
- Booking validation.
- Submit booking.
- My bookings.
- Booking detail page.

### Phase 5 — Advisor Approval

- Advisor request list.
- Request detail.
- Approve action.
- Reject action + reason.
- Update booking workflow.

### Phase 6 — Dean Approval

- Dean request list.
- Request detail.
- Final approval.
- Reject action.
- Final booking confirmation.

### Phase 7 — Calendar and Conflict Handling

- Weekly/daily calendar.
- PC filtering.
- Prevent double booking.
- Handle simultaneous booking attempts safely.

### Phase 8 — Security

- Enable RLS on every application table.
- Add role-aware policies.
- Prevent client-side privilege escalation.
- Test unauthorized access manually.

### Phase 9 — UX Improvements

- Toast notifications.
- Loading/skeleton states.
- Empty states.
- Mobile responsiveness.
- Confirmation dialogs.
- Better booking status timeline.

### Phase 10 — Testing & Deployment

- Test all roles.
- Test booking conflicts.
- Test rejection paths.
- Test RLS.
- Test responsive UI.
- Deploy frontend.
- Configure production Supabase environment variables.

---

## 17. MVP Scope

The first usable version should contain only:

1. Authentication.
2. Student/Advisor/Dean roles.
3. PC list.
4. PC availability.
5. Student booking request.
6. Advisor approval/rejection.
7. Dean approval/rejection.
8. Booking status tracking.
9. Conflict prevention.
10. Booking history.
11. RLS authorization.

Do not add unnecessary functionality before the workflow is stable.

---

## 18. Future Features

After MVP:

- Email notifications.
- In-app notifications.
- QR check-in/check-out.
- Auto-complete bookings after end time.
- Maintenance requests.
- PC usage analytics.
- Admin role.
- Lab technician role.
- University SSO.
- Booking limits per student.
- Blackout periods.
- Attachments/supporting documents.
- Export booking reports.
- Dean/Advisor approval dashboard analytics.

---

## 19. Acceptance Criteria

The MVP is complete when:

- Students cannot access Advisor/Dean actions.
- Advisors cannot perform Dean approval.
- Students can only view and manage their own requests.
- Advisor sees only appropriate student requests.
- Dean receives only Advisor-approved requests.
- A booking cannot be fully approved without both approval stages.
- Rejected requests clearly show the reason.
- Two active bookings cannot overlap for the same PC.
- PCs under maintenance cannot be booked.
- RLS prevents unauthorized database operations.
- Booking data persists correctly in Supabase.
- The interface works on desktop and common mobile/tablet sizes.

---

## 20. Definition of Done for Each Feature

A feature is considered complete when:

- UI is implemented.
- Loading, empty, success, and error states exist.
- Form inputs are validated.
- Supabase errors are handled.
- Authorization is enforced in RLS where applicable.
- No secrets are exposed in source code.
- Code follows the project structure.
- No duplicate business logic exists unnecessarily.
- Feature is manually tested for all relevant roles.

