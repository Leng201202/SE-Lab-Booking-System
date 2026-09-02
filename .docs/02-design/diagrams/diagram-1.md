# Diagram 1 — System Context

Status: **To Be Validated** (`DGM-01`). External services and data exchanges are candidates, not confirmed integrations.

```mermaid
flowchart LR
    Student["Student / project-team member"]
    Admin["SE Lab administrator"]
    Staff["Lecturer / responsible staff"]
    Identity["University identity service<br/>(integration pending confirmation)"]
    System["SE Lab Resource<br/>Booking System"]

    Student -->|"Browse resources; request and manage own bookings"| System
    System -->|"Availability; booking result; own booking details"| Student
    Admin -->|"Manage verified resources, statuses, and approved booking actions"| System
    System -->|"Operational resource and booking views"| Admin
    Staff -.->|"Policies or oversight<br/>(role pending validation)"| System
    System -.->|"Authenticate / receive identity attributes<br/>(method pending)"| Identity
```

## Boundary Notes

- The system covers High-Performance PCs, iMacs, Standard PCs, and Meeting Rooms.
- Identity integration, notifications, and lecturer access have not been confirmed.
- The public availability view should not expose unnecessary personal data.
- Relevant requirements: REQ-001, REQ-002, REQ-013–REQ-016, REQ-019, REQ-020.

## Questions for Validation

- Which people are eligible to book or administer each resource?
- Is there an existing university sign-in service the project must use?
- Do staff require direct system access or only reports/policy ownership?
- Are notifications in scope, and through which approved channel?
