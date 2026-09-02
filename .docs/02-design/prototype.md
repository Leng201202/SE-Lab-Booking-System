# Low-Fidelity Prototype Specification

## Status and Conventions

This text prototype is **To Be Validated**. It defines screens and interactions for discussion; it is not production UI code.

- `[Button]` denotes a proposed action.
- `<field>` denotes a proposed input.
- Placeholder hardware values are deliberate.
- Another user's name or purpose is not shown in public availability views.

## Screen Map

```text
DS-00 Sign In
  └─> DS-01 Resource Dashboard
        └─> DS-02 Resource Detail
              └─> DS-03 Create/Reschedule Booking
                    ├─> DS-04 Conflict
                    └─> DS-05 Confirmation
        └─> DS-06 My Bookings

DS-00 Sign In (authorized administrator)
  └─> DS-07 Admin Workspace
```

## DS-00 — Sign In

```text
+------------------------------------------------------+
| SE Lab Resource Booking                              |
|------------------------------------------------------|
| Sign in using: Pending stakeholder decision          |
|                                                      |
| <University account / identity method>               |
| [Sign in]                                            |
|                                                      |
| Access/help text: To Be Validated                     |
+------------------------------------------------------+
```

Related: REQ-001, REQ-016, FT-01, FT-16.

## DS-01 — Resource Dashboard

```text
+------------------------------------------------------+
| SE Lab Resources          [My Bookings] [Account]     |
|------------------------------------------------------|
| <Search resources>  <Date>  <Availability filter>    |
|                                                      |
| [High-Performance PCs] [iMacs] [Standard PCs]        |
| [Meeting Rooms]                                      |
|------------------------------------------------------|
| PC-01 | High-Performance PC | Available | [Details]  |
| IMAC-01 | iMac              | Booked    | [Details]  |
| PC-05 | Standard PC         | Available | [Details]  |
| ROOM-01 | Meeting Room      | Maintenance| [Details] |
|                                                      |
| Status definitions: To Be Validated                  |
+------------------------------------------------------+
```

The IDs and statuses are illustrative labels, not actual inventory data. Related: REQ-002, REQ-003, REQ-013, REQ-018.

## DS-02 — Resource Detail

### Computer variant

```text
+------------------------------------------------------+
| < Back               PC-01 — High-Performance PC     |
|------------------------------------------------------|
| Status: Available (definition To Be Validated)        |
| CPU: Replace with actual SE Lab specification         |
| GPU: Replace with actual SE Lab specification         |
| RAM: Replace with actual SE Lab specification         |
| Storage: Replace with actual SE Lab specification     |
| OS: Replace with actual SE Lab specification          |
| Software: Replace with verified inventory             |
|------------------------------------------------------|
| Availability: <Date>  [Calendar] [Accessible list]    |
| 09:00–10:00 Available                                 |
| 10:00–12:00 Reserved (user identity hidden)           |
| 12:00–...   Availability pending actual data          |
|                                                      |
| [Book this resource]                                  |
+------------------------------------------------------+
```

### Meeting-room variant

Replace specification rows with `Capacity: Not yet collected` and `Equipment: Not yet collected`. Related: REQ-004–REQ-006, REQ-018.

## DS-03 — Create or Reschedule Booking

```text
+------------------------------------------------------+
| Book PC-01                                           |
|------------------------------------------------------|
| Date:       <YYYY-MM-DD>                              |
| Start time: <HH:MM>                                  |
| End time:   <HH:MM>                                  |
| Purpose:    <Purpose — format To Be Validated>       |
|                                                      |
| Candidate rules:                                     |
| - End must be after start                            |
| - Lab hours/duration/quotas: Pending policy          |
| - Availability is checked again on confirmation      |
|                                                      |
| [Cancel] [Review and confirm]                        |
+------------------------------------------------------+
```

The reschedule variant must preserve the original booking unless the new interval is successfully confirmed. Related: REQ-007, REQ-008, REQ-012, REQ-017.

## DS-04 — Booking Conflict

```text
+------------------------------------------------------+
| Booking not completed                                |
|------------------------------------------------------|
| PC-01 is not available for 11:00–13:00 on <date>.    |
| No booking was created.                              |
|                                                      |
| [Choose another time] [Choose another resource]      |
|                                                      |
| Suggested alternatives: To Be Validated              |
+------------------------------------------------------+
```

Do not expose who owns the conflicting booking. Related: REQ-008, REQ-009, REQ-017.

## DS-05 — Booking Confirmation

```text
+------------------------------------------------------+
| Booking confirmed                                    |
|------------------------------------------------------|
| Reference: <Generated booking reference>             |
| Resource:  PC-01                                     |
| Date:      <Selected date>                           |
| Time:      10:00–12:00                               |
| Status:    Confirmed                                 |
| Purpose:   <Entered purpose>                         |
|                                                      |
| [View My Bookings] [Return to resources]             |
+------------------------------------------------------+
```

Notification channel and approval states are **To Be Validated**. Related: REQ-009.

## DS-06 — My Bookings and Detail

```text
+------------------------------------------------------+
| My Bookings                         [Upcoming] [Past]  |
|------------------------------------------------------|
| PC-01 | <date> | 10:00–12:00 | Confirmed [Details]   |
|------------------------------------------------------|
| Selected booking                                    |
| Resource/details/date/time/purpose/status            |
| [Reschedule] [Cancel booking]                        |
|                                                      |
| Cancellation/reschedule policy: Pending stakeholder  |
| decision                                             |
+------------------------------------------------------+
```

Before cancellation, show a confirmation step and resulting status. Related: REQ-010–REQ-012, REQ-020.

## DS-07 — Admin Workspace

```text
+------------------------------------------------------+
| Admin Workspace                                      |
|------------------------------------------------------|
| [Resources] [Bookings]                               |
| <Search> <Category> <Status> <Date>                  |
|------------------------------------------------------|
| Resource action: [Edit verified details]             |
|                  [Set maintenance/unavailable]        |
| Booking action:  [View] [Approved action TBD]        |
|                                                      |
| Authorized roles/audit fields: Pending stakeholder   |
| and Week 2 compliance evidence                       |
+------------------------------------------------------+
```

This screen does not assume a conflict override or permanent-delete function. Related: REQ-013–REQ-016, REQ-020.

## Prototype Validation Checklist

- Participant understands the resource hierarchy and category labels.
- Participant finds relevant verified computer or room information.
- Participant distinguishes Available, Booked, Unavailable, and Maintenance.
- Participant can select a valid interval and understands confirmation.
- Conflict recovery does not disclose another user's identity.
- Cancellation/rescheduling expectations are captured.
- Keyboard navigation, focus order, labels, errors, contrast, and non-calendar alternatives are reviewed.
- Missing fields and policies are recorded as findings, not silently guessed.
