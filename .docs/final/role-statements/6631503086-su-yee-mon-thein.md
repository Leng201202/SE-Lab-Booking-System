# Role statement — Su Yee Mon Thein

**Student ID:** 6631503086  
**Role:** QA

I owned verification reporting and helped the team communicate defects and release risks accurately. My work included the testing and evidence sections of the presentation, the bug-log process, and the distinction between a local check, a deployment-dependent check, and an unresolved security or policy requirement. I focused on reproducibility: claims should identify what was tested, what passed, what was not rerun, and what still needs an environment or stakeholder decision.

The current evidence baseline records 11 passing frontend tests, passing ESLint, and a successful production build with a non-blocking bundle-size warning. The canonical database suite contains 147 pgTAP assertions, while an obsolete duplicate account-deletion test still carries the former 7-day recovery expectation and is tracked as BUG-09. I helped ensure that this limitation is visible instead of reporting an unverified database pass. I also helped summarize the security review, including the six high-priority release risks that remain open.

Evidence: [known issues and bug log](../../05-testing/known-issues.md), [prototype verification status](../../02-design/prototype.md), [security review](../../03-compliance/security-review.md), [legal trace](../../03-compliance/legal-requirement-trace.md), and the [presentation verification section](../../../script.md#slide-5-verification-status).

**AI disclosure:** AI tools assisted with some testing and documentation drafts, but I checked the reported results against repository evidence. I did not treat generated output as proof of a pass; final QA reporting remains my responsibility.
