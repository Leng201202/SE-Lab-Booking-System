# Diagram 2 — Use case diagram

```mermaid
flowchart LR
    Student([Student])
    Advisor([Advisor])
    Dean([Dean])
    Visitor([Visitor])

    UC0((Select demo role))
    UC1((View PC availability))
    UC2((Navigate dates))
    UC3((Submit booking request))
    UC4((View booking detail))
    UC5((Cancel eligible request))
    UC6((Sign out))
    UC7((Approve or reject\nas Advisor))
    UC8((Approve or reject\nas Dean))
    UC9((Validate PC, dates,\nhours and conflicts))

    Visitor --> UC0
    Student --> UC0
    Student --> UC1
    Student --> UC2
    Student --> UC3
    Student --> UC4
    Student --> UC5
    Student --> UC6
    Advisor --> UC0
    Advisor --> UC1
    Advisor --> UC4
    Advisor --> UC6
    Advisor --> UC7
    Dean --> UC0
    Dean --> UC1
    Dean --> UC4
    Dean --> UC6
    Dean --> UC8

    UC3 -.include.-> UC9
    UC7 -.extends.-> UC4
    UC8 -.extends.-> UC4
```

Students submit requests after the form validates the PC, dates, hours, and
conflicts. Advisors handle `pending_advisor` requests, then Deans handle
`pending_dean` requests. The demo uses role-based route guards and seeded
roles; production authorization and authentication remain planned backend
work.
