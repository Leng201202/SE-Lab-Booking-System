# Candidate User Journey

## Journey Status

This journey represents the proposed happy path and conflict path. It is **To Be Validated** through interviews and prototype testing; it is not an observation of current user behavior.

## Primary Journey: Find and Book an SE Lab Resource

| Stage | Candidate user goal/action | Proposed system response | Hypothesis to test | Related artifacts |
|---|---|---|---|---|
| 1. Need arises | A student identifies a task, required capabilities, group size, date, and duration. | None yet. | Do users begin with resource type, capability, location, or time? | UP-03, UP-04 |
| 2. Access | Student signs in. | Authenticate and open dashboard according to role. | Which identity/account is expected, and is sign-in a barrier? | REQ-001; DS-00 |
| 3. Choose category | Student chooses High-Performance PC, iMac, Standard PC, or Meeting Room. | Show category counts/statuses and resource list. | Are these labels understood and mutually useful? | REQ-002; DS-01 |
| 4. Narrow options | Student searches/filters by availability and relevant details. | Update matching resources without hiding why others do not match. | Which filters and details drive decisions? | REQ-003–REQ-005; DS-01 |
| 5. Assess resource | Student opens a resource and reviews verified details and schedule. | Show specifications/capacity/equipment, current status, and upcoming availability. | How much information is sufficient and trustworthy? | REQ-004–REQ-006; DS-02 |
| 6. Choose interval | Student selects date, start, end, and enters purpose. | Validate basic input and show a booking summary. | What time granularity, duration, purpose, and lab-hour rules apply? | REQ-007, REQ-017; DS-03 |
| 7. Submit | Student confirms the request. | Recheck availability at submission time. | Do users expect immediate confirmation or approval? | REQ-008; DS-03 |
| 8A. Success | Student receives confirmation. | Show booking reference, resource, date/time, status, and next actions. | Which confirmation channel/details are needed? | REQ-009; DS-05 |
| 8B. Conflict | Student learns that the same resource overlaps an active booking. | Do not create the booking; explain the conflict and offer another time/resource. | Which alternatives best help recovery without exposing personal data? | REQ-008, REQ-009; DS-04 |
| 9. Manage | Student reviews the booking and may cancel or reschedule. | Show My Bookings, details, and policy-compliant actions. | Which change/no-show rules reflect actual practice? | REQ-010–REQ-012; DS-06 |

## Candidate Conflict Scenario

```text
Existing: Student A → PC-01 → 10:00–12:00
Request:  Student B → PC-01 → 11:00–13:00
Outcome:  Conflict; no second booking is confirmed

Alternative request: Student B → PC-02 → 11:00–13:00
Outcome: May proceed if PC-02 has no overlapping active booking and passes other rules
```

The interface should not reveal Student A's identity unless a verified policy and legal basis explicitly require it.

## Administrator Journey — To Be Validated

| Stage | Candidate administrator action | Proposed system response | Open question |
|---|---|---|---|
| Sign in | Access administrative area. | Verify role and allowed action. | Who is an administrator and how is authority assigned? |
| Inspect | Review resources and bookings. | Provide searchable operational views. | Which fields and date ranges are needed? |
| Maintain resource | Correct verified resource details or change status. | Validate change and show it to users. | Is approval/audit history required? |
| Handle disruption | Mark resource unavailable/maintenance. | Prevent inappropriate new bookings. | What happens to existing bookings and who is notified? |
| Manage booking | Perform an approved support action. | Apply conflict and policy checks. | Can admins override rules, and if so under what controls? |

## Prototype Research Tasks

During tests, ask participants to:

1. Find a computer suitable for a stated real task without prompting.
2. Determine when it is next available.
3. Attempt a booking for a specific interval.
4. Recover from a simulated booking conflict.
5. Find, reschedule, and cancel a sample booking.
6. Explain the meaning of each resource status in their own words.

Measure task completion, navigation errors, misunderstood terms, missing information, and participant explanation. Do not treat positive comments alone as validation.
