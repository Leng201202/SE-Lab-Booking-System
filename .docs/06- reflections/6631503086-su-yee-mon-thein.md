## Reflection

**Su Yee Mon Thein · 6631503086 · QA / Test · Team FLUX**

### 1. Lessons learned: building with AI

I used Claude to help write the proposal update, the requirements package, the use-case and user-flow diagrams, and the Student ID auto-fill from Lamduan email. As QA I also owned the test reports and bug log. **What got better:** AI made it fast to write tests and documents. Our project grew from 6 frontend tests and no database tests to 11 frontend tests and 147 pgTAP assertions covering RLS, role boundaries, approval stages and overlap rejection. The Student ID feature that AI helped write is checked by those security assertions, not just trusted.

**What got worse:** AI output looks finished even when it is not verified. My hardest QA job was separating "written" from "proven". The 147 assertions were defined, but on the final run we could not start local Supabase, so I reported them as not re-verified. We also found an old duplicate test still expecting a 7-day recovery window instead of 90 days (BUG-09). Fast AI changes meant tests and documents could quietly fall out of date. Quality depends on people checking evidence, not on how much AI produces.

### 2. Where I stand in the AI era

AI can write tests, but it cannot decide what is worth testing or whether a pass is real. I see my value in critical verification: reproducible evidence, honest reporting and finding the gap between what a tool claims and what the system does.

### 3. My plan

**Next year:** learn test automation properly (end-to-end testing and CI pipelines) and get a QA or software-testing internship. **In five years:** work as a QA or test automation engineer who specialises in checking AI-assisted software for correctness, security and accessibility.
