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
    AdvisorReview((Review assigned Student request))
    DeanReview((Give final decision))
    Audit((Record approval event))
    Validate((Validate role, PC, interval, and conflict))
    Configure((Configure roles, assignments, and PCs))

    Visitor --> SignIn
    Student --> Availability
    Student --> Inventory
    Student --> Submit
    Student --> OwnRecords
    Advisor --> Availability
    Advisor --> AdvisorReview
    Dean --> Availability
    Dean --> DeanReview
    Operator --> Configure

    Submit -. includes .-> Validate
    AdvisorReview -. includes .-> Audit
    DeanReview -. includes .-> Audit
    AdvisorReview -. includes .-> Validate
    DeanReview -. includes .-> Validate
~~~

Google authentication identifies the user. Trusted database profiles authorize each use case. Students cannot choose their role, Advisors cannot review unassigned Students, and Deans cannot bypass the Advisor stage.
