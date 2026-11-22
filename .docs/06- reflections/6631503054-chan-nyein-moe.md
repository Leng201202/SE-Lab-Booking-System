## Reflection

**Chan Nyein Moe · 6631503054 · Designer · Team FLUX**

### 1. Lessons learned: building with AI

AI changed how fast an idea could go from a design to working code. When our workflow changed from a permanent Student–Advisor assignment to choosing an Advisor for each booking, I first redrew the journeys and use-case diagram. With Claude Code I then turned that design into the change itself: a database migration, the new Advisor field on the booking form, and 27 new pgTAP tests (19 files). **What got better:** as a Designer I could check that the real behaviour matched my diagrams, instead of handing over a picture and hoping. Running the full test suite also exposed tests that were already failing before my change.

**What got worse:** code was produced faster than our process could deploy it safely. The feature worked locally, but the hosted site showed "Advisors could not be loaded" because the migration had never been pushed. Our remote migration history was also 11 versions behind, because some SQL had been run by hand. AI made writing code cheap. Reviewing it, keeping documents in sync and deploying it became the real work. AI also cannot replace talking to users: the five interviews came from people, not prompts.

### 2. Where I stand in the AI era

Today I am a junior who can use AI tools to build working software. My value is not typing code. It is understanding users, deciding what should be built, and judging whether the AI's output is correct, secure and matches the design. I still need stronger fundamentals in databases, security and testing so that I can catch AI mistakes instead of trusting them.

### 3. My plan

**Next year:** finish my degree, build two portfolio projects using design-first, test-backed development, and get an internship in UX or product design. **In five years:** work as a product designer or design engineer who connects user research, interface design and AI-assisted development, and leads small teams that use AI responsibly.
