# User manual — SE Lab PC Booking System

This manual explains how to use the SE Lab PC Booking System at Mae Fah Luang University. It is written for the three kinds of users of the system: **Students**, **Advisors**, and the **Dean**.

> For installation, deployment, and developer setup, see the root [README](../../README.md) and [supabase/README.md](../../supabase/README.md). This manual covers day-to-day use of the web application only.

## Contents

1. [Overview](#1-overview)
2. [Signing in](#2-signing-in)
3. [Finding your way around](#3-finding-your-way-around)
4. [Booking rules at a glance](#4-booking-rules-at-a-glance)
5. [Student guide](#5-student-guide)
6. [Advisor guide](#6-advisor-guide)
7. [Dean guide](#7-dean-guide)
8. [Booking statuses](#8-booking-statuses)
9. [Troubleshooting and FAQ](#9-troubleshooting-and-faq)

---

## 1. Overview

The system lets members of the Software Engineering lab reserve a lab PC, either for use **in the lab** during opening hours or for **24-hour remote access** over several days. Every request is checked for conflicts, and requests go through an approval chain depending on who submits them:

| Who requests | Approval path |
|---|---|
| Student | Advisor review → Dean review → Approved |
| Advisor | Dean review → Approved |
| Dean | Approved immediately (if the PC and time are available) |

All dates and times in the system use **Bangkok time (UTC+7)**.

## 2. Signing in

1. Open the SE Lab PC Booking System in your web browser.
2. Click **Continue with Google**.
3. Choose your **university Google account** and allow access.
4. You will be redirected back to the system and taken to your **Dashboard**.

**About roles:** every new account starts as a **Student**. Advisor and Dean roles are assigned by the university (via a protected allowlist or by the Dean). You cannot change your own role.

**Signing out:** click your name/initials in the top-right corner, then choose **Log out**.

## 3. Finding your way around

The left sidebar shows the pages available for your role. On a phone, tap the **☰ menu** icon at the top-left to open it.

| Page | Student | Advisor | Dean | What it's for |
|---|:-:|:-:|:-:|---|
| Dashboard | ✓ | ✓ | ✓ | Summary counts, upcoming booking, recent requests |
| Book a PC | ✓ | ✓ | ✓ | Submit a new booking request |
| My Bookings | ✓ | ✓ | ✓ | Your own requests and their status |
| Calendar | ✓ | ✓ | ✓ | Weekly/daily availability of every PC |
| Profile | ✓ | ✓ | ✓ | Your account details, Student ID, role, and Advisor |
| Pending Requests / Pending Approval | | ✓ | ✓ | Requests waiting for your decision |
| Request History / Approval History | | ✓ | ✓ | Requests you have already decided |
| Manage Advisees | | ✓ | | Assign or release Students |
| PC Inventory | | ✓ | ✓ | List of lab PCs and their specifications |
| User Management | | | ✓ | Change roles and assign Advisors |
| PC Management | | | ✓ | Add and edit PCs |

## 4. Booking rules at a glance

| Rule | Details |
|---|---|
| Lab opening hours | **08:00 – 18:00** for one-day (in-lab) bookings |
| Time steps | Start and end times are chosen in **15-minute** steps |
| One-day booking | Start date = end date; choose a start and end time within opening hours |
| Multi-day booking | End date after start date; the PC is reserved **24 hours a day** for the whole range with **remote access** |
| No past bookings | You cannot book a past date. When booking for today, the earliest start is the **next 15-minute slot** |
| Multi-day start | A multi-day reservation must start **tomorrow or later** |
| Purpose | Required, at least 5 characters |
| Course / Project | Optional |
| Unavailable PCs | PCs in **Maintenance** or **Inactive** status cannot be booked |
| Conflicts | A PC cannot be double-booked. Pending Advisor, Pending Dean, and Approved bookings all block the time |

## 5. Student guide

### 5.1 Before your first booking

You must have a **Student ID** and an **assigned Advisor** before you can submit a request.

- For a 10-digit numeric `@lamduan.mfu.ac.th` account, the Student ID is filled automatically from the email address and cannot be changed in the application. Contact the system administrator if the university account is incorrect.
- Otherwise, open **Profile**, click the **Student ID** row, enter the 10-digit ID from your university record, click **Review Student ID**, and confirm the exact value before saving.
- To correct a manually entered value, click the same **Student ID** row and complete the confirmation flow again.
- Check **Profile → School / Advisor**. If it says *Advisor not assigned*, ask your Advisor to assign you in the system (or contact the Dean).

### 5.2 Check availability on the Calendar

1. Open **Calendar**.
2. The **Week** view shows all PCs for seven days. Use **Previous**, **Today**, and **Next** to move between weeks.
3. Click a day heading (or a PC cell) to open the **Timeline** for that day.
4. In the Timeline, free time is empty; booked time is shown as blocks. Past days and elapsed times are read-only.
5. Click and drag on a free area of a PC's row to select a time. You can **drag the selection to move it** or **drag either edge to resize** it.
6. Click **Book selected time**. The booking form opens with the PC, date, and time already filled in.

> The calendar only shows that a PC is busy. For privacy, other people's names and purposes are hidden.

### 5.3 Submit a booking request

1. Open **Book a PC** (or come from the Calendar as above).
2. **PC** — choose an available workstation. The right-hand panel shows its room and specification.
3. **Start date** and **End date**
   - Same date → one-day in-lab booking. Enter **Start time** and **End time** (08:00–18:00).
   - Different dates → multi-day **24-hour remote reservation**. No times are needed.
4. **Purpose** — describe what you need the PC for (e.g. *Run the integration tests for our capstone project*).
5. **Course / Project** — optional (e.g. *SE 498 · Capstone Project*).
6. Click **Submit booking request**.

If the request is accepted you will see its detail page with status **Pending Advisor**. If it is not accepted, a red **Request not submitted** box explains why (for example, the time conflicts with another booking).

### 5.4 Track your requests

- **My Bookings** lists all your requests. Use the status filter to narrow the list.
- Click a request to open its detail page. The **Approval progress** section shows each step: Advisor review → Dean review → Final booking.
- If a request is **Rejected**, the detail page shows who rejected it and the **rejection reason**. You can submit a new request with corrected details.
- The **Dashboard** shows your next **Upcoming approved booking**.

## 6. Advisor guide

Advisors can do everything a Student can, plus review requests from their advisees.

### 6.1 Manage advisees

1. Open **Manage Advisees**.
2. For an unassigned Student, click **Assign to me**.
3. To stop advising a Student, click **Release** next to their name.

You can only manage Students who are unassigned or already assigned to you.

### 6.2 Review Student requests

1. Open **Pending Requests**. Requests from your assigned Students with status *Pending Advisor* appear here. The Dashboard also shows **Requests requiring attention**.
2. Click a request to see the PC, dates, times, purpose, and course.
3. Choose one:
   - **Approve** — the request moves to **Pending Dean** for final review.
   - **Reject** — enter a **rejection reason** (required) and confirm. The Student will see this reason.
4. Decided requests appear in **Request History**.

### 6.3 Your own bookings

When an Advisor books a PC, the Advisor review step is skipped and the request goes straight to **Pending Dean**.

### 6.4 PC Inventory

**PC Inventory** lists every lab PC with its room, specification, and status (Available, Maintenance, Inactive).

## 7. Dean guide

The Dean gives final approval and administers users and PCs.

### 7.1 Final approval

1. Open **Pending Approval**. It lists Student requests already approved by an Advisor and requests submitted directly by Advisors.
2. Open a request and click **Approve** to confirm the booking, or **Reject** with a reason.
3. Decided requests appear in **Approval History**. Every decision is permanently recorded in the audit history.

### 7.2 Dean bookings

A booking made by the Dean is **approved immediately**, as long as the PC is available and there is no conflict.

### 7.3 User management

1. Open **User Management**. Totals for Students, Advisors, and Deans are shown at the top.
2. Use the **Role** dropdown to change a user's role (you cannot change your own role).
3. For Students, use **Assigned Advisor** to assign or change their Advisor.

### 7.4 PC management

1. Open **PC Management**.
2. Click **Add PC** and enter the **PC code**, **Room**, **Specification**, **Status**, and optional **Notes**.
3. Click **Edit PC** on an existing PC to update its details. Set the status to **Maintenance** or **Inactive** to stop new bookings for that PC.

## 8. Booking statuses

| Status | Meaning | Blocks the PC? |
|---|---|:-:|
| Pending Advisor | Waiting for the Student's Advisor | Yes |
| Pending Dean | Waiting for the Dean's final decision | Yes |
| Approved | Confirmed — you may use the PC | Yes |
| Rejected | Declined; see the rejection reason | No |
| Cancelled | No longer active | No |
| Completed | The booking period has finished | No |

## 9. Troubleshooting and FAQ

**I can't submit a booking — it says I need an Advisor.**
Your account has no assigned Advisor. Ask your Advisor to use *Manage Advisees → Assign to me*, or contact the Dean.

**The start time I want is not accepted.**
For today, the earliest start is the next 15-minute slot after the current Bangkok time. Times must be between 08:00 and 18:00, and the end time must be after the start time.

**"No booking times remain today. Choose a future date."**
It is too late in the day for a new in-lab booking. Pick tomorrow or later.

**"A multi-day reservation must start tomorrow or later."**
Multi-day remote bookings begin at 00:00, so they cannot start today.

**A PC is greyed out in the list.**
It is in Maintenance or Inactive status. Choose another PC or check again later.

**My request was rejected because of a conflict.**
Someone else already holds that PC for an overlapping time. Check the Calendar and choose a free time or a different PC.

**My role is wrong (e.g. I am an Advisor but see the Student menu).**
Roles are assigned by the university. Contact the Dean or system administrator. Sign out and sign in again after the change.

**Can I cancel or edit a request?**
Not yet. Cancellation and rebooking are planned features (see the [feature list](../02-design/feature-list.md)). Contact your Advisor or the Dean if you need a change.

**Sign-in fails or loops back to the login page.**
Make sure you are using your university Google account, allow pop-ups/redirects, and try again. If it continues, contact the system administrator.
