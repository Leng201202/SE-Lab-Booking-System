<!-- DRAFT prepared for Sai Shang Hlang with AI help. Rewrite in your own words (especially section 3) before pushing. -->
## Reflection

**Sai Shang Hlang · 6631503129 · Tech Lead · Team FLUX**

### 1. Lessons learned: building with AI

As Tech Lead I set the architecture: a React frontend with Supabase/PostgreSQL, where the database is the real security boundary. **What got better:** AI helped us move from a browser-only demo with mock users and `localStorage` to a real backend with Google sign-in, Row Level Security on all four tables, 12 controlled RPC functions, and a PostgreSQL exclusion constraint that blocks double booking even for simultaneous requests. AI could draft migrations and policies quickly, and our rules in `agent.md` (security-definer functions with an empty `search_path`, a new migration for every change) kept those drafts consistent.

**What got worse:** speed created drift. Some SQL was run by hand on the hosted database, so the remote migration history fell 11 versions behind the code, and we had duplicate migration files. When the per-booking Advisor migration was not pushed, the live site failed with "Advisors could not be loaded". AI makes writing code cheap. Release discipline, migration hygiene and reviewing security-critical SQL now matter more, not less. Teamwork also needed clearer ownership of who deploys what.

### 2. Where I stand in the AI era

AI can produce code faster than I can, so my value is in architecture and judgement: choosing where rules must be enforced, spotting unsafe generated SQL, and keeping the system deployable. I need to keep deepening my database and security knowledge to stay ahead of the tools.

### 3. My plan

**Next year:** strengthen my backend, database and DevOps skills (CI/CD, migrations, cloud deployment) and work as a backend or full-stack developer intern. **In five years:** be a senior or lead engineer who designs secure systems and leads a team that uses AI safely in production.
