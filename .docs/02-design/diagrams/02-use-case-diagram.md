# Diagram 2 — Use case diagram

~~~mermaid
flowchart LR
    Visitor([Visitor])
    Student([Student])
    Technician([Technician])
    Advisor([Advisor])
    Dean([Dean])
    Operator([University operator])

    SignIn((Sign in with Google))
    Availability((View sanitized availability))
    Inventory((View PC inventory))
    Submit((Submit booking request))
    OwnRecords((View own requests))
    Cancel((Cancel own active future booking))
    TechnicianReview((Perform technical review))
    AdvisorReview((Review selected Student request))
    DeanReview((Give final decision))
    Users((Manage users and roles))
    PCs((Manage PC inventory))
    Audit((Record approval event))
    Validate((Validate role, PC, interval, and conflict))
    Configure((Configure roles and PCs))
    Deactivate((Deactivate own account))
    Reactivate((Reactivate within 90 days))

    Visitor --> SignIn
    Student --> Availability
    Student --> Inventory
    Student --> Submit
    Student --> OwnRecords
    Student --> Cancel
    Student --> Deactivate
    Technician --> Availability
    Technician --> Inventory
    Technician --> Submit
    Technician --> OwnRecords
    Technician --> Cancel
    Technician --> TechnicianReview
    Technician --> PCs
    Technician --> Deactivate
    Advisor --> Availability
    Advisor --> Submit
    Advisor --> OwnRecords
    Advisor --> Cancel
    Advisor --> AdvisorReview
    Advisor --> Deactivate
    Dean --> Availability
    Dean --> Submit
    Dean --> OwnRecords
    Dean --> Cancel
    Dean --> DeanReview
    Dean --> Users
    Dean --> PCs
    Dean --> Deactivate
    Student --> Reactivate
    Technician --> Reactivate
    Advisor --> Reactivate
    Dean --> Reactivate
    Operator --> Configure

    Submit -. includes .-> Validate
    Cancel -. includes .-> Validate
    TechnicianReview -. includes .-> Audit
    TechnicianReview -. includes .-> Validate
    AdvisorReview -. includes .-> Audit
    DeanReview -. includes .-> Audit
    AdvisorReview -. includes .-> Validate
    DeanReview -. includes .-> Validate
~~~

Google authentication identifies the user. Trusted database profiles authorize each use case. Students cannot choose their role, Technicians act only at technical review, Advisors can review only Student requests that selected them, and only Deans manage roles. Technicians and Deans manage PC inventory. Student requests use Technician, selected Advisor, then Dean review; Technician requests start at Advisor review; Advisor requests start at Dean review; and Dean requests are immediately approved only after validation. Every requester role may cancel only its own active future booking with a reason. Account deletion currently means recoverable profile deactivation; permanent erasure remains planned.
