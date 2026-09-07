# Diagram 2 — Use case diagram

```mermaid
flowchart LR
    Student([Student])
    Teacher([Teacher])
    Visitor([Signed-out visitor])

    UC0((Sign in / sign up))
    UC1((View live timetable))
    UC2((Navigate day))
    UC3((Book a computer\nonsite or remote))
    UC4((View booking detail))
    UC5((Cancel own booking))
    UC6((Sign out))

    Visitor --> UC0
    Student --> UC0
    Student --> UC1
    Student --> UC2
    Student --> UC3
    Student --> UC4
    Student --> UC5
    Student --> UC6
    Teacher --> UC0
    Teacher --> UC1
    Teacher --> UC2
    Teacher --> UC3
    Teacher --> UC4
    Teacher --> UC5
    Teacher --> UC6

    UC3 -.include.-> UC7((Reject if slot overlaps\nan existing booking))
```

Students and teachers share the exact same use cases — there's no separate
admin role in the current build; a booking's role label (student/teacher)
is informational, not a permission gate.
