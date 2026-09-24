# Diagram 2 — Use case diagram

~~~mermaid
flowchart LR
    Visitor([Visitor])
    Student([Student])
    Advisor([Advisor])
    Dean([Dean])
    Operator([University operator])

    SignIn((Sign in with Google))
    Availability((View sanitized availability))
    Inventory((View PC inventory))
    Submit((Submit booking request))
    OwnRecords((View own requests))
    Cancel((Cancel own active future booking))
    AdvisorReview((Review assigned Student request))
    DeanReview((Give final decision))
    Advisees((Manage own advisees))
    Users((Manage users and roles))
    PCs((Manage PC inventory))
    Audit((Record approval event))
    Validate((Validate role, PC, interval, and conflict))
    Configure((Configure roles, assignments, and PCs))

    Visitor --> SignIn
    Student --> Availability
    Student --> Inventory
    Student --> Submit
    Student --> OwnRecords
    Student --> Cancel
    Advisor --> Availability
    Advisor --> Submit
    Advisor --> OwnRecords
    Advisor --> Cancel
    Advisor --> AdvisorReview
    Advisor --> Advisees
    Dean --> Availability
    Dean --> Submit
    Dean --> OwnRecords
    Dean --> Cancel
    Dean --> DeanReview
    Dean --> Users
    Dean --> PCs
    Operator --> Configure

    Submit -. includes .-> Validate
    Cancel -. includes .-> Validate
    AdvisorReview -. includes .-> Audit
    DeanReview -. includes .-> Audit
    AdvisorReview -. includes .-> Validate
    DeanReview -. includes .-> Validate
~~~

Google authentication identifies the user. Trusted database profiles authorize each use case. Students cannot choose their role, Advisors cannot review unassigned Students, and only Deans manage roles or PC inventory. Student requests use both review stages, Advisor requests skip Advisor review, and Dean requests are immediately approved only after database validation. Every requester role may cancel only its own active future booking with a reason.
