# Diagram 2 — Candidate Use Cases

Status: **To Be Validated** (`DGM-02`). The diagram shows proposed responsibilities, not confirmed stakeholder requirements.

```mermaid
flowchart LR
    Student["Student"]
    Admin["SE Lab administrator"]

    subgraph System["SE Lab Resource Booking System"]
        UC1(["Authenticate"])
        UC2(["Browse/search/filter resources"])
        UC3(["View verified resource details"])
        UC4(["View availability"])
        UC5(["Request booking"])
        UC6(["Check input and conflicts"])
        UC7(["Receive confirmation/conflict result"])
        UC8(["View own bookings"])
        UC9(["Cancel booking"])
        UC10(["Reschedule booking"])
        UC11(["Manage resource records"])
        UC12(["Set maintenance/unavailable status"])
        UC13(["Manage bookings using approved actions"])
        UC14(["Enforce authorization"])
    end

    Student --> UC1
    Student --> UC2
    Student --> UC3
    Student --> UC4
    Student --> UC5
    Student --> UC8
    Student --> UC9
    Student --> UC10

    Admin --> UC1
    Admin --> UC11
    Admin --> UC12
    Admin --> UC13

    UC5 -->|"includes"| UC6
    UC5 -->|"includes"| UC7
    UC10 -->|"includes"| UC6
    UC1 --> UC14
    UC11 --> UC14
    UC12 --> UC14
    UC13 --> UC14
```

## Coverage

- Student use cases: REQ-001–REQ-012, REQ-017–REQ-020.
- Administrative use cases: REQ-013–REQ-016, REQ-019, REQ-020.
- “Approved actions” is intentionally non-specific until policy and interview evidence are collected.
